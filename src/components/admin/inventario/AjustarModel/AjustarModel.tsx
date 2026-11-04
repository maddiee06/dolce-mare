"use client";

import React, { useState } from "react";
import {
  X,
  ChevronDown,
  Loader2,
  SlidersHorizontal,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  Calculator,
} from "lucide-react";
import type {
  ArticuloInventario,
  TipoMovimiento,
} from "../../../../models/Inventario";
import { formatearCantidad } from "../../../../utils/estadoStock";
import styles from "./AjustarModel.module.scss";

interface AjustarModalProps {
  isOpen: boolean;
  onClose: () => void;
  producto: ArticuloInventario | null;
  tiposMovimiento: TipoMovimiento[];
  onConfirm: (
    idTipoMovimiento: number,
    cantidad: number,
    motivo: string
  ) => Promise<void>;
}

/**
 * Resuelve la unidad de medida según la sección oficial de Dolce Mare:
 * - Helados: Porción
 * - Cremoladas: Vaso
 * - Envases y Complementos: Unidades
 */
export function obtenerUnidadPorSeccion(
  categoria: string = "",
  unidadOriginal?: string
): string {
  const c = categoria.toLowerCase();
  if (c.includes("cremolada")) return "Vaso";
  if (c.includes("helado") || c.includes("sabor")) return "Porción";
  if (
    c.includes("envase") ||
    c.includes("complemento") ||
    c.includes("insumo") ||
    c.includes("unidad")
  ) {
    return "Unidades";
  }
  return unidadOriginal || "Unidad";
}

export default function AjustarModal({
  isOpen,
  onClose,
  producto,
  tiposMovimiento,
  onConfirm,
}: AjustarModalProps) {
  const [idTipoMovimiento, setIdTipoMovimiento] = useState<number | "">("");
  const [cantidad, setCantidad] = useState<number | "">("");
  const [motivo, setMotivo] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !producto) return null;

  const tipoSeleccionado = tiposMovimiento.find(
    (t) => t.idTipoMovimiento === Number(idTipoMovimiento)
  );

  const cantidadNumerica =
    typeof cantidad === "number"
      ? cantidad
      : parseFloat(String(cantidad)) || 0;

  // Resuelve dinámicamente si es Porción (Helados), Vaso (Cremoladas) o Unidades (Envases)
  const unidadMedida = obtenerUnidadPorSeccion(
    producto.categoria,
    producto.unidadMedida
  );

  // Cálculo en vivo del stock resultante según si el movimiento suma o resta
  let stockResultante: number | null = null;
  if (tipoSeleccionado && cantidadNumerica > 0) {
    if (tipoSeleccionado.afectaStock === "suma") {
      stockResultante = producto.stockActual + cantidadNumerica;
    } else {
      stockResultante = producto.stockActual - cantidadNumerica;
    }
  }

  const handleIncrementarCantidad = (delta: number) => {
    const actual = typeof cantidad === "number" ? cantidad : 0;
    setCantidad(Math.max(0, actual + delta));
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !guardando) {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idTipoMovimiento || !cantidad || cantidadNumerica <= 0) {
      setError(
        "Por favor completa el tipo de movimiento y una cantidad mayor a 0."
      );
      return;
    }

    if (stockResultante !== null && stockResultante < 0) {
      setError(
        `El movimiento no puede dejar el stock en negativo (${formatearCantidad(
          stockResultante
        )} ${unidadMedida}).`
      );
      return;
    }

    setGuardando(true);
    setError(null);
    try {
      await onConfirm(Number(idTipoMovimiento), cantidadNumerica, motivo);
      setIdTipoMovimiento("");
      setCantidad("");
      setMotivo("");
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al registrar el movimiento."
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-ajustar-titulo"
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#0e172a]/70 overflow-y-auto ${styles.overlay}`}
      onClick={handleBackdropClick}
    >
      <div
        className={`w-full max-w-lg bg-superficie rounded-3xl shadow-[var(--sombra-modal)] border border-borde-suave p-6 sm:p-7 relative overflow-hidden my-auto ${styles.modalContenedor}`}
      >
        {/* Botón Cerrar */}
        <button
          type="button"
          onClick={onClose}
          disabled={guardando}
          className="absolute top-5 right-5 rounded-full p-2 text-texto-mutado transition-colors hover:bg-superficie-hover hover:text-texto-primario focus:outline-none disabled:opacity-50"
          aria-label="Cerrar modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Cabecera del Modal */}
        <div className="mb-5 pr-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-xl bg-primario-suave text-primario">
              <SlidersHorizontal className="h-4 w-4" />
            </span>
            <h2
              id="modal-ajustar-titulo"
              className="text-2xl font-bold text-texto-primario tracking-tight"
            >
              Ajustar Stock
            </h2>
          </div>
          <p className="text-xs text-texto-mutado">
            Registra una entrada, merma o ajuste manual en el inventario.
          </p>
        </div>

        {/* Tarjeta de Información del Producto Actual */}
        <div className="mb-5 rounded-2xl border border-borde-suave bg-[#fbf8f4] p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-primario-suave text-primario font-extrabold flex items-center justify-center text-base border border-borde-suave shrink-0">
              {producto.nombre.charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="inline-block px-2 py-0.5 rounded-md bg-white text-[10px] font-bold uppercase tracking-wider text-primario border border-borde-gris mb-1">
                {producto.categoria}
              </span>
              <h3 className="text-base font-bold text-texto-oscuro leading-tight">
                {producto.nombre}
              </h3>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="block text-[10px] text-texto-mutado uppercase font-semibold">
              Stock actual
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-white border border-borde-suave text-texto-primario shadow-2xs">
              <span
                className={`h-2 w-2 rounded-full ${
                  producto.stockActual > producto.stockMinimo
                    ? "bg-exito"
                    : producto.stockActual > 0
                    ? "bg-advertencia-alerta"
                    : "bg-peligro"
                }`}
              />
              {formatearCantidad(producto.stockActual)} {unidadMedida}
            </span>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl border border-error-borde bg-error-fondo px-4 py-2.5 text-xs font-semibold text-error-texto flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-error-texto shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Campo: Tipo de Movimiento */}
          <div>
            <label
              htmlFor="tipo-movimiento"
              className="block text-xs uppercase font-bold tracking-wider text-texto-secundario mb-1.5"
            >
              Tipo de movimiento
            </label>
            <div className="relative">
              <select
                id="tipo-movimiento"
                value={idTipoMovimiento}
                onChange={(e) => setIdTipoMovimiento(Number(e.target.value))}
                disabled={guardando}
                className="w-full appearance-none rounded-xl border border-borde-gris bg-superficie-gris px-4 py-2.5 pr-10 text-sm font-semibold text-texto-principal transition-all duration-200 focus:border-primario focus:outline-none focus:ring-2 focus:ring-[var(--color-primario-focus)] disabled:cursor-not-allowed disabled:opacity-60"
                required
              >
                <option value="" disabled>
                  Selecciona una opción...
                </option>
                {tiposMovimiento.map((tipo) => (
                  <option
                    key={tipo.idTipoMovimiento}
                    value={tipo.idTipoMovimiento}
                  >
                    {tipo.nombre} ({tipo.afectaStock === "suma" ? "+ Suma" : "- Resta"})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-texto-mutado">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Campo: Cantidad a Ajustar */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="cantidad"
                className="block text-xs uppercase font-bold tracking-wider text-texto-secundario"
              >
                Cantidad ({unidadMedida})
              </label>
              <span className="text-[11px] text-texto-mutado font-medium">
                Mínimo: 0.1
              </span>
            </div>
            <div className="relative">
              <input
                id="cantidad"
                type="number"
                min="0.1"
                step="0.1"
                value={cantidad}
                onChange={(e) =>
                  setCantidad(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                placeholder="Ej. 10"
                disabled={guardando}
                className="w-full rounded-xl border border-borde-gris bg-superficie-gris py-2.5 pr-20 pl-4 text-base font-bold text-texto-principal transition-all duration-200 placeholder:text-texto-placeholder focus:border-primario focus:outline-none focus:ring-2 focus:ring-[var(--color-primario-focus)] disabled:cursor-not-allowed disabled:opacity-60"
                required
              />
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-xs font-semibold text-texto-mutado">
                {unidadMedida}
              </span>
            </div>

            {/* Botones de sugerencia rápida */}
            <div className="mt-1.5 flex items-center gap-1.5">
              <span className="text-[11px] text-texto-mutado font-medium">
                Rápido:
              </span>
              <button
                type="button"
                onClick={() => handleIncrementarCantidad(5)}
                className="px-2 py-0.5 rounded-lg bg-superficie-gris hover:bg-superficie-hover border border-borde-gris text-[11px] font-semibold text-texto-secundario transition-colors"
              >
                +5
              </button>
              <button
                type="button"
                onClick={() => handleIncrementarCantidad(10)}
                className="px-2 py-0.5 rounded-lg bg-superficie-gris hover:bg-superficie-hover border border-borde-gris text-[11px] font-semibold text-texto-secundario transition-colors"
              >
                +10
              </button>
              <button
                type="button"
                onClick={() => handleIncrementarCantidad(25)}
                className="px-2 py-0.5 rounded-lg bg-superficie-gris hover:bg-superficie-hover border border-borde-gris text-[11px] font-semibold text-texto-secundario transition-colors"
              >
                +25
              </button>
              <button
                type="button"
                onClick={() => setCantidad("")}
                className="px-2 py-0.5 rounded-lg bg-superficie-gris hover:bg-superficie-hover border border-borde-gris text-[11px] font-semibold text-texto-mutado transition-colors ml-auto"
              >
                Limpiar
              </button>
            </div>
          </div>

          {/* Simulador de Stock Resultante en Tiempo Real */}
          {stockResultante !== null && tipoSeleccionado && (
            <div className="rounded-2xl border border-borde-suave bg-[#f8f9fa] p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-texto-secundario">
                <span className="flex items-center gap-1.5">
                  <Calculator className="h-3.5 w-3.5 text-coral" />
                  <span>Resultado proyectado</span>
                </span>
                {tipoSeleccionado.afectaStock === "suma" ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-exito-texto bg-exito-fondo px-2 py-0.5 rounded-md">
                    <ArrowUpRight className="h-3 w-3" />
                    Suma al inventario
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-advertencia-texto bg-advertencia-fondo px-2 py-0.5 rounded-md">
                    <ArrowDownRight className="h-3 w-3" />
                    Resta del inventario
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-borde-tenue text-sm">
                <div className="flex flex-col">
                  <span className="text-[10px] text-texto-mutado uppercase font-medium">
                    Stock actual
                  </span>
                  <span className="font-bold text-texto-principal">
                    {formatearCantidad(producto.stockActual)}{" "}
                    <span className="text-xs font-normal text-texto-mutado">
                      {unidadMedida}
                    </span>
                  </span>
                </div>

                <ArrowRight className="h-4 w-4 text-texto-mutado" />

                <div className="flex flex-col text-right">
                  <span className="text-[10px] text-texto-mutado uppercase font-medium">
                    Nuevo stock resultante
                  </span>
                  <span
                    className={`font-extrabold text-base ${
                      stockResultante < 0
                        ? "text-peligro"
                        : "text-texto-primario"
                    }`}
                  >
                    {formatearCantidad(stockResultante)}{" "}
                    <span className="text-xs font-normal text-texto-mutado">
                      {unidadMedida}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Campo: Motivo (Opcional) */}
          <div>
            <label
              htmlFor="motivo"
              className="block text-xs uppercase font-bold tracking-wider text-texto-secundario mb-1.5"
            >
              Motivo{" "}
              <span className="text-[11px] font-normal text-texto-mutado lowercase">
                (opcional)
              </span>
            </label>
            <textarea
              id="motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej. Ingreso de mercadería, Producto dañado, Conteo de turno..."
              rows={2}
              disabled={guardando}
              className="w-full rounded-xl border border-borde-gris bg-superficie-gris px-4 py-2.5 text-xs font-medium text-texto-principal transition-all duration-200 placeholder:text-texto-placeholder focus:border-primario focus:outline-none focus:ring-2 focus:ring-[var(--color-primario-focus)] disabled:cursor-not-allowed disabled:opacity-60 resize-none"
            />
          </div>

          {/* Footer de Botones */}
          <div className="mt-6 pt-3 border-t border-borde-tenue flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={guardando}
              className="rounded-xl border border-borde-gris bg-superficie px-5 py-2.5 text-sm font-semibold text-texto-principal shadow-2xs transition-all duration-200 hover:bg-superficie-hover hover:border-borde-suave hover:text-texto-primario focus:outline-none focus:ring-2 focus:ring-borde-suave active:scale-[0.98] disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={
                guardando ||
                (stockResultante !== null && stockResultante < 0)
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-boton-primario px-6 py-2.5 text-sm font-bold text-texto-blanco shadow-sm transition-all duration-200 hover:bg-boton-primario-hover hover:-translate-y-0.5 hover:shadow active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[var(--color-primario-focus)] disabled:opacity-60 disabled:pointer-events-none disabled:transform-none"
            >
              {guardando && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{guardando ? "Guardando..." : "Guardar movimiento"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
