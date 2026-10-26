import { IAuthService, LoginResultado } from "./interfaces/IAuthService";
import { IUsuarioDAO } from "../dao/interfaces/IUsuarioDAO";

const ERROR_CREDENCIALES = "Usuario o contraseña incorrectos.";

/**
 * Servicio de Autenticación
 * Contiene la lógica de negocio para validar las credenciales de un usuario
 * y determinar la redirección inicial tras iniciar sesión.
 */
export class AuthService implements IAuthService {
  constructor(private readonly usuarioDAO: IUsuarioDAO) {}

  /**
   * Valida usuario y contraseña contra el DAO.
   * Si las credenciales coinciden, retorna el usuario y la ruta '/seleccionsucursal'.
   */
  async login(usuario: string, password: string): Promise<LoginResultado> {
    const user = await this.usuarioDAO.verificarCredenciales(usuario, password);
    if (!user) return { ok: false, status: 401, error: ERROR_CREDENCIALES };

    return {
      ok: true,
      usuario: user,
      redirect: "/seleccionsucursal",
    };
  }
}
