"use client";

import { useEffect, useState } from "react";
import { listarInventario } from "../services/inventarioApi";
import type {
  EstadoStock,
  InventarioRespuesta,
  TipoInventario,
} from "../models/Inventario";

/**
 * Hook para la gestión del estado del inventario en componentes React.
 * Controla la búsqueda con temporizador (debounce de 300ms), el filtro por estado de stock,
 * el estado de carga y el manejo de errores.
 * 
 * @param tipo - Categoría base a listar: 'sabores' (helados y cremoladas) o 'envases'
 */
export function useInventario(tipo: TipoInventario) {
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState<EstadoStock | "">("");
  const [datos, setDatos] = useState<InventarioRespuesta | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    // Si el usuario está escribiendo en el buscador, espera 300ms antes de consultar
    const espera = setTimeout(
      async () => {
        if (cancelado) return;

        setCargando(true);

        try {
          const r = await listarInventario({ tipo, busqueda, estado });
          if (cancelado) return;
          setDatos(r);
          setError(null);
        } catch (e) {
          if (!cancelado)
            setError(e instanceof Error ? e.message : "Error al cargar");
        } finally {
          if (!cancelado) setCargando(false);
        }
      },
      busqueda ? 300 : 0,
    );

    // Limpieza del temporizador si el usuario sigue escribiendo o desmonta la vista
    return () => {
      cancelado = true;
      clearTimeout(espera);
    };
  }, [tipo, busqueda, estado]);

  return { datos, cargando, error, busqueda, setBusqueda, estado, setEstado };
}
