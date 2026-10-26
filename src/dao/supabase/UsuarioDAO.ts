import type { SupabaseClient } from "@supabase/supabase-js";
import { IUsuarioDAO } from "../interfaces/IUsuarioDAO";
import { Usuario } from "../../models/Usuario";

/**
 * DAO de Usuarios (Implementación Supabase)
 * Realiza las consultas y ejecuciones directas sobre la tabla 'usuarios'
 * y la función almacenada 'verificar_login' en la base de datos.
 */
export class UsuarioDAO implements IUsuarioDAO {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Ejecuta el procedimiento almacenado 'verificar_login' en la base de datos
   * pasando el usuario y contraseña. Si las credenciales coinciden,
   * normaliza el rol (1 para Administrador, 2 para Cajero) y devuelve el objeto Usuario.
   */
  async verificarCredenciales(
    usuario: string,
    password: string,
  ): Promise<Usuario | null> {
    const { data, error } = await this.supabase.rpc("verificar_login", {
      p_usuario: usuario,
      p_password: password,
    });

    if (error || !data) return null;

    // Normalización de roles para asegurar compatibilidad
    let idRolFinal = 2; // Por defecto rol 2 (Cajero)

    if (data.id_rol && !isNaN(Number(data.id_rol))) {
      idRolFinal = Number(data.id_rol);
    } else if (data.rol) {
      const rolTexto = String(data.rol).toLowerCase();
      if (rolTexto.includes("admin")) {
        idRolFinal = 1; // Rol 1 (Administrador)
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

  /**
   * Consulta un usuario por su identificador primario en la tabla 'usuarios'.
   */
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
