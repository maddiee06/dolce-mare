import type { IInventarioDAO } from "../dao/interfaces/IInventarioDAO";
import type { IInventarioService } from "./interfaces/IInventarioService";
import {
  InventarioError,
  type ArticuloInventario,
  type ContextoUsuario,
  type FiltrosInventario,
  type GrupoInventario,
  type InventarioRespuesta,
  type KardexRespuesta,
  type RegistrarMovimientoInput,
  type Responsable,
  type ResultadoMovimiento,
  type ResumenInventario,
  type TipoInventario,
  type TipoMovimiento,
} from "../models/Inventario";
import {
  calcularEstadoStock,
  esCategoriaDeTipo,
  esMerma,
  esMovimientoManual,
  normalizar,
  prioridadCategoria,
} from "../utils/estadoStock";
import {
  diasEntre,
  esFechaValida,
  finDiaLimaISO,
  hoyLima,
  inicioDiaLimaISO,
  sumarDias,
} from "../utils/fechas";

/**
 * Servicio de Inventario
 * Aplica todas las reglas de negocio sobre el stock:
 * validación de permisos de usuario, cálculo de estados (disponible, bajo, agotado),
 * agrupación por categorías, generación de saldos para el Kardex
 * y control de movimientos manuales.
 */
export class InventarioService implements IInventarioService {
  constructor(private readonly dao: IInventarioDAO) {}

  /**
   * Comprueba que exista una sesión de usuario válida y que la sede
   * enviada esté registrada y activa en el sistema.
   */
  private async validarAcceso(idSede: number): Promise<ContextoUsuario> {
    const ctx = await this.dao.obtenerContextoUsuario();
    if (!ctx) throw new InventarioError("Sesión no válida", 401);

    if (!(await this.dao.sedeEstaActiva(idSede))) {
      throw new InventarioError(
        "La sede seleccionada no es válida. Vuelve a elegir tu sucursal.",
        403,
      );
    }
    return ctx;
  }

  /**
   * Calcula el total de artículos y cuántos requieren reposición
   * según su estado actual (stock bajo o agotado).
   */
  private calcularResumen(articulos: ArticuloInventario[]): ResumenInventario {
    const stockBajo = articulos.filter((a) => a.estado === "stock_bajo").length;
    const agotados = articulos.filter((a) => a.estado === "agotado").length;
    return {
      total: articulos.length,
      disponibles: articulos.length - stockBajo - agotados,
      stockBajo,
      agotados,
      necesitanReposicion: stockBajo + agotados,
    };
  }

  /**
   * Lista el inventario de una sede según el tipo ('sabores' o 'envases').
   * Aplica filtros opcionales de búsqueda y estado, y agrupa los productos
   * por su categoría ordenándolos según la prioridad definida.
   */
  async obtenerInventario(
    idSede: number,
    tipo: TipoInventario,
    filtros: FiltrosInventario = {},
  ): Promise<InventarioRespuesta> {
    await this.validarAcceso(idSede);

    // Obtener los registros de stock de la sede desde la base de datos
    const filas = await this.dao.obtenerStockPorSede(idSede);
    const articulos: ArticuloInventario[] = filas
      .filter((f) => esCategoriaDeTipo(f.categoria, tipo))
      .map((f) => ({
        ...f,
        estado: calcularEstadoStock(f.stockActual, f.stockMinimo),
      }));

    // El resumen cuantitativo se calcula sobre la categoría completa
    const resumen = this.calcularResumen(articulos);

    // Filtro por texto y estado seleccionado
    const q = normalizar(filtros.busqueda ?? "");
    const filtrados = articulos.filter(
      (a) =>
        (!q || normalizar(a.nombre).includes(q)) &&
        (!filtros.estado || a.estado === filtros.estado),
    );

    // Agrupación de artículos por nombre de categoría
    const porCategoria = new Map<string, ArticuloInventario[]>();
    for (const a of filtrados) {
      const lista = porCategoria.get(a.categoria) ?? [];
      lista.push(a);
      porCategoria.set(a.categoria, lista);
    }

    const grupos: GrupoInventario[] = [...porCategoria.entries()]
      .map(([categoria, lista]) => ({
        categoria,
        articulos: lista.sort((x, y) => x.nombre.localeCompare(y.nombre, "es")),
      }))
      .sort(
        (a, b) =>
          prioridadCategoria(a.categoria, tipo) - prioridadCategoria(b.categoria, tipo),
      );

    return { grupos, resumen };
  }

  /**
   * Obtiene la lista de tipos de movimiento que pueden ser registrados
   * manualmente por un usuario (ej. Entrada por compra, Merma, Ajuste).
   */
  async obtenerTiposMovimiento(): Promise<TipoMovimiento[]> {
    const ctx = await this.dao.obtenerContextoUsuario();
    if (!ctx) throw new InventarioError("Sesión no válida", 401);

    const tipos = await this.dao.obtenerTiposMovimiento();
    return tipos.filter((t) => esMovimientoManual(t.nombre));
  }

  /**
   * Retorna el nombre y rol del usuario actual que está realizando operaciones.
   */
  async obtenerResponsable(): Promise<Responsable> {
    const ctx = await this.dao.obtenerContextoUsuario();
    if (!ctx) throw new InventarioError("Sesión no válida", 401);
    return { nombre: ctx.nombre, rol: ctx.rol };
  }

  /**
   * Genera el Kardex valorizado de un artículo para un rango de fechas.
   * Valida el formato de fechas, calcula el saldo inicial con movimientos previos
   * y consolida entradas, salidas y saldo resultante.
   */
  async obtenerKardex(
    idSede: number,
    idProducto: number,
    desde?: string,
    hasta?: string,
  ): Promise<KardexRespuesta> {
    await this.validarAcceso(idSede);

    // Por defecto consulta los últimos 30 días con la hora de Lima
    const fin = hasta ?? hoyLima();
    const ini = desde ?? sumarDias(fin, -30);

    // Validaciones de fechas
    if (!esFechaValida(ini) || !esFechaValida(fin)) {
      throw new InventarioError("Las fechas deben tener el formato AAAA-MM-DD", 400);
    }
    if (ini > fin) {
      throw new InventarioError("La fecha 'Desde' no puede ser posterior a 'Hasta'", 400);
    }
    if (diasEntre(ini, fin) > 366) {
      throw new InventarioError("El periodo no puede superar 1 año", 400);
    }

    // Verificar que el artículo exista en la sede
    const fila = await this.dao.obtenerStockProducto(idSede, idProducto);
    if (!fila) throw new InventarioError("El artículo no existe en esta sede", 404);

    const desdeISO = inicioDiaLimaISO(ini);
    const hastaISO = finDiaLimaISO(fin);

    // Consultar movimientos dentro del rango y el saldo inmediatamente anterior
    const [movimientos, saldoAntes] = await Promise.all([
      this.dao.obtenerKardex(idSede, idProducto, desdeISO, hastaISO),
      this.dao.obtenerSaldoAntesDe(idSede, idProducto, desdeISO),
    ]);

    // Determinación del saldo inicial del periodo consultado
    let saldoInicial = saldoAntes ?? movimientos[0]?.stockAnterior;
    if (saldoInicial === undefined) {
      saldoInicial =
        (await this.dao.obtenerSaldoDespuesDe(idSede, idProducto, hastaISO)) ??
        fila.stockActual;
    }

    const r2 = (n: number) => Math.round(n * 100) / 100;
    const entradas = movimientos.filter((m) => m.afectaStock === "suma");
    const salidas = movimientos.filter((m) => m.afectaStock === "resta");

    return {
      articulo: { ...fila, estado: calcularEstadoStock(fila.stockActual, fila.stockMinimo) },
      desde: ini,
      hasta: fin,
      resumen: {
        saldoInicial,
        entradas: r2(entradas.reduce((s, m) => s + m.cantidad, 0)),
        salidas: r2(salidas.reduce((s, m) => s + m.cantidad, 0)),
        saldoActual: movimientos.length
          ? movimientos[movimientos.length - 1].stockResultante
          : saldoInicial,
        numEntradas: entradas.length,
        numSalidas: salidas.length,
      },
      movimientos,
    };
  }

  /**
   * Registra un nuevo movimiento manual de inventario.
   * Valida cantidades numéricas positivas, tope de decimales y longitud del motivo.
   */
  async registrarMovimiento(
    idSede: number,
    input: RegistrarMovimientoInput,
  ): Promise<ResultadoMovimiento> {
    const ctx = await this.validarAcceso(idSede);

    // Validación estricta de la cantidad
    const { cantidad } = input;
    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      throw new InventarioError("La cantidad debe ser mayor a 0", 400);
    }
    if (cantidad > 100000) {
      throw new InventarioError("La cantidad es demasiado grande", 400);
    }
    if (Math.abs(cantidad * 100 - Math.round(cantidad * 100)) > 1e-6) {
      throw new InventarioError("La cantidad admite máximo 2 decimales", 400);
    }

    // Validación del motivo opcional
    const motivo = input.motivo?.trim() || undefined;
    if (motivo && motivo.length > 255) {
      throw new InventarioError("El motivo no puede pasar de 255 caracteres", 400);
    }

    // Verificar que el tipo de movimiento sea manual y permitido
    const tipos = await this.dao.obtenerTiposMovimiento();
    const tipo = tipos.find((t) => t.idTipoMovimiento === input.idTipoMovimiento);
    if (!tipo || !esMovimientoManual(tipo.nombre)) {
      throw new InventarioError("Tipo de movimiento no permitido", 422);
    }

    // Delegar el guardado y actualización en base de datos al DAO
    return this.dao.registrarMovimiento({
      idSede,
      idProducto: input.idProducto,
      idTipoMovimiento: tipo.idTipoMovimiento,
      idUsuario: ctx.idUsuario,
      cantidad,
      afectaStock: tipo.afectaStock,
      esMerma: esMerma(tipo.nombre),
      motivo,
    });
  }
}
