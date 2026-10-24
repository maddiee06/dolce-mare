import type { SupabaseClient } from "@supabase/supabase-js";
import { IUsuarioDAO } from "../interfaces/IUsuarioDAO";
import { Usuario } from "../../models/Usuario";

// Debe ser el mismo dominio con el que se crearon los usuarios en Supabase Auth.
const DOMINIO_LOGIN = "dolcemare.internal";
const FORMATO_USUARIO = /^[a-z0-9._-]{3,50}$/;

type Rol = { nombre: string; estado: boolean };
type FilaUsuario = {
  id_usuario: number;
  nombres: string;
  apellidos: string;
  usuario: string;
  estado: boolean;
  roles: Rol | Rol[] | null;
};

const COLUMNAS =
  "id_usuario, nombres, apellidos, usuario, estado, roles(nombre, estado)";

export class UsuarioDAO implements IUsuarioDAO {
  constructor(private readonly supabase: SupabaseClient) {}

  async verificarCredenciales(
    usuario: string,
    password: string,
  ): Promise<Usuario | null> {
    const login = usuario.trim().toLowerCase();
    if (!FORMATO_USUARIO.test(login) || !password) return null;

    // 1. Primero se autentica: el correo interno se arma con el usuario.
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: `${login}@${DOMINIO_LOGIN}`,
      password,
    });
    if (error || !data.user) return null;

    // 2. Ya con la sesión iniciada, se lee el perfil (las políticas RLS lo permiten).
    const perfil = await this.obtenerPorAuthId(data.user.id);
    if (!perfil) {
      await this.supabase.auth.signOut();
      return null;
    }
    return perfil;
  }

  async obtenerUsuarioActual(): Promise<Usuario | null> {
    // getUser() valida el token con Supabase; no confía solo en la cookie.
    const { data, error } = await this.supabase.auth.getUser();
    if (error || !data.user) return null;
    return this.obtenerPorAuthId(data.user.id);
  }

  async cerrarSesion(): Promise<void> {
    await this.supabase.auth.signOut();
  }

  async obtenerPorId(id: string): Promise<Usuario | null> {
    const { data, error } = await this.supabase
      .from("usuarios")
      .select(COLUMNAS)
      .eq("id_usuario", id)
      .maybeSingle();
    return this.mapear(error ? null : (data as unknown as FilaUsuario | null));
  }

  private async obtenerPorAuthId(idAuth: string): Promise<Usuario | null> {
    const { data, error } = await this.supabase
      .from("usuarios")
      .select(COLUMNAS)
      .eq("id_auth", idAuth)
      .maybeSingle();
    return this.mapear(error ? null : (data as unknown as FilaUsuario | null));
  }

  // Solo devuelve usuarios y roles activos, con un rol conocido.
  private mapear(fila: FilaUsuario | null): Usuario | null {
    if (!fila || !fila.estado) return null;
    const rol = Array.isArray(fila.roles) ? fila.roles[0] : fila.roles;
    if (!rol || !rol.estado) return null;
    if (rol.nombre !== "Admin" && rol.nombre !== "Cajero") return null;
    return {
      id: String(fila.id_usuario),
      nombres: fila.nombres,
      apellidos: fila.apellidos,
      usuario: fila.usuario,
      rol: rol.nombre,
    };
  }
}
