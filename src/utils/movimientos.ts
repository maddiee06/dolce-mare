import type { AfectaStock, TipoMovimiento } from "../models/Inventario";
import { normalizar } from "./estadoStock";

export type ClaseMovimiento = "entrada" | "salida" | "ajuste";

export const esAjuste = (nombre: string) => normalizar(nombre).includes("ajuste");

/** Tipos de la base que corresponden a cada botón (Entrada / Salida / Ajuste). */
export function tiposDeClase(tipos: TipoMovimiento[], clase: ClaseMovimiento): TipoMovimiento[] {
  if (clase === "entrada") return tipos.filter((t) => t.afectaStock === "suma" && !esAjuste(t.nombre));
  if (clase === "salida") return tipos.filter((t) => t.afectaStock === "resta" && !esAjuste(t.nombre));
  return tipos.filter((t) => esAjuste(t.nombre));
}

export function tipoAjuste(tipos: TipoMovimiento[], afecta: AfectaStock): TipoMovimiento | undefined {
  return tipos.find((t) => esAjuste(t.nombre) && t.afectaStock === afecta);
}