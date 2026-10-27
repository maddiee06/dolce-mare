"use client";

import { Banknote, CreditCard, Smartphone, X } from "lucide-react";
import { useState } from "react";
import styles from "./ModalPago.module.scss";

export interface ModalPagoProps {
  isOpen: boolean;
  total: number;
  onClose: () => void;
}

export default function ModalPago({ isOpen, total, onClose }: ModalPagoProps) {
  const [metodo, setMetodo] = useState<"efectivo" | "tarjeta" | "yape">("efectivo");
  const [recibido, setRecibido] = useState("");

  if (!isOpen) return null;

  const montoRecibido = Number(recibido || 0);
  const vuelto = Math.max(montoRecibido - total, 0);
  const seleccionarMetodo = (nuevoMetodo: typeof metodo) => {
    setMetodo(nuevoMetodo);
    if (nuevoMetodo !== "efectivo") setRecibido("");
  };

  return (
    <div className={styles.backdrop} role="presentation" onMouseDown={onClose}>
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-pago"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <h2 id="titulo-pago">Finalizar venta</h2>
          <button type="button" className={styles.cerrar} onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </header>

        <div className={styles.cuerpo}>
          <div className={styles.montoPago}>
            <span>Total a pagar</span>
            <strong>S/ {total.toFixed(2)}</strong>
            <small>Mesa 04 · B001-0149 · 1 producto</small>
          </div>

          <div className={styles.metodos}>
            <button
              type="button"
              className={`${styles.metodo} ${metodo === "efectivo" ? styles.activo : ""}`}
              onClick={() => seleccionarMetodo("efectivo")}
            >
              <Banknote size={18} />
              <span>Efectivo</span>
            </button>
            <button
              type="button"
              className={`${styles.metodo} ${metodo === "tarjeta" ? styles.activo : ""}`}
              onClick={() => seleccionarMetodo("tarjeta")}
            >
              <CreditCard size={18} />
              <span>Tarjeta</span>
            </button>
            <button
              type="button"
              className={`${styles.metodo} ${metodo === "yape" ? styles.activo : ""}`}
              onClick={() => seleccionarMetodo("yape")}
            >
              <Smartphone size={18} />
              <span>Yape</span>
            </button>
          </div>

          {metodo === "efectivo" ? (
            <>
              <label className={styles.recibido}>
                <span>Efectivo recibido</span>
                <input
                  type="number"
                  min="0"
                  step="0.10"
                  value={recibido}
                  onChange={(event) => setRecibido(event.target.value)}
                  placeholder="0.00"
                />
              </label>
              <div className={styles.vuelto}>
                <span>Vuelto / cambio</span>
                <strong>S/ {vuelto.toFixed(2)}</strong>
              </div>
            </>
          ) : (
            <div className={styles.vuelto}>
              <span>Monto con {metodo === "tarjeta" ? "tarjeta" : "Yape"}</span>
              <strong>S/ {total.toFixed(2)}</strong>
            </div>
          )}

          {metodo === "efectivo" && (
            <div className={styles.teclado}>
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", ".", "⌫"].map((tecla) => (
                <button
                  key={tecla}
                  type="button"
                  onClick={() => {
                    if (tecla === "⌫") setRecibido((valor) => valor.slice(0, -1));
                    else if (tecla === ".") setRecibido((valor) => valor.includes(".") ? valor : `${valor}.`);
                    else setRecibido((valor) => `${valor}${tecla}`);
                  }}
                >
                  {tecla}
                </button>
              ))}
            </div>
          )}

          <button type="button" className={styles.completar} disabled={metodo === "efectivo" && montoRecibido < total}>
            Completar Venta
          </button>
        </div>
      </section>
    </div>
  );
}
