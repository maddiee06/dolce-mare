import type {
  FiltrosInventario,
  InventarioRespuesta,
  KardexRespuesta,
  RegistrarMovimientoInput,
  ResultadoMovimiento,
  Responsable,
  TipoInventario,
  TipoMovimiento,
} from "../../models/Inventario";

/**
 * Contrato del servicio de inventario.
 * Define la lógica de negocio para consulta de stock, kardex y movimientos.
 */
export interface IInventarioService {
  /**
   * Obtiene el stock clasificado por estado y agrupado por categoría.
   */
  obtenerInventario(
    idSede: number,
    tipo: TipoInventario,
    filtros?: FiltrosInventario,
  ): Promise<InventarioRespuesta>;

  /**
   * Obtiene los tipos de movimiento manuales permitidos.
   */
  obtenerTiposMovimiento(): Promise<TipoMovimiento[]>;

  /**
   * Obtiene los datos del usuario responsable en sesión.
   */
  obtenerResponsable(): Promise<Responsable>;

  /**
   * Calcula el Kardex de un artículo con su saldo inicial y movimientos.
   */
  obtenerKardex(
    idSede: number,
    idProducto: number,
    desde?: string,
    hasta?: string,
  ): Promise<KardexRespuesta>;

  /**
   * Valida y registra un ajuste o merma de inventario.
   */
  registrarMovimiento(idSede: number, input: RegistrarMovimientoInput): Promise<ResultadoMovimiento>;
}
