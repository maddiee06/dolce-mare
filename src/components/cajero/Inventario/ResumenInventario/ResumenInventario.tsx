import type { ResumenInventario as Resumen } from "../../../../models/Inventario";
import styles from "./ResumenInventario.module.scss";

interface Props {
  resumen: Resumen;
  /** "artículos" | "sabores" */
  unidad: string;
}

export default function ResumenInventario({ resumen, unidad }: Props) {
  const { total, necesitanReposicion, agotados } = resumen;

  return (
    <div className={styles.resumen}>
      <strong className={styles.total}>
        {total} {unidad} en inventario
      </strong>
      <span className={styles.detalle}>
        {necesitanReposicion} {necesitanReposicion === 1 ? "necesita" : "necesitan"} reposición ·{" "}
        {agotados} {agotados === 1 ? "agotado" : "agotados"}
      </span>
    </div>
  );
}