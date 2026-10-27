/** Formatea un monto en soles: 24 -> "S/ 24.00" */
export function formatSoles(valor: number): string {
  return `S/ ${valor.toFixed(2)}`;
}

/** Formatea una diferencia con signo: -4 -> "-S/ 4.00", 0 -> "S/ 0.00" */
export function formatDiferencia(valor: number): string {
  const redondeado = Math.round(valor * 100) / 100;
  if (redondeado === 0) return formatSoles(0);
  return `${redondeado > 0 ? "+" : "-"}${formatSoles(Math.abs(redondeado))}`;
}

/** Convierte el texto de un input a número (vacío o inválido = 0) */
export function parseMonto(texto: string): number {
  const numero = Number.parseFloat(texto);
  return Number.isFinite(numero) ? numero : 0;
}
