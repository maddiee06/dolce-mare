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
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className={`${styles.cardTitle} font-semibold text-lg`}>
            Alertas operativas
          </h2>
          <p className="text-gray-400 text-sm">
            Stock, mermas y movimientos entre sedes
          </p>
        </div>
        <AlertTriangle className={`w-5 h-5 ${styles.iconWarning}`} />
      </div>

      <div className="flex flex-col gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-4 h-4 text-gray-400" />
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Stock por debajo del mínimo
            </h3>
          </div>
          <div className="flex flex-col gap-2">
            {stockAlertas.length === 0 ? (
              <p className="text-gray-400 text-sm italic">Inventario óptimo.</p>
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
                    <p className="text-gray-400 text-xs">
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
            <Trash2 className="w-4 h-4 text-gray-400" />
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Mermas registradas hoy
            </h3>
          </div>
          <div className="flex flex-col gap-2">
            {mermas.length === 0 ? (
              <p className="text-gray-400 text-sm italic">Sin mermas hoy.</p>
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
