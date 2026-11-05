"use client";

import React, { useState } from "react";
import Link from "next/link";
import { RefreshCw, CreditCard, X, Loader2 } from "lucide-react";
import { PedidoRelacional, RelacionNombre } from "../../../models/Pedido";

interface Props {
  pedidos: PedidoRelacional[];
  error?: string | null;
  cargando?: boolean;
  pedidoSeleccionadoId?: number | string | null;
  onCobrar?: (pedido: PedidoRelacional) => void;
  onSeleccionar?: (pedido: PedidoRelacional) => void;
  onRecargar?: () => void;
  onCancelar?: (idPedido: number, motivo: string) => Promise<void>;
}

// ─── Modal de cancelación inline ──────────────────────────────────────────────
function ModalCancelarInline({
  idPedido,
  onConfirm,
  onClose,
}: {
  idPedido: number;
  onConfirm: (motivo: string) => Promise<void>;
  onClose: () => void;
}) {
  const [motivo, setMotivo] = useState("");
  const [cargando, setCargando] = useState(false);

  const MOTIVOS = [
    "Se canceló por solicitud del cliente",
    "Error en el pedido",
    "Producto no disponible",
    "Cliente no recogió",
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-[#2d2a26] text-sm">
            Cancelar pedido #{idPedido}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-gray-100 cursor-pointer"
          >
            <X size={16} className="text-[#8a8580]" />
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          {MOTIVOS.map((m) => (
            <button
              key={m}
              onClick={() => setMotivo(m)}
              className={`text-left text-xs px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                motivo === m
                  ? "border-red-400 bg-red-50 text-red-700 font-semibold"
                  : "border-gray-200 hover:border-gray-300 text-[#2d2a26]"
              }`}
            >
              {m}
            </button>
          ))}
          <input
            type="text"
            placeholder="O escribe un motivo..."
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-red-400 text-[#2d2a26]"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-[#8a8580] hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Volver
          </button>
          <button
            onClick={async () => {
              if (!motivo.trim()) return;
              setCargando(true);
              await onConfirm(motivo.trim());
              setCargando(false);
            }}
            disabled={!motivo.trim() || cargando}
            className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {cargando ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <X size={13} />
            )}
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function obtenerNombre(
  relacion: RelacionNombre | RelacionNombre[] | string | null | undefined
): string {
  if (!relacion) return "";
  if (typeof relacion === "string") return relacion;
  if (Array.isArray(relacion)) return relacion[0]?.nombre ?? "";
  return relacion?.nombre ?? "";
}

function obtenerHora(fecha: string | null): string {
  if (!fecha) return "--:--";
  const fechaValida = new Date(fecha);
  if (Number.isNaN(fechaValida.getTime())) return "--:--";
  return fechaValida.toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/Lima",
  });
}

export function obtenerProductosTexto(pedido: PedidoRelacional): string {
  if (pedido.detalle) return pedido.detalle;
  if (!pedido.detalle_pedido?.length) return "Sin productos registrados";
  return pedido.detalle_pedido
    .map((detalle) => {
      const nombre = obtenerNombre(detalle.productos) || "Producto";
      return `${nombre} × ${Number(detalle.cantidad)}`;
    })
    .join(", ");
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function CuentasAbiertas({
  pedidos,
  error,
  cargando = false,
  pedidoSeleccionadoId,
  onCobrar,
  onSeleccionar,
  onRecargar,
  onCancelar,
}: Props) {
  const [cancelarId, setCancelarId] = useState<number | null>(null);

  const cuentas = pedidos.filter((pedido) => {
    const estadoNombre =
      obtenerNombre(pedido.estados_pedido) ||
      obtenerNombre(pedido.estado) ||
      "Abierto";
    const est = estadoNombre.toLowerCase();
    return est === "abierto" || est === "pendiente" || est === "en preparación";
  });

  const totalPendiente = cuentas.reduce(
    (total, pedido) => total + Number(pedido.total ?? 0),
    0
  );

  return (
    <div className="w-full h-full flex flex-col p-4 md:p-6 bg-white">
      {/* Encabezado */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <h2 className="text-xl font-bold text-[#2a4d8f] m-0">
          Cuentas Abiertas
        </h2>

        <div className="flex items-center gap-2">
          {onRecargar && (
            <button
              onClick={onRecargar}
              disabled={cargando}
              title="Actualizar cuentas"
              className="p-1 rounded-lg text-[#8a8580] hover:text-[#2a4d8f] hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <RefreshCw
                size={14}
                className={cargando ? "animate-spin text-[#2a4d8f]" : ""}
              />
            </button>
          )}
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#fae9db] text-[#a87552] text-xs font-bold">
            {cuentas.length}
          </span>
        </div>
      </div>

      {/* Tarjeta Resumen Total Pendiente */}
      <div className="p-4 mb-4 rounded-2xl bg-[#f7f4ef] border border-[#eee9e2]">
        <p className="text-xs text-[#8a8580] mb-1 font-medium">Total pendiente</p>
        <strong className="text-2xl md:text-3xl font-extrabold text-[#292929] block">
          S/ {totalPendiente.toFixed(2)}
        </strong>
      </div>

      {/* Lista de cuentas */}
      <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 min-h-0">
        {cargando && cuentas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-[#8a8580] gap-2">
            <RefreshCw size={20} className="animate-spin text-[#2a4d8f]" />
            <p className="text-xs">Cargando cuentas abiertas...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-red-50 text-red-600 text-xs text-center">
            {error}
          </div>
        ) : cuentas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#8a8580] text-center px-4">
            <p className="text-xs md:text-sm text-[#8a8580]">
              No hay cuentas abiertas en este momento.
            </p>
          </div>
        ) : (
          cuentas.map((pedido) => {
            const tipoEntrega =
              obtenerNombre(pedido.tipos_entrega) ||
              obtenerNombre(pedido.entrega) ||
              pedido.tipo_entrega ||
              "Mesa";
            const esDelivery = tipoEntrega.toLowerCase().includes("delivery");
            const esSeleccionado = pedidoSeleccionadoId === pedido.id_pedido;

            const tituloCliente =
              pedido.observaciones ||
              pedido.cliente ||
              (esDelivery ? "Delivery" : `${tipoEntrega} #${pedido.id_pedido}`);

            const estadoTexto =
              obtenerNombre(pedido.estados_pedido) ||
              obtenerNombre(pedido.estado) ||
              "Abierto";

            return (
              <article
                key={pedido.id_pedido}
                onClick={() => onSeleccionar && onSeleccionar(pedido)}
                className={`
                  p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2.5
                  ${
                    esSeleccionado
                      ? "border-[#e8956b] bg-[#fef7f2] shadow-sm"
                      : "border-gray-100 bg-white hover:border-[#fbe8dd] hover:bg-[#faf8f5] shadow-xs"
                  }
                `}
              >
                {/* Fila superior: título + total + botón cancelar */}
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-[#2d2a26] leading-tight truncate">
                      {tituloCliente}
                    </h3>
                    <span className="text-[11px] text-[#8a8580]">
                      Pedido #{pedido.id_pedido}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <strong className="text-base font-extrabold text-[#2a4d8f] whitespace-nowrap">
                      S/ {Number(pedido.total ?? 0).toFixed(2)}
                    </strong>
                    {/* Botón X para cancelar */}
                    {onCancelar && (
                      <button
                        type="button"
                        title="Cancelar pedido"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCancelarId(pedido.id_pedido);
                        }}
                        className="p-1 rounded-lg text-[#8a8580] hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Fila detalle + hora */}
                <div className="flex justify-between items-start gap-2 text-xs text-[#8a8580]">
                  <span className="line-clamp-2 leading-relaxed">
                    {obtenerProductosTexto(pedido)}
                  </span>
                  <time className="shrink-0 text-[11px]">
                    {obtenerHora(pedido.fecha_pedido)}
                  </time>
                </div>

                {/* Fila estado + botón cobrar */}
                <div className="flex justify-between items-center pt-2 border-t border-gray-100 mt-0.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#fceddf] text-[#92400e]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#f27a4d]" />
                    {estadoTexto}
                  </span>

                  {onCobrar && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCobrar(pedido);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#fbe8dd] text-[#e8956b] hover:bg-[#e8956b] hover:text-white transition-colors text-xs font-bold shadow-xs cursor-pointer"
                    >
                      <CreditCard size={13} />
                      Cobrar
                    </button>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Botón inferior → Ver pedidos pendientes */}
      <div className="mt-auto pt-3">
        <Link
          href="/cajero/pendientes"
          className="w-full py-3 px-4 rounded-xl bg-[#fae9db] text-[#a87552] hover:bg-[#f5dacb] transition-all flex items-center justify-center gap-2 text-xs md:text-sm font-bold shadow-xs"
        >
          <span>→</span>
          <span>Ver cuentas guardadas</span>
        </Link>
      </div>

      {/* Modal de cancelación */}
      {cancelarId !== null && onCancelar && (
        <ModalCancelarInline
          idPedido={cancelarId}
          onConfirm={async (motivo) => {
            await onCancelar(cancelarId, motivo);
            setCancelarId(null);
            onRecargar && onRecargar();
          }}
          onClose={() => setCancelarId(null)}
        />
      )}
    </div>
  );
}

export default CuentasAbiertas;
