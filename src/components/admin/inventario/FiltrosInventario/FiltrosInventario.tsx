import React, { Dispatch, SetStateAction } from "react";
import { Search, ChevronDown } from "lucide-react";
import type { EstadoStock } from "@/src/models/Inventario";
import styles from "./FiltrosInventario.module.scss";

interface Props {
  busqueda: string;
  setBusqueda: Dispatch<SetStateAction<string>>;
  categoria: string;
  setCategoria: Dispatch<SetStateAction<string>>;
  estado: "" | EstadoStock;
  setEstado: Dispatch<SetStateAction<"" | EstadoStock>>;
}

export default function FiltrosInventario({
  busqueda,
  setBusqueda,
  categoria,
  setCategoria,
  estado,
  setEstado,
}: Props) {
  return (
    <div
      className={`${styles.filtrosContenedor} flex flex-wrap items-end gap-5 mb-10`}
    >
      {/* Barra de Búsqueda */}
      <div className="flex flex-1 flex-col gap-1.5 min-w-[280px]">
        <label className="ml-1 text-sm font-semibold text-primario">
          Buscar producto
        </label>
        <div className={styles.inputGrupo}>
          <Search className={`${styles.iconoInput} h-5 w-5`} />
          <input
            type="text"
            placeholder="Buscar un insumo o sabor..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className={styles.inputControl}
          />
        </div>
      </div>

      {/* Filtro de Categoría */}
      <div className="flex flex-col gap-1.5">
        <label className="ml-1 text-sm font-semibold text-primario">
          Categoría
        </label>
        <div className="relative flex items-center">
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className={styles.selectControl}
          >
            <option value="">Todas las categorías</option>
            <option value="Helados Premium">Helados Premium</option>
            <option value="Helados Tradicionales">Helados Tradicionales</option>
          </select>
          <ChevronDown className={`${styles.iconoSelect} h-4 w-4`} />
        </div>
      </div>

      {/* Filtro de Estado */}
      <div className="flex flex-col gap-1.5">
        <label className="ml-1 text-sm font-semibold text-primario">
          Estado de stock
        </label>
        <div className="relative flex items-center">
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value as "" | EstadoStock)}
            className={styles.selectControl}
          >
            <option value="">Todos los estados</option>
            <option value="disponible">Disponible</option>
            <option value="stock_bajo">Stock Bajo</option>
            <option value="agotado">Agotado</option>
          </select>
          <ChevronDown className={`${styles.iconoSelect} h-4 w-4`} />
        </div>
      </div>
    </div>
  );
}
