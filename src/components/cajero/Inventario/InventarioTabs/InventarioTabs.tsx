"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./InventarioTabs.module.scss";

export default function InventarioTabs() {
  const pathname = usePathname();
  const enKardex = pathname.startsWith("/cajero/inventario/kardex");

  return (
    <nav className={styles.nav}>
      <div className={styles.tabs}>
        <Link
          href="/cajero/inventario"
          className={`${styles.tab} ${!enKardex ? styles.activa : ""}`}
        >
          Inventario
        </Link>
        <Link
          href="/cajero/inventario/kardex"
          className={`${styles.tab} ${enKardex ? styles.activa : ""}`}
        >
          Kardex
        </Link>
      </div>
    </nav>
  );
}
