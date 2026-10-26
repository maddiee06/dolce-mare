import { IDashboardDAO } from "../dao/interfaces/IDashboardDAO";
import { connection } from "next/server";

export class DashboardController {
  constructor(private dao: IDashboardDAO) {}

  async getDashboardCompleto(idSede: number) {
    await connection();

    const ahora = new Date();
    const inicioHoy = new Date(
      ahora.getFullYear(),
      ahora.getMonth(),
      ahora.getDate(),
    );

    const ayer = new Date(ahora);
    ayer.setDate(ayer.getDate() - 1);
    const inicioAyer = new Date(inicioHoy);
    inicioAyer.setDate(inicioAyer.getDate() - 1);

    const hace7Dias = new Date(inicioHoy);
    hace7Dias.setDate(hace7Dias.getDate() - 6);

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

    // Resumen General
    const totalVentasHoy = ventasHoy.reduce(
      (sum, v) => sum + Number(v.total),
      0,
    );
    const totalVentasAyer = ventasAyer.reduce(
      (sum, v) => sum + Number(v.total),
      0,
    );
    const varVentas =
      totalVentasAyer > 0
        ? ((totalVentasHoy - totalVentasAyer) / totalVentasAyer) * 100
        : 0;

    // Evolución de Ventas
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

    // Top Sabores
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
      .slice(0, 5);

    // Métodos de pago
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

    // Ranking Personal
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

    // Retornamos los datos a la vista
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
