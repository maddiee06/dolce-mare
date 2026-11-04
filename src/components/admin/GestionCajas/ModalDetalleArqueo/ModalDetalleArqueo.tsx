"use client";

import React from "react";
import {
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  Banknote,
  CreditCard,
  Smartphone,
  ArrowDownRight,
  Receipt,
} from "lucide-react";
import styles from "./ModalDetalleArqueo.module.scss";

export interface MockTurnoCerrado {
  id: string;
  fecha: string;
  hora: string;
  turno: string;
  responsable: {
    nombre: string;
    iniciales: string;
    rol: string;
  };
  montoEsperado: number;
  montoReal: number;
  diferencia: number;
  estado: "cuadrado" | "faltante" | "por_revisar";
  desglose: {
    efectivo: number;
    tarjeta: number;
    yape: number;
    plin: number;
    retiros: number;
  };
  observacion?: string;
}

export interface ModalDetalleArqueoProps {
  isOpen: boolean;
  onClose: () => void;
  mockData: MockTurnoCerrado | null;
}

export const ModalDetalleArqueo: React.FC<ModalDetalleArqueoProps> = ({
  isOpen,
  onClose,
  mockData,
}) => {
  if (!isOpen || !mockData) return null;

  const formatMoneda = (monto: number) =>
    `S/ ${Math.abs(monto).toLocaleString("es-PE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const renderBadgeEstado = () => {
    switch (mockData.estado) {
      case "cuadrado":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-exito-fondo text-exito-texto border border-exito-borde shadow-2xs">
            <CheckCircle size={14} className="shrink-0" />
            <span>Turno Cuadrado</span>
          </span>
        );
      case "faltante":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-error-fondo text-error-texto border border-error-borde shadow-2xs">
            <AlertCircle size={14} className="shrink-0" />
            <span>Con Faltante</span>
          </span>
        );
      case "por_revisar":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-advertencia-fondo text-advertencia-texto border border-advertencia-borde shadow-2xs">
            <Clock size={14} className="shrink-0" />
            <span>Por Revisar</span>
          </span>
        );
    }
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
        {/* Cabecera con espaciado amplio y alineación precisa */}
        <div className="flex items-start justify-between pb-5 border-b border-borde-gris-claro">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-primario-suave text-texto-primario flex items-center justify-center border border-primario/15 shrink-0">
              <Receipt size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-texto-primario tracking-tight">
                Arqueo de Caja #{mockData.id}
              </h3>
              <p className="text-xs text-texto-mutado mt-0.5">
                {mockData.fecha} • {mockData.hora} ({mockData.turno})
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

        {/* Fila: Cajero Responsable y Estado */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-superficie-gris rounded-2xl border border-borde-tenue">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primario-suave text-texto-primario font-bold text-xs flex items-center justify-center border border-primario/15 shrink-0">
              {mockData.responsable.iniciales}
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xs text-texto-mutado font-medium">
                Cajero responsable
              </span>
              <span className="text-sm font-bold text-texto-principal">
                {mockData.responsable.nombre}
              </span>
              <span className="text-[11px] text-texto-mutado">
                {mockData.responsable.rol}
              </span>
            </div>
          </div>
          <div>{renderBadgeEstado()}</div>
        </div>

        {/* Comparación Visual: Esperado vs Contado Real vs Diferencia */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-superficie rounded-2xl p-4 border border-borde-tenue shadow-2xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-texto-mutado block mb-1">
              Efectivo Esperado
            </span>
            <div className="text-lg sm:text-xl font-bold text-texto-principal tracking-tight">
              {formatMoneda(mockData.montoEsperado)}
            </div>
            <span className="text-[11px] text-texto-mutado mt-0.5 block">
              Registrado en sistema
            </span>
          </div>

          <div className="bg-superficie rounded-2xl p-4 border border-borde-tenue shadow-2xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-texto-mutado block mb-1">
              Contado Real
            </span>
            <div className="text-lg sm:text-xl font-bold text-texto-principal tracking-tight">
              {formatMoneda(mockData.montoReal)}
            </div>
            <span className="text-[11px] text-texto-mutado mt-0.5 block">
              Efectivo en gaveta
            </span>
          </div>

          {/* Tarjeta Diferencia elegante: fondo sutil (bg-exito-fondo) con texto verde oscuro */}
          <div
            className={`rounded-2xl p-4 border shadow-2xs ${
              mockData.diferencia === 0
                ? "bg-exito-fondo border-exito-borde text-exito-texto"
                : mockData.diferencia < 0
                  ? "bg-error-fondo border-error-borde text-error-texto"
                  : "bg-exito-fondo border-exito-borde text-exito-texto"
            }`}
          >
            <span className="text-[11px] font-semibold uppercase tracking-wider block mb-1">
              Diferencia
            </span>
            <div className="text-lg sm:text-xl font-extrabold tracking-tight">
              {mockData.diferencia === 0
                ? "S/ 0.00 Exacto"
                : mockData.diferencia < 0
                  ? `-${formatMoneda(mockData.diferencia)}`
                  : `+${formatMoneda(mockData.diferencia)}`}
            </div>
            <span className="text-[11px] opacity-90 mt-0.5 block font-medium">
              {mockData.diferencia === 0
                ? "Caja perfectamente cuadrada"
                : mockData.diferencia < 0
                  ? "Faltante en entrega de efectivo"
                  : "Sobrante en entrega de efectivo"}
            </span>
          </div>
        </div>

        {/* Desglose de Pagos con separadores ultra tenues */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-texto-primario">
              Desglose de Cobros y Movimientos
            </h4>
            <span className="text-xs text-texto-mutado">
              Total ventas:{" "}
              <strong className="text-texto-principal font-bold">
                {formatMoneda(
                  mockData.desglose.efectivo +
                    mockData.desglose.tarjeta +
                    mockData.desglose.yape +
                    mockData.desglose.plin,
                )}
              </strong>
            </span>
          </div>

          <div className="bg-superficie-gris rounded-2xl p-4 border border-borde-tenue">
            {/* Efectivo */}
            <div className="flex items-center justify-between text-sm py-2.5 border-b border-borde-tenue">
              <div className="flex items-center gap-2 text-texto-principal font-medium">
                <Banknote size={16} className="text-emerald-600" />
                <span>Efectivo cobrado:</span>
              </div>
              <span className="font-bold text-texto-principal">
                {formatMoneda(mockData.desglose.efectivo)}
              </span>
            </div>

            {/* Tarjeta */}
            <div className="flex items-center justify-between text-sm py-2.5 border-b border-borde-tenue">
              <div className="flex items-center gap-2 text-texto-principal font-medium">
                <CreditCard size={16} className="text-primario" />
                <span>Tarjeta (POS):</span>
              </div>
              <span className="font-bold text-texto-principal">
                {formatMoneda(mockData.desglose.tarjeta)}
              </span>
            </div>

            {/* Yape */}
            <div className="flex items-center justify-between text-sm py-2.5 border-b border-borde-tenue">
              <div className="flex items-center gap-2 text-texto-principal font-medium">
                <Smartphone size={16} className="text-purple-600" />
                <span>Yape:</span>
              </div>
              <span className="font-bold text-texto-principal">
                {formatMoneda(mockData.desglose.yape)}
              </span>
            </div>

            {/* Plin */}
            <div className="flex items-center justify-between text-sm py-2.5 border-b border-borde-tenue">
              <div className="flex items-center gap-2 text-texto-principal font-medium">
                <Smartphone size={16} className="text-cyan-600" />
                <span>Plin:</span>
              </div>
              <span className="font-bold text-texto-principal">
                {formatMoneda(mockData.desglose.plin)}
              </span>
            </div>

            {/* Retiros (si hubo) */}
            {mockData.desglose.retiros > 0 && (
              <div className="flex items-center justify-between text-sm pt-2.5 text-error-texto">
                <div className="flex items-center gap-2 font-semibold">
                  <ArrowDownRight size={16} className="text-error-texto" />
                  <span>Retiros registrados en el turno:</span>
                </div>
                <span className="font-bold text-error-texto">
                  -{formatMoneda(mockData.desglose.retiros)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Observación / Nota de auditoría */}
        {mockData.observacion && (
          <div className="p-3.5 bg-superficie-gris rounded-2xl border border-borde-tenue text-xs text-texto-mutado">
            <strong className="text-texto-principal block mb-1">
              Observación de cierre:
            </strong>
            <p className="leading-relaxed">{mockData.observacion}</p>
          </div>
        )}

        {/* Acciones de cierre */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-borde-gris-claro">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-boton-primario hover:bg-boton-primario-hover transition-colors shadow-xs cursor-pointer active:scale-98"
          >
            Cerrar Detalle
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDetalleArqueo;
