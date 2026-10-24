"use client";

import { useEffect, useState } from "react";
import { listarInventario } from "../services/inventarioApi";
import type {
  EstadoStock,
  InventarioRespuesta,
  TipoInventario,
} from "../models/Inventario";

export function useInventario(tipo: TipoInventario) {
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState<EstadoStock | "">("");
  const [datos, setDatos] = useState<InventarioRespuesta | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    setCargando(true);

    const espera = setTimeout(
      async () => {
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

    return () => {
      cancelado = true;
      clearTimeout(espera);
    };
  }, [tipo, busqueda, estado]);

  return { datos, cargando, error, busqueda, setBusqueda, estado, setEstado };
}
