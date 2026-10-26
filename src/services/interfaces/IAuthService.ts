import { Usuario } from "../../models/Usuario";

/**
 * Resultado devuelto por el intento de inicio de sesión.
 */
export type LoginResultado =
  | { ok: true; usuario: Usuario; redirect: string }
  | { ok: false; status: number; error: string };

/**
 * Contrato del servicio de autenticación.
 */
export interface IAuthService {
  /**
   * Valida las credenciales ingresadas por el usuario.
   */
  login(usuario: string, password: string): Promise<LoginResultado>;
}
