import { SedeDAO } from "../dao/supabase/SedeDAO";
import { Sede } from "../models/Sede";

const sedeDao = new SedeDAO();

export async function obtenerSedesActivas(): Promise<Sede[]> {
  return sedeDao.listarSedesActivas();
}
