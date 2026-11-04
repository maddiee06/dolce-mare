"use client";

import React, { useState } from "react";
import {
  Banknote,
  MinusCircle,
  Coins,
  ArrowDownRight,
  Wallet,
  CreditCard,
  Smartphone,
  Sparkles,
} from "lucide-react";

export interface PanelCajaActivaProps {
  nombreResponsable?: string;
  turno?: string;
  fondoInicial?: number;
  retirosTotal?: number;
  efectivoEsperado?: number;
  desglose?: {
    efectivo: number;
    tarjeta: number;
    yape: number;
    plin: number;
  };
}

export const PanelCajaActiva: React.FC<PanelCajaActivaProps> = ({
  nombreResponsable = "Camila Rojas",
  turno = "Turno Mañana (08:30 - 16:30)",
  fondoInicial = 150.0,
  retirosTotal = 20.0,
  efectivoEsperado = 480.0,
  desglose = {
    efectivo: 350.0,
    tarjeta: 240.0,
    yape: 185.0,
    plin: 75.0,
  },
}) => {
  const [modalRetiroAbierto, setModalRetiroAbierto] = useState(false);

  const formatMoneda = (monto: number) =>
    `S/ ${monto.toLocaleString("es-PE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const totalVentasTurno =
    desglose.efectivo + desglose.tarjeta + desglose.yape + desglose.plin;

  return (
    <div className="w-full bg-superficie rounded-3xl p-6 sm:p-8 border border-borde-suave shadow-[var(--sombra-tarjeta)] transition-all">
      {/* ============================================================== */}
      {/* FILA 1: ESTADO DEL TURNO + RESPONSABLE & ACCIÓN REGISTRAR RETIRO */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-borde-tenue">
        <div className="flex flex-wrap items-center gap-3">
          {/* Badge Turno Abierto con dot animado */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-exito-fondo text-exito-texto border border-exito-borde shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            <span>Turno Abierto</span>
          </div>

          {/* Separador vertical sutil */}
          <span className="hidden sm:inline-block w-px h-4 bg-borde-gris" />

          {/* Datos del Responsable */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primario-suave text-texto-primario font-bold text-xs flex items-center justify-center border border-primario/15">
              CR
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-bold text-texto-principal">
                {nombreResponsable}
              </span>
              <span className="text-xs text-texto-mutado">{turno}</span>
            </div>
          </div>
        </div>

        {/* Botón secundario: Registrar Retiro */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setModalRetiroAbierto(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm text-texto-principal bg-superficie-gris hover:bg-boton-secundario hover:text-coral-oscuro border border-borde-gris transition-all duration-200 cursor-pointer shadow-xs active:scale-[0.98]"
          >
            <MinusCircle size={17} className="text-coral-oscuro" />
            <span>Registrar Retiro</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* FILA 2: GRID DE MÉTRICAS (FONDO, RETIROS Y EFECTIVO ESPERADO) */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 py-6">
        {/* Métrica 1: Fondo Inicial */}
        <div className="bg-superficie-gris/60 rounded-2xl p-5 border border-borde-tenue flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-texto-mutado">
              Fondo Inicial
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/50">
              <Coins size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-texto-principal tracking-tight">
              {formatMoneda(fondoInicial)}
            </div>
            <p className="text-xs text-texto-mutado mt-1">
              Monto con el que abrió la caja hoy
            </p>
          </div>
        </div>

        {/* Métrica 2: Retiros */}
        <div className="bg-superficie-gris/60 rounded-2xl p-5 border border-borde-tenue flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-texto-mutado">
              Retiros Realizados
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-danger flex items-center justify-center border border-rose-200/50">
              <ArrowDownRight size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-danger tracking-tight">
              -{formatMoneda(retirosTotal)}
            </div>
            <p className="text-xs text-texto-mutado mt-1">
              1 egreso autorizado (Compra de insumos)
            </p>
          </div>
        </div>

        {/* Métrica 3 (Destacada): Efectivo Esperado en Caja */}
        <div className="relative bg-gradient-to-br from-primario-suave/70 via-superficie to-superficie rounded-2xl p-5 border-2 border-primario/25 shadow-sm flex flex-col justify-between overflow-hidden group">
          {/* Brillo de fondo sutil */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-primario/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-texto-primario flex items-center gap-1.5">
              <Sparkles size={14} className="text-coral" />
              Efectivo Esperado
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primario-suave text-texto-primario border border-primario/20">
              En tiempo real
            </span>
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-texto-primario tracking-tight">
              {formatMoneda(efectivoEsperado)}
            </div>
            <div className="flex items-center gap-1 text-xs text-texto-mutado mt-1.5">
              <Wallet size={13} className="text-texto-primario" />
              <span>Fondo + Cobros en efectivo - Retiros</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* FILA 3: DESGLOSE DE COBROS HORIZONTAL (FONDO SUPERFICIE-GRIS)   */}
      {/* ============================================================== */}
      <div className="bg-superficie-gris rounded-xl p-4 sm:p-5 border border-borde-tenue">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-texto-primario">
              Desglose de Cobros del Turno
            </span>
            <span className="text-xs text-texto-mutado">
              • Total ventas:{" "}
              <strong className="text-texto-principal font-semibold">
                {formatMoneda(totalVentasTurno)}
              </strong>
            </span>
          </div>
          <span className="text-[11px] text-texto-mutado font-medium">
            37 transacciones registradas
          </span>
        </div>

        {/* Fila horizontal con los 4 métodos de pago */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {/* 1. Efectivo */}
          <div className="bg-superficie rounded-xl p-3 border border-borde-tenue flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
              <Banknote size={20} />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-texto-mutado truncate">
                Efectivo
              </div>
              <div className="text-sm font-bold text-texto-principal">
                {formatMoneda(desglose.efectivo)}
              </div>
            </div>
          </div>

          {/* 2. Tarjeta */}
          <div className="bg-superficie rounded-xl p-3 border border-borde-tenue flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-primario flex items-center justify-center shrink-0 border border-blue-100">
              <CreditCard size={20} />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-texto-mutado truncate">
                Tarjeta (POS)
              </div>
              <div className="text-sm font-bold text-texto-principal">
                {formatMoneda(desglose.tarjeta)}
              </div>
            </div>
          </div>

          {/* 3. Yape */}
          <div className="bg-superficie rounded-xl p-3 border border-borde-tenue flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-100">
              <Smartphone size={20} />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-texto-mutado truncate">
                Yape
              </div>
              <div className="text-sm font-bold text-texto-principal">
                {formatMoneda(desglose.yape)}
              </div>
            </div>
          </div>

          {/* 4. Plin */}
          <div className="bg-superficie rounded-xl p-3 border border-borde-tenue flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center shrink-0 border border-cyan-100">
              <Smartphone size={20} />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-texto-mutado truncate">
                Plin
              </div>
              <div className="text-sm font-bold text-texto-principal">
                {formatMoneda(desglose.plin)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal simulado para registrar retiro (UI de alta fidelidad) */}
      {modalRetiroAbierto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 animate-in fade-in duration-200"
        >
          <div className="bg-superficie rounded-3xl p-6 sm:p-7 max-w-md w-full border border-borde-suave shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-borde-tenue">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-danger flex items-center justify-center">
                  <MinusCircle size={18} />
                </div>
                <h3 className="text-lg font-bold text-texto-primario">
                  Registrar Retiro de Caja
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalRetiroAbierto(false)}
                className="text-texto-mutado hover:text-texto-principal p-1 rounded-lg hover:bg-superficie-gris"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-texto-mutado">
              Registra una salida de dinero en efectivo durante el turno de{" "}
              <strong className="text-texto-principal">{nombreResponsable}</strong>.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-texto-principal mb-1">
                  Monto a retirar (S/)
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  defaultValue="20.00"
                  className="w-full bg-superficie border border-borde-gris rounded-xl px-4 py-2.5 text-sm font-bold text-texto-principal focus:outline-none focus:border-primario"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-texto-principal mb-1">
                  Motivo del retiro
                </label>
                <input
                  type="text"
                  placeholder="Ej. Compra de bolsas / Pago a proveedor"
                  defaultValue="Compra urgente de servilletas"
                  className="w-full bg-superficie border border-borde-gris rounded-xl px-4 py-2.5 text-sm text-texto-principal focus:outline-none focus:border-primario"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setModalRetiroAbierto(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-texto-principal bg-superficie-gris hover:bg-superficie-hover border border-borde-gris cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => setModalRetiroAbierto(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-boton-primario hover:bg-boton-primario-hover transition-colors shadow-xs cursor-pointer"
              >
                Confirmar Retiro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PanelCajaActiva;
