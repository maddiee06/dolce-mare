/**
 * Utilidades para la gestión de sabores (Helados y Cremoladas) por bandejas y fracciones.
 */

export const OPCIONES_FRACCIONES: { valor: number; etiqueta: string; descripcion: string }[] = [
  { valor: 0.25, etiqueta: "1/4 bandeja", descripcion: "Un cuarto (0.25)" },
  { valor: 0.5, etiqueta: "1/2 bandeja", descripcion: "Media bandeja (0.50)" },
  { valor: 0.75, etiqueta: "3/4 bandeja", descripcion: "Tres cuartos (0.75)" },
  { valor: 1.0, etiqueta: "1 bandeja", descripcion: "Una bandeja completa (1.00)" },
  { valor: 1.5, etiqueta: "1 1/2 bandejas", descripcion: "Una bandeja y media (1.50)" },
  { valor: 2.0, etiqueta: "2 bandejas", descripcion: "Dos bandejas completas (2.00)" },
];

/**
 * Determina si una categoría o nombre corresponde a sabores que se controlan por bandejas.
 */
export function esSaborOBandeja(categoriaOProducto: string): boolean {
  if (!categoriaOProducto) return false;
  const texto = categoriaOProducto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  return texto.includes("helado") || texto.includes("cremolada");
}

/**
 * Convierte un número decimal a su representación amigable en fracciones de bandejas.
 * Ejemplos:
 * 0.5 -> "1/2 bandeja"
 * 0.25 -> "1/4 bandeja"
 * 0.75 -> "3/4 bandeja"
 * 1 -> "1 bandeja"
 * 1.5 -> "1 1/2 bandejas"
 * 2.25 -> "2 1/4 bandejas"
 * 0 -> "0 bandejas"
 */
export function formatearBandejas(cantidad: number, incluirDecimal: boolean = false): string {
  if (cantidad === undefined || cantidad === null || isNaN(cantidad)) {
    return "0 bandejas";
  }

  if (cantidad <= 0) {
    return "0 bandejas";
  }

  const redondear = Math.round(cantidad * 100) / 100;
  const entero = Math.floor(redondear);
  const decimal = Math.round((redondear - entero) * 100) / 100;

  let fraccion = "";
  if (Math.abs(decimal - 0.25) < 0.03) {
    fraccion = "1/4";
  } else if (Math.abs(decimal - 0.5) < 0.03) {
    fraccion = "1/2";
  } else if (Math.abs(decimal - 0.75) < 0.03) {
    fraccion = "3/4";
  } else if (Math.abs(decimal - 0.125) < 0.02) {
    fraccion = "1/8";
  } else if (Math.abs(decimal - 0.33) < 0.03) {
    fraccion = "1/3";
  } else if (Math.abs(decimal - 0.67) < 0.03) {
    fraccion = "2/3";
  }

  let texto = "";

  if (entero === 0) {
    if (fraccion) {
      texto = `${fraccion} bandeja`;
    } else {
      texto = `${redondear.toLocaleString("es-PE", { maximumFractionDigits: 2 })} bandejas`;
    }
  } else {
    if (!fraccion) {
      if (decimal === 0) {
        texto = `${entero} ${entero === 1 ? "bandeja" : "bandejas"}`;
      } else {
        texto = `${redondear.toLocaleString("es-PE", { maximumFractionDigits: 2 })} bandejas`;
      }
    } else {
      texto = `${entero} y ${fraccion} bandejas`;
    }
  }

  if (incluirDecimal && (decimal !== 0 || fraccion !== "")) {
    return `${texto} (${redondear.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`;
  }

  return texto;
}
