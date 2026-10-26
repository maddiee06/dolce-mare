import { SedeDAO } from "../dao/supabase/SedeDAO";
import { Sede } from "../models/Sede";

// Instancia única del DAO para consultar las sedes
const sedeDao = new SedeDAO();

/**
 * Obtiene todas las sedes o sucursales que se encuentran activas en el sistema.
 * Se utiliza principalmente en la pantalla de selección de sucursal (/seleccionsucursal)
 * para que el usuario elija dónde va a operar antes de entrar al panel.
 */
export async function obtenerSedesActivas(): Promise<Sede[]> {
  return sedeDao.listarSedesActivas();
}
