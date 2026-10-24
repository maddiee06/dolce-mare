export type TipoInventario = "envases" | "sabores";
export type EstadoStock = "disponible" | "stock_bajo" | "agotado";
export type AfectaStock = "suma" | "resta";

/** Error con código HTTP, lo traduce el controller a la respuesta. */
export class InventarioError extends Error {
  constructor(
    message: string,
    public readonly status: number = 500,
  ) {
    super(message);
    this.name = "InventarioError";
  }
}

/** Fila cruda de stock que devuelve el DAO (producto_sede + productos + categorias). */
export interface FilaStock {
  idProductoSede: number;
  idProducto: number;
  nombre: string;
  unidadMedida: string;
  categoria: string;
  stockActual: number;
  stockMinimo: number;
  disponible: boolean;
}

export interface ArticuloInventario extends FilaStock {
  estado: EstadoStock;
}

export interface GrupoInventario {
  categoria: string;
  articulos: ArticuloInventario[];
}

export interface ResumenInventario {
  total: number;
  disponibles: number;
  stockBajo: number;
  agotados: number;
  /** stock bajo + agotados */
  necesitanReposicion: number;
}

export interface FiltrosInventario {
  busqueda?: string;
  estado?: EstadoStock;
}

export interface InventarioRespuesta {
  grupos: GrupoInventario[];
  resumen: ResumenInventario;
}

export interface TipoMovimiento {
  idTipoMovimiento: number;
  nombre: string;
  afectaStock: AfectaStock;
}

export interface MovimientoKardex {
  idMovimiento: number;
  fecha: string;
  tipo: string;
  afectaStock: AfectaStock;
  cantidad: number;
  stockAnterior: number;
  stockResultante: number;
  motivo: string | null;
  usuario: string;
}

/** Lo que envía el frontend al registrar un movimiento. */
export interface RegistrarMovimientoInput {
  idProducto: number;
  idTipoMovimiento: number;
  cantidad: number;
  motivo?: string;
}

/** Lo que recibe el DAO ya validado y completado por el service. */
export interface NuevoMovimiento {
  idSede: number;
  idProducto: number;
  idTipoMovimiento: number;
  idUsuario: number;
  cantidad: number;
  afectaStock: AfectaStock;
  esMerma: boolean;
  motivo?: string;
}

export interface ResultadoMovimiento {
  idMovimiento: number;
  stockAnterior: number;
  stockResultante: number;
}

export interface ContextoUsuario {
  idUsuario: number;
  esAdmin: boolean;
  nombre: string;
  rol: string;
}

export interface Responsable {
  nombre: string;
  rol: string;
}

export interface ResumenKardex {
  saldoInicial: number;
  entradas: number;
  salidas: number;
  saldoActual: number;
  numEntradas: number;
  numSalidas: number;
}

export interface KardexRespuesta {
  articulo: ArticuloInventario;
  /** AAAA-MM-DD */
  desde: string;
  hasta: string;
  resumen: ResumenKardex;
  /** Del más antiguo al más reciente */
  movimientos: MovimientoKardex[];
}