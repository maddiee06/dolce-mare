"use client";

import { useState } from "react";
import styles from "./CuentasAbiertas.module.scss";
// Importamos la interfaz unificada
import { CuentaGuardadaType } from "../CuentasGuardadas/CuentasGuardadas";

// Helper opcional para formatear la hora (porque Supabase devuelve TIMESTAMPTZ)
function obtenerHora(fechaIso: string): string {
  if (!fechaIso) return "--:--";
  const fecha = new Date(fechaIso);
  return fecha.toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/Lima",
  });
}

interface Props {
  pedidos: CuentaGuardadaType[];
  error?: string | null;
}

export function CuentasAbiertas({ pedidos, error }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  // Filtramos solo las cuentas que están abiertas/pendientes DE FORMA SEGURA
  const cuentas = pedidos.filter((pedido) => {
    if (!pedido.estado || typeof pedido.estado !== "string") return false;
    
    const estadoMinuscula = pedido.estado.toLowerCase();
    // Ajustado para manejar posibles variaciones del estado en la base de datos
    return estadoMinuscula === "pendiente" || estadoMinuscula === "abierto" || estadoMinuscula === "en preparación";
  });

  const totalPendiente = cuentas.reduce(
    (total, pedido) => total + Number(pedido.total),
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
          {cuentas.map((pedido) => (
            <article className={styles.cuenta} key={pedido.id_pedido}>
              <div className={styles.filaPrincipal}>
                {/* Lógica para mostrar Delivery o Cliente */}
                <h3>{pedido.tipo_entrega?.toLowerCase() === "delivery" ? "Delivery" : pedido.cliente || `Pedido #${pedido.id_pedido}`}</h3>
                <strong>S/ {Number(pedido.total).toFixed(2)}</strong>
              </div>

              <div className={styles.filaDetalle}>
                <span>{pedido.detalle}</span>
                <time>{obtenerHora(pedido.fecha_pedido)}</time>
              </div>

              <span className={styles.estadoPendiente}>
                <span className={styles.punto}>●</span>
                {pedido.estado || "Abierto"}
              </span>
            </article>
          ))}
        </div>
      )}

      <a
        href="/cajero/cuentas-guardadas" 
        className={styles.botonGuardadas}
      >
        <span aria-hidden="true">→</span>
        Ver cuentas guardadas
      </a>
    </aside>
  );
}