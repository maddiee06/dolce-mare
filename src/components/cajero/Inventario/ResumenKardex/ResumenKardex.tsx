import type { ResumenKardex as Resumen } from "../../../../models/Inventario";
import { formatearCantidad } from "../../../../utils/estadoStock";
import { formatearBandejas } from "../../../../utils/formatoBandejas";
import { formatearFechaLarga } from "../../../../utils/fechas";
import styles from "./ResumenKardex.module.scss";

interface Props {
  resumen: Resumen;
  desde: string;
  unidad: string;
}

export default function ResumenKardex({ resumen, desde, unidad }: Props) {
  const { saldoInicial, entradas, salidas, saldoActual, numEntradas, numSalidas } = resumen;
  const esBandeja = unidad.toLowerCase().includes("bandeja");
  const formatearValor = (n: number) => (esBandeja ? formatearBandejas(n) : formatearCantidad(n));

  return (
    <div className={styles.grid}>
      <div className={styles.tarjeta}>
        <span className={styles.etiqueta}>Saldo inicial</span>
        <strong className={styles.valor}>{formatearValor(saldoInicial)}</strong>
        <span className={styles.pie}>Antes del {formatearFechaLarga(desde)}</span>
      </div>

      <div className={styles.tarjeta}>
        <span className={styles.etiqueta}>Entradas</span>
        <strong className={styles.valor}>+{formatearValor(entradas)}</strong>
        <span className={styles.pie}>
          {numEntradas} {numEntradas === 1 ? "movimiento" : "movimientos"} de ingreso
        </span>
      </div>

      <div className={styles.tarjeta}>
        <span className={styles.etiqueta}>Salidas</span>
        <strong className={styles.valor}>−{formatearValor(salidas)}</strong>
        <span className={styles.pie}>
          {numSalidas} {numSalidas === 1 ? "movimiento" : "movimientos"} de salida
        </span>
      </div>

      <div className={`${styles.tarjeta} ${styles.destacada}`}>
        <span className={styles.etiqueta}>Saldo actual</span>
        <strong className={`${styles.valor} ${styles.valorDestacado}`}>
          {formatearValor(saldoActual)}
        </strong>
        <span className={styles.pie}>
          {formatearValor(saldoInicial)} + {formatearValor(entradas)} − {formatearValor(salidas)}{" "}
          = {formatearValor(saldoActual)} {unidad}
        </span>
      </div>
    </div>
  );
}
