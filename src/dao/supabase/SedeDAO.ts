import { createClient } from "../../utils/supabase/server";
import { cookies } from "next/headers";
import { Sede } from "../../models/Sede";
import { ISedeDAO } from "../interfaces/ISedeDAO";

/**
 * DAO de Sedes (Implementación Supabase)
 * Accede a la tabla 'sedes' para consultar las sucursales físicas habilitadas de Dolce Mare.
 */
export class SedeDAO implements ISedeDAO {
  /**
   * Consulta todas las sedes con estado activo (estado = true) en la base de datos,
   * ordenadas ascendentemente por su identificador.
   */
  async listarSedesActivas(): Promise<Sede[]> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
      .from("sedes")
      .select("*")
      .eq("estado", true)
      .order("id_sede", { ascending: true });

    if (error) {
      throw new Error(`Error al listar sedes activas: ${error.message}`);
    }

    return data as Sede[];
  }
}
