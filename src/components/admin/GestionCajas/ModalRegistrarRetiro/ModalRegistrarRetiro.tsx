"use client";

import React, { useState } from "react";
import { MinusCircle, X, AlertCircle, Coins } from "lucide-react";
import styles from "./ModalRegistrarRetiro.module.scss";

export interface ModalRegistrarRetiroProps {
  isOpen: boolean;
  onClose: () => void;
  nombreResponsable?: string;
  efectivoDisponible?: number;
}

export const ModalRegistrarRetiro: React.FC<ModalRegistrarRetiroProps> = ({
  isOpen,
  onClose,
  nombreResponsable = "Camila Rojas",
  efectivoDisponible = 480.0,
}) => {
  const [monto, setMonto] = useState<string>("20.00");
  const [motivo, setMotivo] = useState<string>("Compra urgente de servilletas");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className={styles.overlay}
      onClick={onClose}
    >
      <div
        className={`${styles.modal} p-6 sm:p-8 space-y-6`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera alineada correctamente con padding */}
        <div className="flex items-start justify-between pb-4 border-b border-borde-gris-claro">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-error-fondo text-error-texto flex items-center justify-center border border-error-borde shrink-0">
              <MinusCircle size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-texto-primario tracking-tight">
                Registrar Retiro de Caja
              </h3>
              <p className="text-xs text-texto-mutado mt-0.5">
                Turno en curso • Responsable: {nombreResponsable}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-1.5 rounded-xl text-texto-mutado hover:text-texto-principal hover:bg-superficie-gris transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Tarjeta informativa de efectivo disponible */}
          <div className="flex items-center gap-3 p-3.5 bg-superficie-gris rounded-2xl border border-borde-tenue">
            <Coins size={18} className="text-texto-primario shrink-0" />
            <div className="text-xs text-texto-mutado">
              Efectivo disponible en caja:{" "}
              <strong className="text-texto-principal font-bold">
                S/ {efectivoDisponible.toFixed(2)}
              </strong>
            </div>
          </div>

          {/* Input Monto */}
          <div className="space-y-1.5">
            <label
              htmlFor="montoRetiroInput"
              className="block text-xs font-semibold text-texto-principal"
            >
              Monto a retirar (S/)
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-sm font-bold text-texto-mutado">
                S/
              </div>
              <input
                id="montoRetiroInput"
                type="number"
                step="0.10"
                min="0.10"
                max={efectivoDisponible}
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="0.00"
                required
                className="w-full bg-superficie-gris border border-borde-gris rounded-xl pl-11 pr-4 py-2.5 text-base font-bold text-texto-principal focus:bg-superficie focus:border-primario focus:ring-1 focus:ring-primario focus:outline-none transition-all shadow-2xs"
              />
            </div>
            {/* Sugerencias de montos frecuentes */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-texto-mutado font-medium">
                Sugerencias:
              </span>
              {[10, 20, 50, 100].map((valor) => (
                <button
                  key={valor}
                  type="button"
                  onClick={() => setMonto(valor.toFixed(2))}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-superficie-gris hover:bg-boton-secundario text-texto-principal hover:text-coral-oscuro border border-borde-gris transition-colors cursor-pointer"
                >
                  S/ {valor}
                </button>
              ))}
            </div>
          </div>

          {/* Input Motivo */}
          <div className="space-y-1.5">
            <label
              htmlFor="motivoRetiroInput"
              className="block text-xs font-semibold text-texto-principal"
            >
              Motivo del retiro
            </label>
            <input
              id="motivoRetiroInput"
              type="text"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej. Compra de insumos, sencillo, pago autorizado"
              required
              className="w-full bg-superficie-gris border border-borde-gris rounded-xl px-4 py-2.5 text-sm text-texto-principal focus:bg-superficie focus:border-primario focus:ring-1 focus:ring-primario focus:outline-none transition-all shadow-2xs"
            />
          </div>

          {/* Mensaje de advertencia sin colores quemados */}
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-advertencia-fondo border border-advertencia-borde text-advertencia-texto text-xs">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>
              Este retiro afectará inmediatamente el cálculo de{" "}
              <strong>Efectivo Esperado</strong> al momento de realizar el
              cierre de turno.
            </span>
          </div>

          {/* Acciones */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-borde-gris-claro">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-texto-principal bg-superficie-gris hover:bg-superficie-hover border border-borde-gris transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-boton-primario hover:bg-boton-primario-hover transition-colors shadow-xs cursor-pointer active:scale-98"
            >
              Confirmar Retiro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalRegistrarRetiro;
