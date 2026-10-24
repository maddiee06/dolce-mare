import { Usuario } from "../../models/Usuario";

export interface IUsuarioDAO {
  verificarCredenciales(
    usuario: string,
    password: string,
  ): Promise<Usuario | null>;

  obtenerUsuarioActual(): Promise<Usuario | null>;

  cerrarSesion(): Promise<void>;

  obtenerPorId(id: string): Promise<Usuario | null>;
}
