"use client";

import { useState } from "react";
import styles from "./CuentasAbiertas.module.scss";

interface RelacionNombre {
  nombre: string;
}

interface DetallePedido {
  cantidad: number | string;
  productos:
    | RelacionNombre
    | RelacionNombre[]
    | null;
}

interface Pedido {
  id_pedido: number | string;
  total: number | string | null;
  fecha_pedido: string | null;
  estado?: RelacionNombre | RelacionNombre[] | null;
  entrega?: RelacionNombre | RelacionNombre[] | null;
  detalle_pedido?: DetallePedido[] | null;
}

interface Props {
  pedidos: Pedido[];
  error?: string | null;
}

function obtenerNombre(
  relacion: RelacionNombre | RelacionNombre[] | null | undefined
): string {
  if (Array.isArray(relacion)) {
    return relacion[0]?.nombre ?? "";
  }
  return relacion?.nombre ?? "";
}

function obtenerHora(fecha: string | null): string {
  if (!fecha) return "--:--";
  const fechaValida = new Date(fecha);
  if (Number.isNaN(fechaValida.getTime())) {
    return "--:--";
  }
  return fechaValida.toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/Lima",
  });
}

function obtenerProductos(detalles: DetallePedido[] | null | undefined) {
  if (!detalles?.length) return "Sin productos registrados";

  return detalles
    .map((detalle) => {
      const nombre = obtenerNombre(detalle.productos) || "Producto";
      return `${nombre} × ${Number(detalle.cantidad)}`;
    })
    .join(", ");
}

export function CuentasAbiertas({ pedidos, error }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const cuentas = pedidos.filter(
    (pedido) => obtenerNombre(pedido.estado).toLowerCase() === "abierto"
  );

  const totalPendiente = cuentas.reduce(
    (total, pedido) => total + Number(pedido.total ?? 0),
    0
  );

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  return (
    <aside className={`${styles.panel} ${isOpen ? styles.open : ""}`}>
      {/* Botón desplegable visible solo en mobile */}
      <button 
        className={styles.toggleMobileBtn} 
        onClick={togglePanel}
        aria-label="Abrir o cerrar cuentas abiertas"
      >
        <span className={styles.toggleInfo}>
          <span className={styles.toggleTitle}>Cuentas Abiertas</span>
          <span className={styles.toggleBadge}>{cuentas.length}</span>
        </span>
        <span className={`${styles.triangulo} ${isOpen ? styles.rotado : ""}`}>
          ▼
        </span>
      </button>

      <div className={styles.encabezado}>
        <h2>Cuentas Abiertas</h2>
        <span className={styles.contador}>{cuentas.length}</span>
      </div>

      <div className={styles.resumen}>
        <p>Total pendiente</p>
        <strong>S/ {totalPendiente.toFixed(2)}</strong>
      </div>

      {error ? (
        <p className={styles.mensaje}>
          No se pudieron cargar las cuentas.
        </p>
      ) : cuentas.length === 0 ? (
        <p className={styles.mensaje}>
          No hay cuentas abiertas en este momento.
        </p>
      ) : (
        <div className={styles.listaCuentas}>
          {cuentas.map((pedido) => {
            const tipoEntrega = obtenerNombre(pedido.entrega);
            const esDelivery = tipoEntrega
              .toLowerCase()
              .includes("delivery");

            return (
              <article
                className={styles.cuenta}
                key={pedido.id_pedido}
              >
                <div className={styles.filaPrincipal}>
                  <h3>
                    {esDelivery
                      ? "Delivery"
                      : tipoEntrega || `Pedido #${pedido.id_pedido}`}
                  </h3>

                  <strong>
                    S/ {Number(pedido.total ?? 0).toFixed(2)}
                  </strong>
                </div>

                <div className={styles.filaDetalle}>
                  <span>
                    {obtenerProductos(pedido.detalle_pedido)}
                  </span>
                  <time>{obtenerHora(pedido.fecha_pedido)}</time>
                </div>

                <span className={styles.estadoPendiente}>
                  <span className={styles.punto}>●</span>
                  Abierto
                </span>
              </article>
            );
          })}
        </div>
      )}

      <a
        href="/cuentas-guardadas"
        className={styles.botonGuardadas}
      >
        <span aria-hidden="true">→</span>
        Ver cuentas guardadas
      </a>
    </aside>
  );
}