"use client";

import { useEffect, useState } from "react";
import { hoyLima } from "../../../../utils/fechas";
import styles from "./FiltroPeriodoKardex.module.scss";

interface Props {
  desde: string;
  hasta: string;
  cargando?: boolean;
  onAplicar: (desde: string, hasta: string) => void;
}

export default function FiltroPeriodoKardex({ desde, hasta, cargando, onAplicar }: Props) {
  const [d, setD] = useState(desde);
  const [h, setH] = useState(hasta);

  useEffect(() => {
    setD(desde);
    setH(hasta);
  }, [desde, hasta]);

  const valido = !!d && !!h && d <= h;

  return (
    <div className={styles.fila}>
      <label className={styles.tarjeta}>
        <span className={styles.etiqueta}>Desde</span>
        <input
          type="date"
          className={styles.control}
          value={d}
          max={h || hoyLima()}
          onChange={(e) => setD(e.target.value)}
        />
      </label>

      <label className={styles.tarjeta}>
        <span className={styles.etiqueta}>Hasta</span>
        <input
          type="date"
          className={styles.control}
          value={h}
          min={d}
          max={hoyLima()}
          onChange={(e) => setH(e.target.value)}
        />
      </label>

      <button
        type="button"
        className={styles.aplicar}
        disabled={!valido || cargando}
        onClick={() => onAplicar(d, h)}
      >
        Aplicar filtro
      </button>

      <span className={styles.nota}>Movimientos del periodo · Más antiguos primero</span>
    </div>
  );
}