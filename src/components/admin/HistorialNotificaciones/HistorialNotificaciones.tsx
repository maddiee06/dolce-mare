"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  X,
  ChevronUp,
  Package,
  Store,
  Receipt,
} from "lucide-react";
import styles from "./HistorialNotificaciones.module.scss";

export interface HistorialNotificacionesProps {
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

export default function HistorialNotificaciones({
  isOpen = true,
  onClose,
  className = "",
}: HistorialNotificacionesProps) {
  const [soloNoLeidos, setSoloNoLeidos] = useState(false);
  const [montado, setMontado] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);

  // Asegurar montaje en el cliente antes de invocar createPortal
  useEffect(() => {
    setMontado(true);
  }, []);

  // Cerrar al presionar la tecla Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !montado) return null;

  return createPortal(
    <>
      {/* 1. Backdrop oscuro translúcido sin blur para máximo rendimiento (cero lag) */}
      <div
        className={`fixed inset-0 z-50 bg-[#0e172a]/25 transition-opacity ${styles.backdrop}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 2. Sidebar Lateral Derecho (Full-Height con curvatura superior izquierda) */}
      <aside
        ref={sidebarRef}
        role="dialog"
        aria-modal="true"
        aria-label="Panel de Notificaciones"
        className={`fixed top-0 right-0 z-50 h-screen w-85 sm:w-[420px] bg-superficie border-l border-borde-suave flex flex-col overflow-hidden rounded-tl-3xl ${styles.sidebarDerecho} ${className}`}
      >
        {/* Cabecera (Idéntica a la referencia): X azul a la izquierda y Título "Notificaciones" */}
        <div className="flex items-center px-6 py-4 border-b border-borde-gris-claro bg-superficie shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1 text-primario hover:bg-superficie-hover transition-colors focus:outline-none"
            aria-label="Cerrar panel de notificaciones"
          >
            <X className="h-6 w-6 stroke-[2.5]" />
          </button>
          <h2 className="ml-3.5 text-lg font-bold text-texto-primario tracking-tight">
            Notificaciones
          </h2>
        </div>

        {/* Barra de Controles: Switch estilo iOS (Sin ruedita de configuración) */}
        <div className="flex items-center px-6 py-3.5 bg-superficie border-b border-borde-tenue shrink-0">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => setSoloNoLeidos(!soloNoLeidos)}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out relative flex items-center ${
                soloNoLeidos ? "bg-primario" : "bg-borde-gris"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-in-out ${
                  soloNoLeidos ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </div>
            <span className="text-sm font-medium text-texto-principal">
              Ver no leídos
            </span>
          </label>
        </div>

        {/* Lista de Notificaciones que llena la altura disponible */}
        <div className={`flex-1 overflow-y-auto ${styles.scrollLista}`}>
          {/* GRUPO 1: 01 nov 2026 */}
          <div className="flex items-center justify-between px-6 py-3 bg-superficie border-b border-borde-tenue sticky top-0 z-10">
            <span className="text-sm font-bold text-texto-oscuro">
              01 nov 2026
            </span>
            <ChevronUp className="h-4 w-4 text-texto-mutado" />
          </div>

          {/* Ítem 1: No Leído (Fondo tintado suave + punto azul indicador) */}
          <div className="px-6 py-4 bg-[#f4f8fc] border-b border-borde-tenue transition-colors hover:bg-[#eaf1f8] cursor-pointer">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-primario shrink-0" />
                {/* Punto indicador de no leído */}
                <span className="h-2 w-2 rounded-full bg-primario shrink-0" />
                <span className="text-sm font-bold text-texto-oscuro">
                  Inventario
                </span>
              </div>
              <span className="text-xs text-texto-mutado shrink-0">
                Hace alrededor de 2 horas
              </span>
            </div>
            <p className="text-sm font-semibold text-texto-oscuro leading-snug">
              Stock bajo de Lúcuma: Quedan solo 3 porciones en almacén principal.
            </p>
          </div>

          {/* GRUPO 2: 30 oct 2026 */}
          {(!soloNoLeidos || false) && (
            <>
              <div className="flex items-center justify-between px-6 py-3 bg-superficie border-b border-borde-tenue sticky top-0 z-10">
                <span className="text-sm font-bold text-texto-oscuro">
                  30 oct 2026
                </span>
                <ChevronUp className="h-4 w-4 text-texto-mutado" />
              </div>

              {/* Ítem 2: Leído (Fondo blanco, sin punto) */}
              <div className="px-6 py-4 bg-superficie border-b border-borde-tenue transition-colors hover:bg-superficie-hover cursor-pointer">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-texto-secundario shrink-0" />
                    <span className="text-sm font-bold text-texto-oscuro">
                      Caja
                    </span>
                  </div>
                  <span className="text-xs text-texto-mutado shrink-0">
                    30 oct.
                  </span>
                </div>
                <p className="text-sm font-semibold text-texto-oscuro leading-snug">
                  Cierre de turno registrado: Turno tarde cerrado por Ana Torres con total de S/ 1,420.50 sin diferencias.
                </p>
              </div>

              {/* Ítem 3: Leído */}
              <div className="px-6 py-4 bg-superficie border-b border-borde-tenue transition-colors hover:bg-superficie-hover cursor-pointer">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-texto-secundario shrink-0" />
                    <span className="text-sm font-bold text-texto-oscuro">
                      Inventario
                    </span>
                  </div>
                  <span className="text-xs text-texto-mutado shrink-0">
                    30 oct.
                  </span>
                </div>
                <p className="text-sm font-semibold text-texto-oscuro leading-snug">
                  Reabastecimiento completado: Ingreso de 25 unidades de Vasos 16 oz Eco.
                </p>
              </div>

              {/* GRUPO 3: 29 oct 2026 */}
              <div className="flex items-center justify-between px-6 py-3 bg-superficie border-b border-borde-tenue sticky top-0 z-10">
                <span className="text-sm font-bold text-texto-oscuro">
                  29 oct 2026
                </span>
                <ChevronUp className="h-4 w-4 text-texto-mutado" />
              </div>

              {/* Ítem 4: Leído */}
              <div className="px-6 py-4 bg-superficie border-b border-borde-tenue transition-colors hover:bg-superficie-hover cursor-pointer">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-texto-secundario shrink-0" />
                    <span className="text-sm font-bold text-texto-oscuro">
                      Ventas
                    </span>
                  </div>
                  <span className="text-xs text-texto-mutado shrink-0">
                    29 oct.
                  </span>
                </div>
                <p className="text-sm font-semibold text-texto-oscuro leading-snug">
                  Meta de fin de semana alcanzada con 180 órdenes atendidas en la sede Chimbote.
                </p>
              </div>
            </>
          )}
        </div>
      </aside>
    </>,
    document.body
  );
}
