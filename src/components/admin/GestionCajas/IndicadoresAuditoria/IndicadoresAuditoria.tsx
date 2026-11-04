"use client";

import React from "react";
import { AlertCircle, Clock, CheckCircle2 } from "lucide-react";

export interface IndicadoresAuditoriaProps {
  faltantesMes?: number;
  turnosPorRevisar?: number;
  cuadraturaPromedio?: number;
}

export const IndicadoresAuditoria: React.FC<IndicadoresAuditoriaProps> = ({
  faltantesMes = 15.0,
  turnosPorRevisar = 2,
  cuadraturaPromedio = 98.4,
}) => {
  const formatMoneda = (monto: number) =>
    `S/ ${Math.abs(monto).toLocaleString("es-PE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <div className="flex flex-wrap items-center gap-3 my-6">
      {/* Píldora 1: Faltantes este mes */}
      <div className="inline-flex items-center gap-2 bg-error-fondo text-error-texto border border-error-borde px-3.5 py-1.5 rounded-full text-sm font-semibold shadow-2xs hover:bg-rose-100/70 transition-colors">
        <span className="text-base leading-none">🔴</span>
        <span>
          Faltantes este mes:{" "}
          <strong className="font-bold">-{formatMoneda(faltantesMes)}</strong>
        </span>
      </div>

      {/* Píldora 2: Turnos por revisar */}
      <div className="inline-flex items-center gap-2 bg-advertencia-fondo text-advertencia-texto border border-advertencia-borde px-3.5 py-1.5 rounded-full text-sm font-semibold shadow-2xs hover:bg-amber-100/70 transition-colors">
        <span className="text-base leading-none">🟠</span>
        <span>
          Por revisar:{" "}
          <strong className="font-bold">{turnosPorRevisar} turnos</strong>
        </span>
      </div>

      {/* Píldora 3 (Extra Pro): Cuadratura global del mes */}
      <div className="hidden sm:inline-flex items-center gap-2 bg-exito-fondo text-exito-texto border border-exito-borde px-3.5 py-1.5 rounded-full text-sm font-semibold shadow-2xs">
        <span className="text-base leading-none">🟢</span>
        <span>
          Efectividad de arqueo:{" "}
          <strong className="font-bold">{cuadraturaPromedio}%</strong>
        </span>
      </div>
    </div>
  );
};

export default IndicadoresAuditoria;
