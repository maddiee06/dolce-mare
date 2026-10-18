import { Usuario } from "../../models/Usuario";

export type LoginResultado =
  | { ok: true; usuario: Usuario; redirect: string }
  | { ok: false; status: number; error: string };

export interface IAuthService {
  login(usuario: string, password: string): Promise<LoginResultado>;
}
