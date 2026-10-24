import type { KardexRespuesta } from "../models/Inventario";
import { normalizar } from "./estadoStock";
import { partesFechaHora } from "./fechas";

const celda = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;

export function exportarKardexCsv(k: KardexRespuesta) {
  const filas: string[][] = [
    ["Fecha", "Hora", "Tipo", "Referencia / motivo", "Responsable", "Entrada", "Salida", "Saldo"],
  ];

  for (const m of k.movimientos) {
    const f = partesFechaHora(m.fecha);
    filas.push([
      `${f.fecha} ${f.anio}`,
      f.hora,
      m.tipo,
      m.motivo ?? "",
      m.usuario,
      m.afectaStock === "suma" ? String(m.cantidad) : "",
      m.afectaStock === "resta" ? String(m.cantidad) : "",
      String(m.stockResultante),
    ]);
  }

  const csv = "\uFEFF" + filas.map((r) => r.map(celda).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const nombre = normalizar(k.articulo.nombre).replace(/[^a-z0-9]+/g, "-");

  const a = document.createElement("a");
  a.href = url;
  a.download = `kardex-${nombre}-${k.desde}_${k.hasta}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}