"use client";
import React from "react";
import { Award } from "lucide-react";
import styles from "./TopSaboresCard.module.scss";

export interface SaborData {
  nombre: string;
  nivel: string;
  cantidad: number;
  porcentaje: number;
}

interface TopSaboresCardProps {
  sabores: SaborData[];
}

export const TopSaboresCard: React.FC<TopSaboresCardProps> = ({ sabores }) => {
  return (
    <div
      className={`${styles.topSaboresCard} bg-superficie p-6 rounded-2xl border border-borde-gris-claro shadow-sm`}
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className={`${styles.cardTitle} font-semibold text-lg`}>
            Top sabores vendidos
          </h2>
          <p className="text-texto-claro text-sm">Bolas servidas hoy</p>
        </div>
        <Award className="w-5 h-5 text-texto-claro" />
      </div>

      <div className="flex flex-col gap-5">
        {sabores.length === 0 ? (
          <p className="text-texto-claro text-sm text-center py-4">
            Sin datos de ventas aún.
          </p>
        ) : (
          sabores.map((sabor, index) => (
            <div key={index} className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <span className={`${styles.saborName} font-medium`}>
                    {sabor.nombre}
                  </span>
                  <span
                    className={`${styles.badgeNivel} px-2 py-0.5 rounded-full text-xs font-medium`}
                  >
                    {sabor.nivel}
                  </span>
                </div>
                <span className={`${styles.saborCount} font-semibold`}>
                  {sabor.cantidad} bolas
                </span>
              </div>
              <div
                className={`h-2.5 w-full rounded-full overflow-hidden ${styles.barTrack}`}
              >
                <div
                  className={`h-full rounded-full ${styles.barFill}`}
                  style={{ width: `${sabor.porcentaje}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
