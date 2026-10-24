import type { EstadoStock, TipoInventario } from "../models/Inventario";

export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/** 0 = agotado · menor o igual al mínimo = stock bajo · resto = disponible */
export function calcularEstadoStock(
  stockActual: number,
  stockMinimo: number,
): EstadoStock {
  if (stockActual <= 0) return "agotado";
  if (stockActual <= stockMinimo) return "stock_bajo";
  return "disponible";
}

export const ETIQUETA_ESTADO: Record<EstadoStock, string> = {
  disponible: "Disponible",
  stock_bajo: "Stock bajo",
  agotado: "Agotado",
};

/**
 * Palabras que identifican las categorías de cada pestaña.
 * El orden define el orden de los grupos en pantalla.
 * Si tus categorías se llaman distinto, edita solo esta constante.
 */
const PALABRAS_CATEGORIA: Record<TipoInventario, string[]> = {
  envases: ["envase", "utensilio", "complemento"],
  sabores: ["helado", "cremolada"],
};

/** Posición de la categoría dentro de la pestaña, o -1 si no pertenece. */
export function prioridadCategoria(
  categoria: string,
  tipo: TipoInventario,
): number {
  const nombre = normalizar(categoria);
  return PALABRAS_CATEGORIA[tipo].findIndex((p) => nombre.includes(p));
}

export function esCategoriaDeTipo(
  categoria: string,
  tipo: TipoInventario,
): boolean {
  return prioridadCategoria(categoria, tipo) >= 0;
}

/** Tipos que genera el sistema solo (ventas y transferencias): no se registran a mano. */
const TIPOS_NO_MANUALES = ["venta", "transferencia"];

export function esMovimientoManual(nombreTipo: string): boolean {
  const nombre = normalizar(nombreTipo);
  return !TIPOS_NO_MANUALES.some((t) => nombre.includes(t));
}

export function esMerma(nombreTipo: string): boolean {
  return normalizar(nombreTipo).includes("merma");
}

export function formatearCantidad(n: number): string {
  return n.toLocaleString("es-PE", { maximumFractionDigits: 2 });
}