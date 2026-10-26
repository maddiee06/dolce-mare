import { IDashboardDAO } from "../dao/interfaces/IDashboardDAO";
import { connection } from "next/server";

/**
 * Controlador del Dashboard Administrativo
 * Agrupa y procesa las métricas de negocio para la vista principal:
 * ventas del día, comparativa con ayer, cuentas abiertas, gráfico semanal,
 * top sabores, métodos de pago, rendimiento del personal y alertas de stock.
 */
export class DashboardController {
  constructor(private dao: IDashboardDAO) {}

  /**
   * Obtiene y calcula todas las métricas del dashboard para una sede específica.
   * Realiza consultas concurrentes a la base de datos y formatea los datos
   * listos para ser renderizados por los componentes del dashboard.
   */
  async getDashboardCompleto(idSede: number) {
    // Asegura que la conexión a base de datos esté lista en Server Components
    await connection();

    // 1. Definición de rangos temporales para las consultas
    const ahora = new Date();
    const inicioHoy = new Date(
      ahora.getFullYear(),
      ahora.getMonth(),
      ahora.getDate(),
    );

    // Mismo punto temporal del día anterior para calcular la variación porcentual justa
    const ayer = new Date(ahora);
    ayer.setDate(ayer.getDate() - 1);
    const inicioAyer = new Date(inicioHoy);
    inicioAyer.setDate(inicioAyer.getDate() - 1);

    // Ventana de los últimos 7 días para el gráfico de barras semanal
    const hace7Dias = new Date(inicioHoy);
    hace7Dias.setDate(hace7Dias.getDate() - 6);

    // 2. Ejecución de consultas concurrentes a través del DAO
    const [
      ventasHoy,
      ventasAyer,
      cuentasAbiertas,
      ventas7Dias,
      detallesSabores,
      ventasMetodos,
      ventasPersonal,
      stockAlertas,
      mermas,
    ] = await Promise.all([
      this.dao.getVentasRango(
        inicioHoy.toISOString(),
        ahora.toISOString(),
        idSede,
      ),
      this.dao.getVentasRango(
        inicioAyer.toISOString(),
        ayer.toISOString(),
        idSede,
      ),
      this.dao.getCuentasAbiertas(idSede),
      this.dao.getVentasUltimos7Dias(idSede, hace7Dias.toISOString()),
      this.dao.getDetallesVentaHoy(
        idSede,
        inicioHoy.toISOString(),
        ahora.toISOString(),
      ),
      this.dao.getMetodosPagoHoy(
        idSede,
        inicioHoy.toISOString(),
        ahora.toISOString(),
      ),
      this.dao.getVentasPorPersonalHoy(
        idSede,
        inicioHoy.toISOString(),
        ahora.toISOString(),
      ),
      this.dao.getAlertasStock(idSede),
      this.dao.getMermasRecientes(idSede),
    ]);

    // 3. Cálculo de métricas para las tarjetas de KPI (Resumen General)
    const totalVentasHoy = ventasHoy.reduce(
      (sum, v) => sum + Number(v.total),
      0,
    );
    const totalVentasAyer = ventasAyer.reduce(
      (sum, v) => sum + Number(v.total),
      0,
    );

    // Variación porcentual: compara las ventas de hoy vs ayer a la misma hora exacta
    const varVentas =
      totalVentasAyer > 0
        ? ((totalVentasHoy - totalVentasAyer) / totalVentasAyer) * 100
        : 0;

    // 4. Mapeo de ventas de los últimos 7 días para la gráfica semanal
    const evolucionMapeada = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(hace7Dias);
      d.setDate(d.getDate() + i);
      const diaStr = d.toISOString().split("T")[0];

      const totalDia = ventas7Dias
        .filter((v) => v.fecha_venta.startsWith(diaStr))
        .reduce((sum, v) => sum + Number(v.total), 0);

      const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
      return {
        dia: `${diasSemana[d.getDay()]} ${d.getDate().toString().padStart(2, "0")}`,
        total: totalDia,
        esHoy: i === 6,
      };
    });
    const acumulado7Dias = evolucionMapeada.reduce(
      (sum, d) => sum + d.total,
      0,
    );

    // 5. Agrupación y ordenamiento del Top Sabores más pedidos hoy
    const conteoSabores: Record<string, { cantidad: number; nivel: string }> =
      {};
    detallesSabores.forEach((d) => {
      const nombre = d.productos?.nombre || "Desconocido";
      const nivel = d.productos?.categorias?.nombre || "Clásico";
      if (!conteoSabores[nombre])
        conteoSabores[nombre] = { cantidad: 0, nivel };
      conteoSabores[nombre].cantidad += Number(d.cantidad);
    });

    const maxSabor = Math.max(
      ...Object.values(conteoSabores).map((s) => s.cantidad),
      1,
    );
    const saboresOrdenados = Object.entries(conteoSabores)
      .map(([nombre, datos]) => ({
        nombre,
        nivel: datos.nivel,
        cantidad: datos.cantidad,
        porcentaje: (datos.cantidad / maxSabor) * 100,
      }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5); // Solo los primeros 5 puestos

    // 6. Distribución de ventas por método de pago (Efectivo, Yape, Plin, Tarjetas)
    const conteoMetodos: Record<string, number> = {};
    ventasMetodos.forEach((v) => {
      const metodo = v.metodos_pago?.nombre || "Otros";
      conteoMetodos[metodo] = (conteoMetodos[metodo] || 0) + Number(v.total);
    });

    const metodosProcesados = Object.entries(conteoMetodos)
      .map(([nombre, total]) => {
        const porcentaje =
          totalVentasHoy > 0 ? (total / totalVentasHoy) * 100 : 0;
        return {
          nombre,
          monto: `S/ ${total.toFixed(2)}`,
          porcentaje: Number(porcentaje.toFixed(1)),
          porcentajeBarra: porcentaje,
          tipo: nombre.toLowerCase(),
        };
      })
      .sort((a, b) => b.porcentaje - a.porcentaje);

    // 7. Rendimiento del personal (número de ventas y ticket promedio por colaborador)
    const conteoPersonal: Record<
      number,
      { nombre: string; ventas: number; total: number }
    > = {};
    ventasPersonal.forEach((v) => {
      if (!v.usuarios) return;
      const id = v.usuarios.id_usuario;
      const nombre = `${v.usuarios.nombres.split(" ")[0]} ${v.usuarios.apellidos.split(" ")[0]}`;

      if (!conteoPersonal[id])
        conteoPersonal[id] = { nombre, ventas: 0, total: 0 };
      conteoPersonal[id].ventas += 1;
      conteoPersonal[id].total += Number(v.total);
    });

    const personalOrdenado = Object.entries(conteoPersonal)
      .map(([id, datos]) => ({
        id: Number(id),
        nombre: datos.nombre,
        ventas: datos.ventas,
        ticket: `S/ ${(datos.total / datos.ventas).toFixed(2)}`,
      }))
      .sort(
        (a, b) =>
          parseFloat(b.ticket.replace("S/ ", "")) -
          parseFloat(a.ticket.replace("S/ ", "")),
      );

    // 8. Empaquetado de datos listos para el consumo de los componentes
    return {
      resumen: {
        ventasHoy: totalVentasHoy,
        variacionVentas: varVentas,
        cantidadVentas: ventasHoy.length,
        ticketPromedio:
          ventasHoy.length > 0 ? totalVentasHoy / ventasHoy.length : 0,
        cuentasAbiertas: cuentasAbiertas.length,
        montoPorCobrar: cuentasAbiertas.reduce(
          (sum, p) => sum + Number(p.total),
          0,
        ),
      },
      evolucion: { datos: evolucionMapeada, acumulado: acumulado7Dias },
      sabores: saboresOrdenados,
      metodos: metodosProcesados,
      personal: personalOrdenado,
      stock: stockAlertas.map((s) => ({
        nombre: s.productos?.nombre || "Desconocido",
        minimo: `${s.stock_minimo} und`,
        actual: `${s.stock_actual} und`,
      })),
      mermas: mermas.map((m) => ({
        nombre: m.productos?.nombre || "Desconocido",
        motivo: m.motivo,
        cantidad: `-${m.cantidad}`,
      })),
    };
  }
}
