import { IAuthService, LoginResultado } from "./interfaces/IAuthService";
import { IUsuarioDAO } from "../dao/interfaces/IUsuarioDAO";
import { Usuario } from "../models/Usuario";

const ERROR_CREDENCIALES = "Usuario o contraseña incorrectos.";
const RUTA_DESPUES_DEL_LOGIN = "/seleccionsucursal";

export class AuthService implements IAuthService {
  constructor(private readonly usuarioDAO: IUsuarioDAO) {}

  async login(usuario: string, password: string): Promise<LoginResultado> {
    const user = await this.usuarioDAO.verificarCredenciales(usuario, password);
    if (!user) return { ok: false, status: 401, error: ERROR_CREDENCIALES };

    return {
      ok: true,
      usuario: user,
      redirect: RUTA_DESPUES_DEL_LOGIN,
    };
  }

  obtenerSesion(): Promise<Usuario | null> {
    return this.usuarioDAO.obtenerUsuarioActual();
  }

  logout(): Promise<void> {
    return this.usuarioDAO.cerrarSesion();
  }
}
