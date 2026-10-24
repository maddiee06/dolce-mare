import type { ResumenKardex as Resumen } from "../../../../models/Inventario";
import { formatearCantidad } from "../../../../utils/estadoStock";
import { formatearFechaLarga } from "../../../../utils/fechas";
import styles from "./ResumenKardex.module.scss";

interface Props {
  resumen: Resumen;
  desde: string;
  unidad: string;
}

export default function ResumenKardex({ resumen, desde, unidad }: Props) {
  const { saldoInicial, entradas, salidas, saldoActual, numEntradas, numSalidas } = resumen;

  return (
    <div className={styles.grid}>
      <div className={styles.tarjeta}>
        <span className={styles.etiqueta}>Saldo inicial</span>
        <strong className={styles.valor}>{formatearCantidad(saldoInicial)}</strong>
        <span className={styles.pie}>Antes del {formatearFechaLarga(desde)}</span>
      </div>

      <div className={styles.tarjeta}>
        <span className={styles.etiqueta}>Entradas</span>
        <strong className={styles.valor}>+{formatearCantidad(entradas)}</strong>
        <span className={styles.pie}>
          {numEntradas} {numEntradas === 1 ? "movimiento" : "movimientos"} de ingreso
        </span>
      </div>

      <div className={styles.tarjeta}>
        <span className={styles.etiqueta}>Salidas</span>
        <strong className={styles.valor}>−{formatearCantidad(salidas)}</strong>
        <span className={styles.pie}>
          {numSalidas} {numSalidas === 1 ? "movimiento" : "movimientos"} de salida
        </span>
      </div>

      <div className={`${styles.tarjeta} ${styles.destacada}`}>
        <span className={styles.etiqueta}>Saldo actual</span>
        <strong className={`${styles.valor} ${styles.valorDestacado}`}>
          {formatearCantidad(saldoActual)}
        </strong>
        <span className={styles.pie}>
          {formatearCantidad(saldoInicial)} + {formatearCantidad(entradas)} − {formatearCantidad(salidas)}{" "}
          = {formatearCantidad(saldoActual)} {unidad}
        </span>
      </div>
    </div>
  );
}