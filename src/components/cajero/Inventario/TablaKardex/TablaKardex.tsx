import type { MovimientoKardex } from "../../../../models/Inventario";
import { formatearCantidad } from "../../../../utils/estadoStock";
import { partesFechaHora } from "../../../../utils/fechas";
import { esAjuste } from "../../../../utils/movimientos";
import styles from "./TablaKardex.module.scss";

interface Props {
  movimientos: MovimientoKardex[];
  unidad: string;
}

function claseTipo(m: MovimientoKardex): { etiqueta: string; clase: string } {
  if (esAjuste(m.tipo)) return { etiqueta: "Ajuste", clase: styles.ajuste };
  return m.afectaStock === "suma"
    ? { etiqueta: "Entrada", clase: styles.tipoEntrada }
    : { etiqueta: "Salida", clase: styles.tipoSalida };
}

export default function TablaKardex({ movimientos, unidad }: Props) {
  const n = movimientos.length;

  return (
    <section className={styles.tarjeta}>
      <header className={styles.cabecera}>
        <h2 className={styles.titulo}>Movimientos</h2>
        <span className={styles.conteo}>
          {n} {n === 1 ? "registro" : "registros"} · Cantidades en {unidad}
        </span>
      </header>

      {n === 0 ? (
        <p className={styles.vacio}>No hay movimientos en este periodo.</p>
      ) : (
        <div className={styles.scroll}>
          <div className={`${styles.fila} ${styles.encabezado}`}>
            <span>Fecha / hora</span>
            <span>Referencia o motivo / responsable</span>
            <span className={styles.der}>Entrada</span>
            <span className={styles.der}>Salida</span>
            <span className={styles.centro}>Tipo</span>
            <span className={styles.der}>Saldo</span>
          </div>

          {movimientos.map((m) => {
            const f = partesFechaHora(m.fecha);
            const tipo = claseTipo(m);
            const suma = m.afectaStock === "suma";

            return (
              <div key={m.idMovimiento} className={styles.fila}>
                <div>
                  <div className={styles.fecha}>
                    {f.fecha} · {f.hora}
                  </div>
                  <div className={styles.anio}>{f.anio}</div>
                </div>

                <div>
                  <div className={styles.motivo}>
                    {m.tipo}
                    {m.motivo ? ` · ${m.motivo}` : ""}
                  </div>
                  <div className={styles.responsable}>{m.usuario}</div>
                </div>

                <span className={`${styles.der} ${suma ? styles.entrada : styles.vacioCelda}`}>
                  {suma ? formatearCantidad(m.cantidad) : "—"}
                </span>
                <span className={`${styles.der} ${!suma ? styles.salida : styles.vacioCelda}`}>
                  {!suma ? formatearCantidad(m.cantidad) : "—"}
                </span>

                <span className={styles.centro}>
                  <span className={`${styles.badge} ${tipo.clase}`}>
                    <span className={styles.punto} />
                    {tipo.etiqueta}
                  </span>
                </span>

                <span className={styles.der}>
                  <span className={styles.saldo}>{formatearCantidad(m.stockResultante)}</span>
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}