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

async function leer<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error ?? "Ocurrió un error inesperado");
  return data as T;
}

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

export async function listarTiposMovimiento(): Promise<TipoMovimiento[]> {
  return leer(await fetch("/api/inventario/tipos-movimiento", { cache: "no-store" }));
}

export async function obtenerResponsable(): Promise<Responsable> {
  return leer(await fetch("/api/inventario/contexto", { cache: "no-store" }));
}

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

export async function registrarMovimiento(input: RegistrarMovimientoInput): Promise<ResultadoMovimiento> {
  return leer(
    await fetch("/api/inventario/movimientos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  );
}