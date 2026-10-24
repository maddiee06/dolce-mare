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

export class InventarioService implements IInventarioService {
  constructor(private readonly dao: IInventarioDAO) {}

  /** Exige sesión válida y que el usuario pueda operar la sede (o sea Admin). */
    /** Exige sesión válida y una sede activa (la cookie id_sede la fija el selector de sucursal). */
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

  async obtenerInventario(
    idSede: number,
    tipo: TipoInventario,
    filtros: FiltrosInventario = {},
  ): Promise<InventarioRespuesta> {
    await this.validarAcceso(idSede);

    const filas = await this.dao.obtenerStockPorSede(idSede);
    const articulos: ArticuloInventario[] = filas
      .filter((f) => esCategoriaDeTipo(f.categoria, tipo))
      .map((f) => ({
        ...f,
        estado: calcularEstadoStock(f.stockActual, f.stockMinimo),
      }));

    // El resumen cuenta todo el inventario de la pestaña, sin los filtros.
    const resumen = this.calcularResumen(articulos);

    const q = normalizar(filtros.busqueda ?? "");
    const filtrados = articulos.filter(
      (a) =>
        (!q || normalizar(a.nombre).includes(q)) &&
        (!filtros.estado || a.estado === filtros.estado),
    );

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

  async obtenerTiposMovimiento(): Promise<TipoMovimiento[]> {
    const ctx = await this.dao.obtenerContextoUsuario();
    if (!ctx) throw new InventarioError("Sesión no válida", 401);

    const tipos = await this.dao.obtenerTiposMovimiento();
    return tipos.filter((t) => esMovimientoManual(t.nombre));
  }

  async obtenerResponsable(): Promise<Responsable> {
    const ctx = await this.dao.obtenerContextoUsuario();
    if (!ctx) throw new InventarioError("Sesión no válida", 401);
    return { nombre: ctx.nombre, rol: ctx.rol };
  }

  async obtenerKardex(
    idSede: number,
    idProducto: number,
    desde?: string,
    hasta?: string,
  ): Promise<KardexRespuesta> {
    await this.validarAcceso(idSede);

    const fin = hasta ?? hoyLima();
    const ini = desde ?? sumarDias(fin, -30);

    if (!esFechaValida(ini) || !esFechaValida(fin)) {
      throw new InventarioError("Las fechas deben tener el formato AAAA-MM-DD", 400);
    }
    if (ini > fin) {
      throw new InventarioError("La fecha 'Desde' no puede ser posterior a 'Hasta'", 400);
    }
    if (diasEntre(ini, fin) > 366) {
      throw new InventarioError("El periodo no puede superar 1 año", 400);
    }

    const fila = await this.dao.obtenerStockProducto(idSede, idProducto);
    if (!fila) throw new InventarioError("El artículo no existe en esta sede", 404);

    const desdeISO = inicioDiaLimaISO(ini);
    const hastaISO = finDiaLimaISO(fin);

    const [movimientos, saldoAntes] = await Promise.all([
      this.dao.obtenerKardex(idSede, idProducto, desdeISO, hastaISO),
      this.dao.obtenerSaldoAntesDe(idSede, idProducto, desdeISO),
    ]);

    // Saldo inicial: último movimiento previo; si no hay, el "saldo anterior" del primero
    // del periodo; si tampoco hay, el del primer movimiento posterior; si no, el stock actual.
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

  async registrarMovimiento(
    idSede: number,
    input: RegistrarMovimientoInput,
  ): Promise<ResultadoMovimiento> {
    const ctx = await this.validarAcceso(idSede);

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

    const motivo = input.motivo?.trim() || undefined;
    if (motivo && motivo.length > 255) {
      throw new InventarioError("El motivo no puede pasar de 255 caracteres", 400);
    }

    const tipos = await this.dao.obtenerTiposMovimiento();
    const tipo = tipos.find((t) => t.idTipoMovimiento === input.idTipoMovimiento);
    if (!tipo || !esMovimientoManual(tipo.nombre)) {
      throw new InventarioError("Tipo de movimiento no permitido", 422);
    }

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