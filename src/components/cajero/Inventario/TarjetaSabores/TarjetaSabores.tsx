import Link from "next/link";
import EstadoStockBadge from "../../../../components/cajero/Inventario/EstadoStockBadge";
import type { GrupoInventario } from "../../../../models/Inventario";
import { formatearCantidad } from "../../../../utils/estadoStock";
import styles from "./TarjetaSabores.module.scss";

export default function TarjetaSabores({ grupo }: { grupo: GrupoInventario }) {
  const n = grupo.articulos.length;

  return (
    <section className={styles.tarjeta}>
      <header className={styles.cabecera}>
        <div>
          <h2 className={styles.titulo}>{grupo.categoria}</h2>
          <p className={styles.sub}>Stock y mínimo en L</p>
        </div>
        <span className={styles.conteo}>
          {n} {n === 1 ? "sabor" : "sabores"}
        </span>
      </header>

      <div className={styles.scroll}>
        <div className={`${styles.fila} ${styles.encabezado}`}>
          <span>Artículo / unidad</span>
          <span>Stock</span>
          <span>Mínimo</span>
          <span>Estado</span>
          <span>Consulta</span>
        </div>

        {grupo.articulos.map((a) => (
          <div key={a.idProducto} className={styles.fila}>
            <div>
              <div className={styles.nombre}>{a.nombre}</div>
              <div className={styles.unidad}>litros (L)</div>
            </div>
            <span className={styles.stock}>{formatearCantidad(a.stockActual)}</span>
            <span className={styles.minimo}>{formatearCantidad(a.stockMinimo)}</span>
            <span>
              <EstadoStockBadge estado={a.estado} />
            </span>
            <Link
              href={`/cajero/inventario/kardex?producto=${a.idProducto}`}
              className={styles.kardex}
            >
              Ver Kardex
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}