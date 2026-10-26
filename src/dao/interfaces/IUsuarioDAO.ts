import { Usuario } from "../../models/Usuario";

/**
 * Contrato de acceso a datos para la entidad Usuario.
 */
export interface IUsuarioDAO {
  /**
   * Verifica si existe un usuario con las credenciales indicadas.
   */
  verificarCredenciales(
    usuario: string,
    password: string,
  ): Promise<Usuario | null>;
}
