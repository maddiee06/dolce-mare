import type {
  ContextoUsuario,
  FilaStock,
  MovimientoKardex,
  NuevoMovimiento,
  ResultadoMovimiento,
  TipoMovimiento,
} from "../../models/Inventario";

export interface IInventarioDAO {
  obtenerContextoUsuario(): Promise<ContextoUsuario | null>;
  sedeEstaActiva(idSede: number): Promise<boolean>;
  obtenerStockPorSede(idSede: number): Promise<FilaStock[]>;
  obtenerStockProducto(idSede: number, idProducto: number): Promise<FilaStock | null>;
  obtenerTiposMovimiento(): Promise<TipoMovimiento[]>;
  /** Movimientos del periodo, del más antiguo al más reciente. */
  obtenerKardex(
    idSede: number,
    idProducto: number,
    desdeISO: string,
    hastaISO: string,
  ): Promise<MovimientoKardex[]>;
  /** Saldo resultante del último movimiento anterior a la fecha, o null. */
  obtenerSaldoAntesDe(idSede: number, idProducto: number, isoFecha: string): Promise<number | null>;
  /** Saldo anterior del primer movimiento posterior a la fecha, o null. */
  obtenerSaldoDespuesDe(idSede: number, idProducto: number, isoFecha: string): Promise<number | null>;
  registrarMovimiento(mov: NuevoMovimiento): Promise<ResultadoMovimiento>;
}