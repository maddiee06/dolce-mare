import type {
  EstadoStock,
  InventarioRespuesta,
  KardexRespuesta,
  RegistrarMovimientoInput,
  ResultadoMovimiento,
  Responsable,
  TipoInventario,
  TipoMovimiento,
} from "../models/Inventario";

/**
 * Cliente HTTP del Inventario para el Frontend
 * Centraliza las llamadas fetch a las rutas API internas (/api/inventario/...)
 * evitando duplicar URLs y manejo de errores en los componentes de la interfaz.
 */

/**
 * Procesa la respuesta de un fetch. Si el servidor responde con error,
 * extrae el mensaje devuelto por la API o arroja un error general.
 */
async function leer<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error ?? "Ocurrió un error inesperado");
  return data as T;
}

/**
 * Consulta la lista de artículos de inventario aplicando filtros de tipo, búsqueda o estado.
 */
export async function listarInventario(p: {
  tipo: TipoInventario;
  busqueda?: string;
  estado?: EstadoStock | "";
}): Promise<InventarioRespuesta> {
  const qs = new URLSearchParams({ tipo: p.tipo });
  if (p.busqueda?.trim()) qs.set("busqueda", p.busqueda.trim());
  if (p.estado) qs.set("estado", p.estado);
  return leer(await fetch(`/api/inventario?${qs}`, { cache: "no-store" }));
}

/**
 * Obtiene los tipos de movimiento manuales configurados (Entradas, Salidas, Mermas).
 */
export async function listarTiposMovimiento(): Promise<TipoMovimiento[]> {
  return leer(await fetch("/api/inventario/tipos-movimiento", { cache: "no-store" }));
}

/**
 * Consulta el nombre y rol del usuario logueado en la sesión actual.
 */
export async function obtenerResponsable(): Promise<Responsable> {
  return leer(await fetch("/api/inventario/contexto", { cache: "no-store" }));
}

/**
 * Consulta el historial de Kardex de un producto para un periodo de fechas determinado.
 */
export async function obtenerKardex(
  idProducto: number,
  desde?: string,
  hasta?: string,
): Promise<KardexRespuesta> {
  const qs = new URLSearchParams({ idProducto: String(idProducto) });
  if (desde) qs.set("desde", desde);
  if (hasta) qs.set("hasta", hasta);
  return leer(await fetch(`/api/inventario/kardex?${qs}`, { cache: "no-store" }));
}

/**
 * Envía un nuevo movimiento de inventario para ajustar el stock de un producto.
 */
export async function registrarMovimiento(input: RegistrarMovimientoInput): Promise<ResultadoMovimiento> {
  return leer(
    await fetch("/api/inventario/movimientos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  );
}
