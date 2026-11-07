import Link from "next/link";
import EstadoStockBadge from "../../../../components/cajero/Inventario/EstadoStockBadge";
import type { GrupoInventario } from "../../../../models/Inventario";
import { formatearCantidad } from "../../../../utils/estadoStock";
import { describirStockEmpaque } from "../../../../utils/empaques";
import styles from "./TablaInventario.module.scss";

export default function TablaInventario({ grupo }: { grupo: GrupoInventario }) {
  const n = grupo.articulos.length;

  return (
    <section className={styles.tarjeta}>
      <header className={styles.cabecera}>
        <h2 className={styles.titulo}>{grupo.categoria}</h2>
        <span className={styles.conteo}>
          {n} {n === 1 ? "artículo" : "artículos"}
        </span>
      </header>

      <div className={styles.scroll}>
        <div className={`${styles.fila} ${styles.encabezado}`}>
          <span>Artículo / unidad</span>
          <span>Stock actual</span>
          <span>Mínimo</span>
          <span>Estado</span>
          <span>Consulta</span>
        </div>

        {grupo.articulos.map((a) => {
          const equiv = describirStockEmpaque(a.nombre, a.stockActual);

          return (
            <div key={a.idProducto} className={styles.fila}>
              <div>
                <div className={styles.nombre}>{a.nombre}</div>
                <div className={styles.unidad}>{a.unidadMedida}</div>
              </div>
              <div>
                <span className={styles.stock}>{formatearCantidad(a.stockActual)}</span>
                {equiv && <span className={styles.empaqueEquiv}>({equiv})</span>}
              </div>
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
          );
        })}
      </div>
    </section>
  );
}
