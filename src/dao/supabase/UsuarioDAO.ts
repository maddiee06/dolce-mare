import type { SupabaseClient } from "@supabase/supabase-js";
import { IUsuarioDAO } from "../interfaces/IUsuarioDAO";
import { Usuario, RolNombre } from "../../models/Usuario";

export class UsuarioDAO implements IUsuarioDAO {
  constructor(private readonly supabase: SupabaseClient) {}

  async verificarCredenciales(
    usuario: string,
    password: string,
  ): Promise<Usuario | null> {
    const { data, error } = await this.supabase.rpc("verificar_login", {
      p_usuario: usuario,
      p_password: password,
    });

    if (error || !data) return null;

    return {
      id: String(data.id),
      nombres: data.nombres,
      apellidos: data.apellidos,
      usuario: data.usuario,
      rol: String(data.rol) as RolNombre,
    };
  }

  async obtenerPorId(id: string): Promise<Usuario | null> {
    const { data, error } = await this.supabase
      .from("usuarios")
      .select("id_usuario, nombres, apellidos, usuario, roles(nombre)")
      .eq("id_usuario", id)
      .single();

    if (error || !data) return null;

    const rolExtraido = Array.isArray(data.roles)
      ? data.roles[0]?.nombre
      : (data.roles as { nombre: string } | null)?.nombre;

    return {
      id: String(data.id_usuario),
      nombres: data.nombres,
      apellidos: data.apellidos,
      usuario: data.usuario,
      rol: String(rolExtraido).toUpperCase() as RolNombre,
    };
  }
}
