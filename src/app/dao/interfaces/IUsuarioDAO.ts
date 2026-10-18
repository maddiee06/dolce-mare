import { Usuario } from "../../models/Usuario";

export interface IUsuarioDAO {
  verificarCredenciales(usuario: string, password: string): Promise<Usuario | null>;
}