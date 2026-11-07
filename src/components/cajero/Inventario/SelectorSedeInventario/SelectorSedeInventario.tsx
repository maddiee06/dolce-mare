"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import type { Sede } from "../../../../models/Sede";
import styles from "./SelectorSedeInventario.module.scss";

interface Props {
  onSedeCambiada?: (idSede: number) => void;
}

export default function SelectorSedeInventario({ onSedeCambiada }: Props) {
  const router = useRouter();
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [idSedeSeleccionada, setIdSedeSeleccionada] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);
  const [cambiando, setCambiando] = useState(false);

  useEffect(() => {
    // 1. Obtener la sede guardada en cookie
    const match = document.cookie.match(/(?:^|;\s*)id_sede=([^;]+)/);
    const sedeCookie = match ? Number(match[1]) : null;

    // 2. Cargar lista de sedes
    fetch("/api/sedes")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        const lista: Sede[] = data.sedes ?? [];
        setSedes(lista);
        if (sedeCookie && lista.some((s) => s.id_sede === sedeCookie)) {
          setIdSedeSeleccionada(sedeCookie);
        } else if (lista.length > 0) {
          setIdSedeSeleccionada(lista[0].id_sede);
        }
      })
      .catch((err) => {
        console.error("Error al cargar sedes para inventario:", err);
      })
      .finally(() => setCargando(false));
  }, []);

  async function handleCambiarSede(nuevaId: number) {
    if (nuevaId === idSedeSeleccionada) return;
    setCambiando(true);
    setIdSedeSeleccionada(nuevaId);

    try {
      await fetch("/api/sedes/seleccionar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_sede: nuevaId }),
      });

      if (onSedeCambiada) {
        onSedeCambiada(nuevaId);
      }

      router.refresh();
      // Pequeño retardo para asegurar que la cookie se propague
      setTimeout(() => {
        window.location.reload();
      }, 150);
    } catch (e) {
      console.error("No se pudo cambiar de sede:", e);
      setCambiando(false);
    }
  }

  if (cargando) {
    return (
      <div className={styles.contenedor}>
        <MapPin size={16} className={styles.icono} />
        <span className={styles.cargando}>Cargando sucursal...</span>
      </div>
    );
  }

  return (
    <div className={styles.contenedor}>
      <MapPin size={16} className={styles.icono} />
      <span className={styles.etiqueta}>Sede:</span>
      <select
        value={idSedeSeleccionada ?? ""}
        disabled={cambiando}
        onChange={(e) => handleCambiarSede(Number(e.target.value))}
        className={styles.select}
        title="Cambiar sucursal de inventario"
      >
        {sedes.map((s) => (
          <option key={s.id_sede} value={s.id_sede}>
            {s.nombre}
          </option>
        ))}
      </select>
      {cambiando && <span className={styles.cargando}>(cambiando...)</span>}
    </div>
  );
}
