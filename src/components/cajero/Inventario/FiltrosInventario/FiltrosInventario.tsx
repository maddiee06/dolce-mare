"use client";

import type { EstadoStock } from "../../../../models/Inventario";
import styles from "./FiltrosInventario.module.scss";

interface Props {
  busqueda: string;
  onBusqueda: (v: string) => void;
  estado: EstadoStock | "";
  onEstado: (v: EstadoStock | "") => void;
  etiquetaBusqueda: string;
  placeholder: string;
}

export default function FiltrosInventario({
  busqueda,
  onBusqueda,
  estado,
  onEstado,
  etiquetaBusqueda,
  placeholder,
}: Props) {
  return (
    <div className={styles.filtros}>
      <label className={styles.tarjeta}>
        <span className={styles.etiqueta}>{etiquetaBusqueda}</span>
        <input
          className={styles.control}
          type="text"
          value={busqueda}
          placeholder={placeholder}
          onChange={(e) => onBusqueda(e.target.value)}
        />
      </label>

      <label className={styles.tarjeta}>
        <span className={styles.etiqueta}>Estado de stock</span>
        <select
          className={styles.control}
          value={estado}
          onChange={(e) => onEstado(e.target.value as EstadoStock | "")}
        >
          <option value="">Todos los estados</option>
          <option value="disponible">Disponible</option>
          <option value="stock_bajo">Stock bajo</option>
          <option value="agotado">Agotado</option>
        </select>
      </label>
    </div>
  );
}