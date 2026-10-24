import type { EstadoStock } from "../../../../models/Inventario";
import { ETIQUETA_ESTADO } from "../../../../utils/estadoStock";
import styles from "./EstadoStockBadge.module.scss";

export default function EstadoStockBadge({ estado }: { estado: EstadoStock }) {
  return (
    <span className={`${styles.badge} ${styles[estado]}`}>
      <span className={styles.punto} />
      {ETIQUETA_ESTADO[estado]}
    </span>
  );
}