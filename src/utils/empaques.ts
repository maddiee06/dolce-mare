/**
 * Configuración y utilidades de empaques para envases y utensilios.
 * Reglas de negocio:
 * - Conos: 1 caja = 360 unidades
 * - Obleas: 6 paquetes de 50 unidades = 300 unidades por caja
 * - Envases (Vasos): Las entradas son por paquetes (50 unidades por paquete)
 * - Cucharas: Paquetes de 100 unidades
 */

export type TipoArticuloEmpaque = "conos" | "obleas" | "vasos" | "cucharas" | "general";

export interface EmpaqueInfo {
  tipo: TipoArticuloEmpaque;
  unidadesPorPaquete?: number;
  unidadesPorCaja?: number;
  paquetesPorCaja?: number;
  descripcionCaja?: string;
  descripcionPaquete?: string;
}

/**
 * Identifica el tipo de empaque según el nombre del artículo.
 */
export function identificarTipoEmpaque(nombre: string): EmpaqueInfo {
  const norm = nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (norm.includes("cono")) {
    return {
      tipo: "conos",
      unidadesPorCaja: 360,
      descripcionCaja: "Caja de 360 conos",
    };
  }

  if (norm.includes("oblea")) {
    return {
      tipo: "obleas",
      unidadesPorPaquete: 50,
      unidadesPorCaja: 300,
      paquetesPorCaja: 6,
      descripcionPaquete: "Paquete de 50 obleas",
      descripcionCaja: "Caja de 300 obleas (6 paquetes de 50)",
    };
  }

  if (norm.includes("vaso")) {
    return {
      tipo: "vasos",
      unidadesPorPaquete: 50,
      descripcionPaquete: "Paquete de 50 vasos",
    };
  }

  if (norm.includes("cuchara") || norm.includes("cucharita")) {
    return {
      tipo: "cucharas",
      unidadesPorPaquete: 100,
      descripcionPaquete: "Paquete de 100 cucharas",
    };
  }

  return {
    tipo: "general",
    unidadesPorPaquete: 50,
    descripcionPaquete: "Paquete de 50 unidades",
  };
}

/**
 * Describe el stock actual en términos de paquetes o cajas para mostrar en tablas o resúmenes.
 * Ejemplo:
 * - 360 conos -> "1 caja"
 * - 720 conos -> "2 cajas"
 * - 380 conos -> "1 caja + 20 uds"
 * - 300 obleas -> "1 caja (6 paq)"
 * - 150 obleas -> "3 paquetes de 50"
 * - 100 vasos -> "2 paquetes de 50"
 */
export function describirStockEmpaque(nombre: string, unidades: number): string | null {
  if (unidades <= 0) return null;

  const info = identificarTipoEmpaque(nombre);

  if (info.tipo === "conos" && info.unidadesPorCaja) {
    const cajas = Math.floor(unidades / info.unidadesPorCaja);
    const resto = unidades % info.unidadesPorCaja;

    if (cajas > 0 && resto === 0) {
      return `${cajas} ${cajas === 1 ? "caja" : "cajas"}`;
    }
    if (cajas > 0) {
      return `${cajas} ${cajas === 1 ? "caja" : "cajas"} + ${resto} uds`;
    }
    return `${unidades} uds`;
  }

  if (info.tipo === "obleas" && info.unidadesPorCaja && info.unidadesPorPaquete) {
    const cajas = Math.floor(unidades / info.unidadesPorCaja);
    const restoCaja = unidades % info.unidadesPorCaja;
    const paq = Math.floor(restoCaja / info.unidadesPorPaquete);
    const sueltas = restoCaja % info.unidadesPorPaquete;

    const partes: string[] = [];
    if (cajas > 0) partes.push(`${cajas} ${cajas === 1 ? "caja" : "cajas"}`);
    if (paq > 0) partes.push(`${paq} ${paq === 1 ? "paquete" : "paquetes"}`);
    if (sueltas > 0) partes.push(`${sueltas} uds`);

    if (partes.length > 0) {
      return partes.join(" + ");
    }
    return `${unidades} uds`;
  }

  if ((info.tipo === "vasos" || info.tipo === "cucharas" || info.tipo === "general") && info.unidadesPorPaquete) {
    const paq = Math.floor(unidades / info.unidadesPorPaquete);
    const resto = unidades % info.unidadesPorPaquete;

    if (paq > 0 && resto === 0) {
      return `${paq} ${paq === 1 ? "paquete" : "paquetes"}`;
    }
    if (paq > 0) {
      return `${paq} ${paq === 1 ? "paq" : "paquetes"} + ${resto} uds`;
    }
    return `${unidades} uds`;
  }

  return null;
}
