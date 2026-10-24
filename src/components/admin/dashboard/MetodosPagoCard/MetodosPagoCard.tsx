import React from "react";
import { Banknote, Smartphone, CreditCard } from "lucide-react";
import styles from "./MetodosPagoCard.module.scss";

export interface MetodoPagoData {
  nombre: string;
  monto: string;
  porcentaje: number;
  porcentajeBarra: number;
  tipo: "efectivo" | "yape" | "tarjeta";
}

interface MetodosPagoCardProps {
  metodos: MetodoPagoData[];
}

export const MetodosPagoCard: React.FC<MetodosPagoCardProps> = ({
  metodos,
}) => {
  const getConfig = (tipo: string) => {
    switch (tipo) {
      case "efectivo":
        return { fillClass: styles.fillEfectivo, Icon: Banknote };
      case "yape":
        return { fillClass: styles.fillYape, Icon: Smartphone };
      case "tarjeta":
        return { fillClass: styles.fillTarjeta, Icon: CreditCard };
      default:
        return { fillClass: styles.fillEfectivo, Icon: Banknote };
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full">
      <div className="mb-6">
        <h2 className={`${styles.cardTitle} font-semibold text-lg`}>
          Métodos de pago
        </h2>
        <p className="text-gray-400 text-sm">distribución de hoy</p>
      </div>

      <div className="flex flex-col gap-6">
        {metodos.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">
            No hay pagos registrados.
          </p>
        ) : (
          metodos.map((metodo, index) => {
            const { fillClass, Icon } = getConfig(metodo.tipo);
            return (
              <div key={index} className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-gray-400" />
                    <span className={`${styles.methodName} font-medium`}>
                      {metodo.nombre}
                    </span>
                  </div>
                  <span className={`${styles.methodAmount} font-semibold`}>
                    {metodo.monto}
                  </span>
                </div>
                <div
                  className={`h-2.5 w-full rounded-full overflow-hidden ${styles.barTrack}`}
                >
                  <div
                    className={`h-full rounded-full ${styles.barFillBase} ${fillClass}`}
                    style={{ width: `${metodo.porcentajeBarra}%` }}
                  />
                </div>
                <span className="text-gray-400 text-xs">
                  {metodo.porcentaje}% del total
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
