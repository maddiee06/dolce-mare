const TZ = "America/Lima";

/** Hoy en Lima, formato AAAA-MM-DD. */
export function hoyLima(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
}

export function esFechaValida(f: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(f)) return false;
  const d = new Date(`${f}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === f;
}

export function sumarDias(f: string, dias: number): string {
  const d = new Date(`${f}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

export function diasEntre(a: string, b: string): number {
  const ms = new Date(`${b}T00:00:00Z`).getTime() - new Date(`${a}T00:00:00Z`).getTime();
  return Math.round(ms / 86_400_000);
}

/** Lima es UTC-5 todo el año (sin horario de verano). */
export const inicioDiaLimaISO = (f: string) => `${f}T00:00:00-05:00`;
export const finDiaLimaISO = (f: string) => `${f}T23:59:59.999-05:00`;

const fDia = new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short", timeZone: TZ });
const fHora = new Intl.DateTimeFormat("es-PE", {
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: TZ,
});
const fAnio = new Intl.DateTimeFormat("es-PE", { year: "numeric", timeZone: TZ });
const fLarga = new Intl.DateTimeFormat("es-PE", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const sinPunto = (s: string) => s.replace(/\./g, "");

export function partesFechaHora(iso: string) {
  const d = new Date(iso);
  return { fecha: sinPunto(fDia.format(d)), hora: fHora.format(d), anio: fAnio.format(d) };
}

/** "2026-10-07" → "07 oct 2026" */
export function formatearFechaLarga(f: string): string {
  return sinPunto(fLarga.format(new Date(`${f}T12:00:00Z`)));
}