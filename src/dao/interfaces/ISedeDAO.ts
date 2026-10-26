import { Sede } from "../../models/Sede";

/**
 * Contrato de acceso a datos para la entidad Sede (Sucursales).
 */
export interface ISedeDAO {
  /**
   * Obtiene la lista de sedes físicas disponibles para operar.
   */
  listarSedesActivas(): Promise<Sede[]>;
}
