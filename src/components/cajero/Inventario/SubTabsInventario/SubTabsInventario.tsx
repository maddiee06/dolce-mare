"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./SubTabsInventario.module.scss";

export default function SubTabsInventario({ nota }: { nota?: string }) {
  const enSabores = usePathname().startsWith("/cajero/inventario/sabores");

  return (
    <div className={styles.fila}>
      <div className={styles.tabs}>
        <Link
          href="/cajero/inventario"
          className={`${styles.tab} ${!enSabores ? styles.activa : ""}`}
        >
          Envases y utensilios
        </Link>
        <Link
          href="/cajero/inventario/sabores"
          className={`${styles.tab} ${enSabores ? styles.activa : ""}`}
        >
          Sabores
        </Link>
      </div>
      {nota && <span className={styles.nota}>{nota}</span>}
    </div>
  );
}