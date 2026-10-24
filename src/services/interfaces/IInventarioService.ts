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

export interface IInventarioService {
  obtenerInventario(
    idSede: number,
    tipo: TipoInventario,
    filtros?: FiltrosInventario,
  ): Promise<InventarioRespuesta>;

  obtenerTiposMovimiento(): Promise<TipoMovimiento[]>;

  obtenerResponsable(): Promise<Responsable>;

  obtenerKardex(
    idSede: number,
    idProducto: number,
    desde?: string,
    hasta?: string,
  ): Promise<KardexRespuesta>;

  registrarMovimiento(idSede: number, input: RegistrarMovimientoInput): Promise<ResultadoMovimiento>;
}