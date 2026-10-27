"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { FlujoPasos } from "../../../components/cajero/FlujoPasos";
import styles from "./SeleccionSabores.module.scss";

export interface Sabor {
  id: number;
  nombre: string;
  imagen: string;
}

const sabores: Sabor[] = [
  { id: 1, nombre: "Pistacho", imagen: "/categorias/heladito.jpg" },
  { id: 2, nombre: "Chocolate belga", imagen: "/categorias/heladito.jpg" },
  { id: 3, nombre: "Vainilla de Madagascar", imagen: "/categorias/heladito.jpg" },
  { id: 4, nombre: "Fresa", imagen: "/categorias/heladito.jpg" },
  { id: 5, nombre: "Lúcuma", imagen: "/categorias/heladito.jpg" },
  { id: 6, nombre: "Mango", imagen: "/categorias/heladito.jpg" },
  { id: 7, nombre: "Stracciatella", imagen: "/categorias/heladito.jpg" },
  { id: 8, nombre: "Café", imagen: "/categorias/heladito.jpg" },
];

export interface SeleccionSaboresProps {
  onSelectionChange?: (sabores: string[]) => void;
}

export default function SeleccionSabores({ onSelectionChange }: SeleccionSaboresProps) {
  const router = useRouter();
  const [seleccionados, setSeleccionados] = useState<number[]>([]);

  const alternarSabor = (id: number) => {
    const siguiente = seleccionados.includes(id)
      ? seleccionados.filter((saborId) => saborId !== id)
      : seleccionados.length < 3
        ? [...seleccionados, id]
        : seleccionados;

    setSeleccionados(siguiente);

    const nombresSeleccionados = siguiente
      .map((saborId) => sabores.find((sabor) => sabor.id === saborId)?.nombre)
      .filter((nombre): nombre is string => Boolean(nombre));

    onSelectionChange?.(nombresSeleccionados);
  };

  return (
    <section className={styles.contenedor}>
      <button
        type="button"
        className={styles.cambiarCantidad}
        onClick={() => router.back()}
      >
        <ArrowLeft size={16} strokeWidth={2} />
        <span>Cambiar cantidad</span>
      </button>

      <header className={styles.cabecera}>
        <h2>Elige tus sabores</h2>
        <p>Vaso - 3 sabores · Una combinación hecha a tu gusto.</p>
      </header>

      <div className={styles.pasos}>
        <FlujoPasos pasoActual={4} />
      </div>

      <div className={styles.indicador}>
        <span>{seleccionados.length} de 3 sabores elegidos</span>
        <span>Toca un sabor para cambiarlo</span>
      </div>

      <div className={styles.grid}>
        {sabores.map((sabor) => {
          const seleccionado = seleccionados.includes(sabor.id);

          return (
            <button
              key={sabor.id}
              type="button"
              className={`${styles.tarjeta} ${seleccionado ? styles.seleccionada : ""}`}
              onClick={() => alternarSabor(sabor.id)}
              aria-pressed={seleccionado}
            >
              <div className={styles.imagen} aria-hidden="true">
                <span className={styles.botonMas}>{seleccionado ? "✓" : "+"}</span>
              </div>
              <div className={styles.info}>
                <strong>{sabor.nombre}</strong>
                <span>Incluido</span>
              </div>
            </button>
          );
        })}
      </div>

    </section>
  );
}
