"use client";
import React from "react";
import { Loader2 } from "lucide-react";
import styles from "./RankingPersonalCard.module.scss";

export interface PersonalData {
  id: number;
  nombre: string;
  ventas: number;
  ticket: string;
}

interface RankingPersonalCardProps {
  personal: PersonalData[];
  cargando?: boolean;
}

export const RankingPersonalCard: React.FC<RankingPersonalCardProps> = ({
  personal,
  cargando = false,
}) => {
  return (
    <div
      className={`${styles.rankingPersonal} bg-superficie p-6 rounded-2xl border border-borde-gris-claro shadow-sm`}
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className={`${styles.cardTitle} font-semibold text-lg`}>
            Ranking de personal
          </h2>
          <p className="text-texto-claro text-sm">
            Por ticket promedio, no por venta total
          </p>
        </div>
        {cargando && <Loader2 className="w-5 h-5 text-texto-claro animate-spin" />}
      </div>

      <div className="w-full">
        <div className="flex justify-between items-center text-xs font-semibold text-texto-claro border-b border-borde-gris-claro pb-3 mb-3 px-2">
          <span>USUARIO</span>
          <div className="flex gap-8 text-right">
            <span className="w-16">N.º VENTAS</span>
            <span className="w-20">TICKET PROM.</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {personal.length === 0 && !cargando ? (
            <p className="text-texto-claro text-sm text-center py-4">
              No hay ventas registradas hoy.
            </p>
          ) : (
            personal.map((persona, index) => (
              <div
                key={persona.id}
                className={`flex justify-between items-center py-2 px-2 rounded-lg ${styles.row}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? styles.badgeFirstPlace : styles.badgeOther}`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <p className={`${styles.userName} font-medium text-sm`}>
                      {persona.nombre}
                    </p>
                    <p className="text-texto-claro text-xs">
                      id_usuario: {persona.id}
                    </p>
                  </div>
                </div>
                <div className="flex gap-8 text-right text-sm items-center">
                  <span className="w-16 text-texto-mutado">{persona.ventas}</span>
                  <span className={`w-20 font-bold ${styles.userTicket}`}>
                    {persona.ticket}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
