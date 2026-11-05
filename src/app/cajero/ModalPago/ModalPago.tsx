"use client";

import React, { useState, useEffect } from "react";
import {
  Banknote,
  CreditCard,
  Smartphone,
  Layers,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { DetalleCobroMixto } from "../../../dao/interfaces/IPedidoDAO";

export interface CuentaCobrarInfo {
  id_pedido: number | string;
  cliente?: string | null;
  total: number;
  detalle?: string | null;
}

export interface ModalPagoProps {
  isOpen: boolean;
  cuenta: CuentaCobrarInfo | null;
  onClose: () => void;
  onCompletarPago: (
    id_pedido: number,
    metodo: "efectivo" | "tarjeta" | "yape" | "mixto",
    detalleMixto?: DetalleCobroMixto
  ) => Promise<void>;
}

export default function ModalPago({
  isOpen,
  cuenta,
  onClose,
  onCompletarPago,
}: ModalPagoProps) {
  const [metodo, setMetodo] = useState<"efectivo" | "tarjeta" | "yape" | "mixto">("efectivo");
  const [recibido, setRecibido] = useState("");
  const [procesando, setProcesando] = useState(false);
  const [exito, setExito] = useState(false);

  // Estados para Cobro Mixto
  const [montoEfectivoMixto, setMontoEfectivoMixto] = useState<number>(0);
  const [montoDigitalMixto, setMontoDigitalMixto] = useState<number>(0);
  const [metodoDigitalMixto, setMetodoDigitalMixto] = useState<"tarjeta" | "yape">("yape");
  const [recibidoEfectivoMixto, setRecibidoEfectivoMixto] = useState("");

  const total = Number(cuenta?.total || 0);

  // Inicializar o resetear valores al abrir o cambiar de cuenta
  useEffect(() => {
    if (cuenta) {
      setMetodo("efectivo");
      setRecibido("");
      setProcesando(false);
      setExito(false);
      // Inicializar mixto por defecto 50% y 50%
      const mitad = parseFloat((total / 2).toFixed(2));
      setMontoEfectivoMixto(mitad);
      setMontoDigitalMixto(parseFloat((total - mitad).toFixed(2)));
      setRecibidoEfectivoMixto("");
    }
  }, [cuenta, total]);

  if (!isOpen || !cuenta) return null;

  const montoRecibido = Number(recibido || 0);
  const vuelto = Math.max(montoRecibido - total, 0);

  // Cálculos para mixto
  const sumaMixto = parseFloat((montoEfectivoMixto + montoDigitalMixto).toFixed(2));
  const diferenciaMixto = parseFloat((total - sumaMixto).toFixed(2));
  const montoRecibidoMixto = Number(recibidoEfectivoMixto || 0);
  const vueltoMixto = Math.max(montoRecibidoMixto - montoEfectivoMixto, 0);

  const seleccionarMetodo = (nuevoMetodo: typeof metodo) => {
    setMetodo(nuevoMetodo);
    if (nuevoMetodo !== "efectivo") setRecibido("");
    if (nuevoMetodo === "mixto") {
      const mitad = parseFloat((total / 2).toFixed(2));
      setMontoEfectivoMixto(mitad);
      setMontoDigitalMixto(parseFloat((total - mitad).toFixed(2)));
      setRecibidoEfectivoMixto("");
    }
  };

  const handleCambioEfectivoMixto = (val: number) => {
    const valLimpio = Math.max(0, Math.min(total, val));
    setMontoEfectivoMixto(valLimpio);
    setMontoDigitalMixto(parseFloat((total - valLimpio).toFixed(2)));
  };

  const handleCambioDigitalMixto = (val: number) => {
    const valLimpio = Math.max(0, Math.min(total, val));
    setMontoDigitalMixto(valLimpio);
    setMontoEfectivoMixto(parseFloat((total - valLimpio).toFixed(2)));
  };

  const esValidoParaCompletar = (): boolean => {
    if (metodo === "efectivo") {
      return montoRecibido >= total;
    }
    if (metodo === "tarjeta" || metodo === "yape") {
      return true;
    }
    if (metodo === "mixto") {
      const sumaOk = Math.abs(diferenciaMixto) < 0.01;
      const efectivoOk = montoRecibidoMixto >= montoEfectivoMixto;
      return sumaOk && efectivoOk && montoEfectivoMixto > 0 && montoDigitalMixto > 0;
    }
    return false;
  };

  const handleCompletar = async () => {
    if (!esValidoParaCompletar()) return;
    setProcesando(true);
    try {
      let detalleMixto: DetalleCobroMixto | undefined = undefined;
      if (metodo === "mixto") {
        detalleMixto = {
          montoEfectivo: montoEfectivoMixto,
          montoDigital: montoDigitalMixto,
          metodoDigital: metodoDigitalMixto,
        };
      }

      await onCompletarPago(Number(cuenta.id_pedido), metodo, detalleMixto);
      setExito(true);
      setTimeout(() => {
        setExito(false);
        setProcesando(false);
        setRecibido("");
        onClose();
      }, 1000);
    } catch (error) {
      console.error("Error al procesar pago:", error);
      setProcesando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[460px] max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-[#2a4d8f]">Finalizar Venta</h2>
            <p className="text-xs text-[#8a8580]">
              Pedido #{cuenta.id_pedido} · {cuenta.cliente || "Mesa"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={procesando}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="p-6 flex flex-col gap-4">
          {/* Monto principal */}
          <div className="flex flex-col items-center justify-center py-3.5 px-6 bg-[#f7f4ef] rounded-2xl border border-[#eee9e2]">
            <span className="text-[11px] font-bold text-[#8a8580] uppercase tracking-wider">
              Total a pagar
            </span>
            <strong className="text-3xl md:text-4xl font-extrabold text-[#2d2a26] mt-0.5">
              S/ {total.toFixed(2)}
            </strong>
            {cuenta.detalle && (
              <p className="text-xs text-[#8a8580] mt-1.5 text-center line-clamp-2">
                {cuenta.detalle}
              </p>
            )}
          </div>

          {/* Selector de métodos de pago (4 opciones: Efectivo, Tarjeta, Yape, Mixto) */}
          <div>
            <label className="text-[11px] font-bold text-[#8a8580] uppercase tracking-wider block mb-2">
              Método de pago
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => seleccionarMetodo("efectivo")}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border-2 font-bold text-xs gap-1 transition-all cursor-pointer ${
                  metodo === "efectivo"
                    ? "border-[#e8956b] bg-[#fbe8dd] text-[#2a4d8f] shadow-xs"
                    : "border-gray-200 bg-gray-50 text-[#8a8580] hover:bg-gray-100"
                }`}
              >
                <Banknote size={18} />
                <span>Efectivo</span>
              </button>

              <button
                type="button"
                onClick={() => seleccionarMetodo("tarjeta")}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border-2 font-bold text-xs gap-1 transition-all cursor-pointer ${
                  metodo === "tarjeta"
                    ? "border-[#e8956b] bg-[#fbe8dd] text-[#2a4d8f] shadow-xs"
                    : "border-gray-200 bg-gray-50 text-[#8a8580] hover:bg-gray-100"
                }`}
              >
                <CreditCard size={18} />
                <span>Tarjeta</span>
              </button>

              <button
                type="button"
                onClick={() => seleccionarMetodo("yape")}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border-2 font-bold text-xs gap-1 transition-all cursor-pointer ${
                  metodo === "yape"
                    ? "border-[#e8956b] bg-[#fbe8dd] text-[#2a4d8f] shadow-xs"
                    : "border-gray-200 bg-gray-50 text-[#8a8580] hover:bg-gray-100"
                }`}
              >
                <Smartphone size={18} />
                <span>Yape/Plin</span>
              </button>

              <button
                type="button"
                onClick={() => seleccionarMetodo("mixto")}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border-2 font-bold text-xs gap-1 transition-all cursor-pointer ${
                  metodo === "mixto"
                    ? "border-[#e8956b] bg-[#fbe8dd] text-[#2a4d8f] shadow-xs"
                    : "border-gray-200 bg-gray-50 text-[#8a8580] hover:bg-gray-100"
                }`}
              >
                <Layers size={18} />
                <span>Mixto</span>
              </button>
            </div>
          </div>

          {/* 1. SECCIÓN EFECTIVO PURO */}
          {metodo === "efectivo" && (
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-[#8a8580] block mb-1">
                  Efectivo recibido (S/)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#2a4d8f]">
                    S/
                  </span>
                  <input
                    type="number"
                    step="0.10"
                    min="0"
                    value={recibido}
                    onChange={(e) => setRecibido(e.target.value)}
                    placeholder={total.toFixed(2)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border-2 border-gray-200 focus:border-[#e8956b] focus:outline-none text-base font-bold text-[#2d2a26]"
                  />
                </div>
              </div>

              {/* Botones de montos rápidos */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRecibido(total.toFixed(2))}
                  className="flex-1 py-1 px-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-[#2d2a26] transition-colors cursor-pointer"
                >
                  Exacto
                </button>
                <button
                  type="button"
                  onClick={() => setRecibido((Math.ceil(total / 10) * 10).toFixed(2))}
                  className="flex-1 py-1 px-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-[#2d2a26] transition-colors cursor-pointer"
                >
                  S/ {(Math.ceil(total / 10) * 10).toFixed(2)}
                </button>
                <button
                  type="button"
                  onClick={() => setRecibido((Math.ceil(total / 20) * 20 || 20).toFixed(2))}
                  className="flex-1 py-1 px-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-[#2d2a26] transition-colors cursor-pointer"
                >
                  S/ {(Math.ceil(total / 20) * 20 || 20).toFixed(2)}
                </button>
                <button
                  type="button"
                  onClick={() => setRecibido("50.00")}
                  className="flex-1 py-1 px-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-[#2d2a26] transition-colors cursor-pointer"
                >
                  S/ 50
                </button>
              </div>

              {/* Vuelto */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 mt-1">
                <span className="text-xs font-semibold text-[#8a8580]">
                  Vuelto / Cambio en efectivo
                </span>
                <strong
                  className={`text-base font-extrabold ${
                    montoRecibido >= total ? "text-green-600" : "text-gray-400"
                  }`}
                >
                  S/ {vuelto.toFixed(2)}
                </strong>
              </div>
            </div>
          )}

          {/* 2. SECCIÓN TARJETA O YAPE PURO */}
          {(metodo === "tarjeta" || metodo === "yape") && (
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 text-center">
              <p className="text-xs text-[#2a4d8f] font-medium">
                {metodo === "tarjeta"
                  ? "Pase la tarjeta por el POS electrónico o terminal bancario."
                  : "Solicite al cliente el escaneo del código QR de Yape o Plin."}
              </p>
              <p className="text-lg font-extrabold text-[#2a4d8f] mt-1">
                Monto: S/ {total.toFixed(2)}
              </p>
            </div>
          )}

          {/* 3. SECCIÓN COBRO MIXTO (NUEVO) */}
          {metodo === "mixto" && (
            <div className="flex flex-col gap-3 bg-slate-50 p-3.5 rounded-2xl border border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#2a4d8f]">
                  División de Pago Mixto
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const mitad = parseFloat((total / 2).toFixed(2));
                    setMontoEfectivoMixto(mitad);
                    setMontoDigitalMixto(parseFloat((total - mitad).toFixed(2)));
                  }}
                  className="text-[11px] font-bold text-[#e8956b] hover:underline cursor-pointer"
                >
                  Dividir 50% / 50%
                </button>
              </div>

              {/* Fila 1: Monto en Efectivo */}
              <div className="bg-white p-3 rounded-xl border border-gray-200 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#2d2a26] flex items-center gap-1.5">
                    <Banknote size={16} className="text-green-600" />
                    Parte en Efectivo
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-[#8a8580]">S/</span>
                    <input
                      type="number"
                      step="0.50"
                      min="0"
                      max={total}
                      value={montoEfectivoMixto}
                      onChange={(e) => handleCambioEfectivoMixto(parseFloat(e.target.value) || 0)}
                      className="w-20 text-right font-bold text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:border-[#e8956b]"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-gray-100 text-xs">
                  <span className="text-[#8a8580]">Efectivo recibido:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.50"
                      min="0"
                      placeholder={montoEfectivoMixto.toFixed(2)}
                      value={recibidoEfectivoMixto}
                      onChange={(e) => setRecibidoEfectivoMixto(e.target.value)}
                      className="w-20 text-right font-bold text-xs border border-gray-300 rounded-lg px-2 py-0.5 focus:outline-none focus:border-[#e8956b]"
                    />
                    <span className="text-[#8a8580]">Vuelto:</span>
                    <strong className="text-green-600 font-bold">
                      S/ {vueltoMixto.toFixed(2)}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Fila 2: Monto Digital (Tarjeta / Yape) */}
              <div className="bg-white p-3 rounded-xl border border-gray-200 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#2d2a26]">
                      Parte Digital
                    </span>
                    <div className="flex bg-gray-100 p-0.5 rounded-lg text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => setMetodoDigitalMixto("yape")}
                        className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                          metodoDigitalMixto === "yape"
                            ? "bg-[#2a4d8f] text-white"
                            : "text-[#8a8580]"
                        }`}
                      >
                        Yape
                      </button>
                      <button
                        type="button"
                        onClick={() => setMetodoDigitalMixto("tarjeta")}
                        className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                          metodoDigitalMixto === "tarjeta"
                            ? "bg-[#2a4d8f] text-white"
                            : "text-[#8a8580]"
                        }`}
                      >
                        Tarjeta
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-[#8a8580]">S/</span>
                    <input
                      type="number"
                      step="0.50"
                      min="0"
                      max={total}
                      value={montoDigitalMixto}
                      onChange={(e) => handleCambioDigitalMixto(parseFloat(e.target.value) || 0)}
                      className="w-20 text-right font-bold text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:border-[#e8956b]"
                    />
                  </div>
                </div>
              </div>

              {/* Validación de balance */}
              <div className="flex items-center justify-between px-2 pt-1 text-xs">
                <span className="text-[#8a8580]">Suma de partes:</span>
                <div className="flex items-center gap-1">
                  <strong>S/ {sumaMixto.toFixed(2)}</strong>
                  {Math.abs(diferenciaMixto) < 0.01 ? (
                    <span className="text-green-600 font-bold flex items-center gap-0.5 text-[11px]">
                      ✓ Exacto
                    </span>
                  ) : diferenciaMixto > 0 ? (
                    <span className="text-red-500 font-bold text-[11px]">
                      (Faltan S/ {diferenciaMixto.toFixed(2)})
                    </span>
                  ) : (
                    <span className="text-amber-500 font-bold text-[11px]">
                      (Excede S/ {Math.abs(diferenciaMixto).toFixed(2)})
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Botón de Confirmación */}
          <button
            type="button"
            onClick={handleCompletar}
            disabled={procesando || exito || !esValidoParaCompletar()}
            className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
              exito
                ? "bg-green-600 text-white"
                : !esValidoParaCompletar()
                ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                : "bg-[#e8956b] hover:bg-[#d88258] text-white"
            }`}
          >
            {procesando ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Registrando venta...</span>
              </>
            ) : exito ? (
              <>
                <CheckCircle2 size={18} />
                <span>¡Venta Completada!</span>
              </>
            ) : (
              <span>Completar Venta · S/ {total.toFixed(2)}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
export { ModalPago };
