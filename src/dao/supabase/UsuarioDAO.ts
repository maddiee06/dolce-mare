import type { SupabaseClient } from "@supabase/supabase-js";
import { IUsuarioDAO } from "../interfaces/IUsuarioDAO";
import { Usuario } from "../../models/Usuario";

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

    console.log("Respuesta de verificar_login:", data);

    let idRolFinal = 2;

    if (data.id_rol && !isNaN(Number(data.id_rol))) {
      idRolFinal = Number(data.id_rol);
    } else if (data.rol) {
      const rolTexto = String(data.rol).toLowerCase();

      if (rolTexto.includes("admin")) {
        idRolFinal = 1;
      }
    }

    return {
      id_usuario: Number(data.id_usuario || data.id),
      id_rol: idRolFinal,
      nombres: data.nombres,
      apellidos: data.apellidos,
      usuario: data.usuario,
    } as unknown as Usuario;
  }

  async obtenerPorId(id: string): Promise<Usuario | null> {
    const { data, error } = await this.supabase
      .from("usuarios")
      .select("id_usuario, id_rol, nombres, apellidos, usuario, roles(nombre)")
      .eq("id_usuario", id)
      .single();

    if (error || !data) return null;

    return {
      id_usuario: Number(data.id_usuario),
      id_rol: Number(data.id_rol),
      nombres: data.nombres,
      apellidos: data.apellidos,
      usuario: data.usuario,
    } as unknown as Usuario;
  }
}
