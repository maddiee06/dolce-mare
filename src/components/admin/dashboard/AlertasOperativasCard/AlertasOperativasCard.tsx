"use client";
import React from "react";
import { AlertTriangle, Package, Trash2 } from "lucide-react";
import styles from "./AlertasOperativasCard.module.scss";

export interface StockAlerta {
  nombre: string;
  minimo: string;
  actual: string;
}

export interface MermaAlerta {
  nombre: string;
  motivo: string;
  cantidad: string;
}

interface AlertasOperativasCardProps {
  stockAlertas: StockAlerta[];
  mermas: MermaAlerta[];
}

export const AlertasOperativasCard: React.FC<AlertasOperativasCardProps> = ({
  stockAlertas,
  mermas,
}) => {
  return (
    <div
      className={`${styles.aletasOperativas} bg-superficie p-6 rounded-2xl border border-borde-gris-claro shadow-sm h-full`}
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className={`${styles.cardTitle} font-semibold text-lg`}>
            Alertas operativas
          </h2>
          <p className="text-texto-claro text-sm">
            Stock, mermas y movimientos entre sedes
          </p>
        </div>
        <AlertTriangle className={`w-5 h-5 ${styles.iconWarning}`} />
      </div>

      <div className="flex flex-col gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-4 h-4 text-texto-claro" />
            <h3 className="text-xs font-bold text-texto-claro uppercase tracking-wider">
              Stock por debajo del mínimo
            </h3>
          </div>
          <div className="flex flex-col gap-2">
            {stockAlertas.length === 0 ? (
              <p className="text-texto-claro text-sm italic">Inventario óptimo.</p>
            ) : (
              stockAlertas.map((alerta, index) => (
                <div
                  key={index}
                  className={`rounded-xl p-3 flex justify-between items-center ${styles.stockAlertBox}`}
                >
                  <div>
                    <p
                      className={`${styles.stockAlertName} font-medium text-sm`}
                    >
                      {alerta.nombre}
                    </p>
                    <p className="text-texto-claro text-xs">
                      mín. {alerta.minimo}
                    </p>
                  </div>
                  <span
                    className={`${styles.stockAlertValue} font-semibold text-sm`}
                  >
                    {alerta.actual}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <Trash2 className="w-4 h-4 text-texto-claro" />
            <h3 className="text-xs font-bold text-texto-claro uppercase tracking-wider">
              Mermas registradas hoy
            </h3>
          </div>
          <div className="flex flex-col gap-2">
            {mermas.length === 0 ? (
              <p className="text-texto-claro text-sm italic">Sin mermas hoy.</p>
            ) : (
              mermas.map((merma, index) => (
                <div
                  key={index}
                  className={`rounded-xl p-3 flex justify-between items-center ${styles.mermaAlertBox}`}
                >
                  <div>
                    <p
                      className={`${styles.mermaAlertName} font-medium text-sm`}
                    >
                      {merma.nombre}
                    </p>
                    <p className={`${styles.mermaAlertMotivo} text-xs`}>
                      {merma.motivo}
                    </p>
                  </div>
                  <span
                    className={`${styles.mermaAlertValue} font-semibold text-sm`}
                  >
                    {merma.cantidad}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
