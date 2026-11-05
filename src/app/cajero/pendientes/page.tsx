"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  RefreshCw,
  CreditCard,
  Loader2,
  AlertCircle,
  X,
  Truck,
  Clock,
} from "lucide-react";
import { ModalPago, CuentaCobrarInfo } from "../ModalPago";
import { DetalleCobroMixto } from "../../../dao/interfaces/IPedidoDAO";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface PedidoPendiente {
  id_pedido: number;
  cliente: string;
  detalle: string;
  total: number;
  fecha_pedido: string;
  estado: string;
  tipo_entrega: string;
  direccion_entrega?: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTiempo(iso: string): { hora: string; fechaStr: string } {
  if (!iso) return { hora: "--:--", fechaStr: "--" };
  const d = new Date(iso);
  return {
    hora: d.toLocaleTimeString("es-PE", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "America/Lima",
    }),
    fechaStr: d.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "America/Lima",
    }),
  };
}

function estadoBadge(estado: string) {
  const est = estado.toLowerCase();
  if (est === "abierto" || est === "pendiente")
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        {estado}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
      {estado}
    </span>
  );
}

// ─── Modal de Cancelar ────────────────────────────────────────────────────────

function ModalCancelar({
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
    "Otro motivo",
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-[#2d2a26] text-base">
            Cancelar pedido #{idPedido}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 cursor-pointer">
            <X size={18} className="text-[#8a8580]" />
          </button>
        </div>

        <p className="text-sm text-[#8a8580]">
          Selecciona o escribe el motivo de cancelación. Esta acción no puede
          deshacerse.
        </p>

        <div className="flex flex-col gap-2">
          {MOTIVOS.map((m) => (
            <button
              key={m}
              onClick={() => setMotivo(m)}
              className={`text-left text-sm px-4 py-2.5 rounded-xl border transition-all cursor-pointer ${
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
            placeholder="O escribe un motivo personalizado..."
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400 text-[#2d2a26]"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-[#8a8580] hover:bg-gray-50 transition-colors cursor-pointer"
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
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {cargando ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
            Cancelar pedido
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal PendientesPage ─────────────────────────────────────

export default function PendientesPage() {
  const [pedidos, setPedidos] = useState<PedidoPendiente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("todos");
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Modal cobrar
  const [modalPagoAbierto, setModalPagoAbierto] = useState(false);
  const [cuentaACobrar, setCuentaACobrar] = useState<CuentaCobrarInfo | null>(null);

  // Modal cancelar
  const [cancelarPedidoId, setCancelarPedidoId] = useState<number | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch("/api/cajero/pedidos");
      const data = await res.json();
      if (!res.ok || !data.pedidos) throw new Error(data.error || "Error al cargar");

      type RawP = {
        id_pedido: number;
        observaciones?: string | null;
        cliente?: string | null;
        detalle_pedido?: { productos?: { nombre?: string } | null; cantidad?: number }[];
        total: number | string;
        fecha_pedido: string;
        estados_pedido?: { nombre?: string } | null;
        estado?: string | null;
        tipos_entrega?: { nombre?: string } | null;
        tipo_entrega?: string | null;
        direccion_entrega?: string | null;
      };

      const mapeados: PedidoPendiente[] = data.pedidos.map((p: RawP) => ({
        id_pedido: p.id_pedido,
        cliente: p.observaciones || p.cliente || "Mesa",
        detalle:
          p.detalle_pedido
            ?.map((d) => `${d.productos?.nombre || "Producto"} × ${d.cantidad || 1}`)
            .join(", ") || "Sin productos",
        total: Number(p.total || 0),
        fecha_pedido: p.fecha_pedido,
        estado: p.estados_pedido?.nombre || p.estado || "Abierto",
        tipo_entrega: p.tipos_entrega?.nombre || p.tipo_entrega || "Mesa",
        direccion_entrega: p.direccion_entrega || null,
      }));

      setPedidos(mapeados);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const handleCancelar = async (idPedido: number, motivo: string) => {
    try {
      const res = await fetch("/api/cajero/cancelar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_pedido: idPedido, motivo }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Error al cancelar");
      setMensajeExito(`Pedido #${idPedido} cancelado.`);
      setTimeout(() => setMensajeExito(null), 3500);
      setCancelarPedidoId(null);
      await cargar();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al cancelar");
    }
  };

  const handleAbrirCobro = (p: PedidoPendiente) => {
    setCuentaACobrar({ id_pedido: p.id_pedido, cliente: p.cliente, total: p.total, detalle: p.detalle });
    setModalPagoAbierto(true);
  };

  const handleCompletarPago = async (
    idPedido: number,
    metodo: "efectivo" | "tarjeta" | "yape" | "mixto",
    detalleMixto?: DetalleCobroMixto
  ) => {
    const res = await fetch("/api/cajero/cobrar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_pedido: idPedido, metodo_pago: metodo, detalle_mixto: detalleMixto }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) throw new Error(data.error || "Error al cobrar");
    setMensajeExito(`¡Venta #${data.id_venta} completada!`);
    setTimeout(() => setMensajeExito(null), 4000);
    await cargar();
  };

  const totalPendiente = pedidos.reduce((s, p) => s + p.total, 0);

  const pedidosFiltrados = pedidos.filter((p) => {
    const q = busqueda.toLowerCase();
    const coincideBusqueda =
      !q ||
      p.cliente.toLowerCase().includes(q) ||
      String(p.id_pedido).includes(q) ||
      p.detalle.toLowerCase().includes(q);
    const coincideEstado =
      estadoFiltro === "todos" ||
      p.estado.toLowerCase().includes(estadoFiltro.toLowerCase());
    return coincideBusqueda && coincideEstado;
  });

  return (
    <div className="w-full h-full overflow-y-auto bg-[#FAF8F5]">
      {/* Toast de éxito */}
      {mensajeExito && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 bg-[#d1fae5] border border-[#a7f3d0] text-[#065f46] px-5 py-3 rounded-2xl shadow-lg animate-in slide-in-from-top-4 duration-300">
          <span className="text-sm font-bold">{mensajeExito}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8 flex flex-col gap-6">
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-[32px] font-bold text-[#2d2a26] leading-tight">
              Pedidos Pendientes
            </h1>
            <p className="text-[#8a8580] text-sm mt-0.5">
              Retoma un pedido o cobra una cuenta cuando esté lista.
            </p>
          </div>
          <Link href="/cajero">
            <button className="flex items-center gap-2 bg-[#e8956b] hover:bg-[#d88258] text-white px-5 py-2.5 rounded-full font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap shadow-sm">
              <span className="text-lg leading-none">+</span>
              Nueva venta
            </button>
          </Link>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs">
            <p className="text-xs text-[#8a8580] font-medium mb-1">Cuentas abiertas</p>
            <p className="text-2xl font-extrabold text-[#2d2a26]">{pedidos.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs">
            <p className="text-xs text-[#8a8580] font-medium mb-1">Total pendiente</p>
            <p className="text-2xl font-extrabold text-[#2a4d8f]">S/ {totalPendiente.toFixed(2)}</p>
          </div>
          <div className="col-span-2 md:col-span-1 bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs text-[#8a8580] font-medium mb-1">Estados</p>
              <div className="flex items-center gap-1.5">
                <Clock size={13} className="text-amber-600" />
                <span className="text-sm font-bold text-[#2d2a26]">
                  {pedidos.filter(p => p.estado.toLowerCase() === "abierto" || p.estado.toLowerCase() === "pendiente").length} Abiertos
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Truck size={13} className="text-blue-600" />
                <span className="text-sm text-[#8a8580]">
                  {pedidos.filter(p => p.tipo_entrega.toLowerCase().includes("delivery")).length} Delivery
                </span>
              </div>
            </div>
            <button
              onClick={cargar}
              disabled={cargando}
              className="p-2 rounded-xl hover:bg-gray-100 text-[#8a8580] hover:text-[#2a4d8f] transition-colors cursor-pointer"
            >
              <RefreshCw size={16} className={cargando ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a8580]" />
            <input
              type="text"
              placeholder="Buscar por cliente o ID de pedido"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 bg-white text-sm focus:outline-none focus:border-[#e8956b] transition-colors"
            />
          </div>
          <select
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value)}
            className="bg-white border border-gray-200 text-sm rounded-full px-4 py-2.5 outline-none cursor-pointer hover:border-[#e8956b] transition-colors"
          >
            <option value="todos">Todos los estados</option>
            <option value="abierto">Abierto</option>
            <option value="preparacion">En preparación</option>
          </select>
        </div>

        {/* Contenido */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
          {/* Vista escritorio */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Cliente / ID", "Detalle", "Total", "Hora", "Estado", "Acciones"].map((h) => (
                    <th key={h} className="text-left text-[11px] font-bold text-[#8a8580] uppercase tracking-wider px-5 py-3.5">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <Loader2 size={28} className="animate-spin text-[#e8956b] mx-auto" />
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-red-500 text-sm">
                      <AlertCircle size={20} className="mx-auto mb-2" />
                      {error}
                    </td>
                  </tr>
                ) : pedidosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-[#8a8580] text-sm">
                      No hay pedidos pendientes en este momento.
                    </td>
                  </tr>
                ) : (
                  pedidosFiltrados.map((p) => {
                    const { hora, fechaStr } = formatTiempo(p.fecha_pedido);
                    const esDelivery = p.tipo_entrega.toLowerCase().includes("delivery");
                    return (
                      <tr key={p.id_pedido} className="border-b border-gray-50 hover:bg-[#FAF8F5] transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-bold text-[#2d2a26] flex items-center gap-1.5">
                            {esDelivery && <Truck size={13} className="text-blue-500 shrink-0" />}
                            {p.cliente}
                          </div>
                          <div className="text-xs text-[#8a8580]">#{p.id_pedido}</div>
                        </td>
                        <td className="px-5 py-4 max-w-[220px]">
                          <div className="text-[#2d2a26] font-medium truncate">{p.detalle}</div>
                          {p.direccion_entrega && (
                            <div className="text-xs text-[#8a8580] truncate">{p.direccion_entrega}</div>
                          )}
                        </td>
                        <td className="px-5 py-4 font-bold text-[#2d2a26]">
                          S/ {p.total.toFixed(2)}
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-[#2d2a26]">{hora}</div>
                          <div className="text-xs text-[#8a8580]">{fechaStr}</div>
                        </td>
                        <td className="px-5 py-4">{estadoBadge(p.estado)}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleAbrirCobro(p)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#fbe8dd] text-[#e8956b] hover:bg-[#e8956b] hover:text-white transition-colors text-xs font-bold cursor-pointer"
                            >
                              <CreditCard size={13} />
                              Cobrar
                            </button>
                            <button
                              onClick={() => setCancelarPedidoId(p.id_pedido)}
                              title="Cancelar pedido"
                              className="p-1.5 rounded-xl hover:bg-red-50 text-[#8a8580] hover:text-red-500 transition-colors cursor-pointer"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Vista móvil */}
          <div className="md:hidden flex flex-col divide-y divide-gray-50">
            {cargando ? (
              <div className="py-12 flex justify-center">
                <Loader2 size={24} className="animate-spin text-[#e8956b]" />
              </div>
            ) : error ? (
              <div className="p-6 text-center text-red-500 text-sm">{error}</div>
            ) : pedidosFiltrados.length === 0 ? (
              <div className="p-8 text-center text-[#8a8580] text-sm">
                No hay pedidos pendientes.
              </div>
            ) : (
              pedidosFiltrados.map((p) => {
                const { hora, fechaStr } = formatTiempo(p.fecha_pedido);
                const esDelivery = p.tipo_entrega.toLowerCase().includes("delivery");
                return (
                  <div key={p.id_pedido} className="p-4 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-[#2d2a26] flex items-center gap-1.5 text-sm">
                          {esDelivery && <Truck size={13} className="text-blue-500" />}
                          {p.cliente}
                        </div>
                        <div className="text-xs text-[#8a8580]">
                          #{p.id_pedido} · {hora} · {fechaStr}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[#2d2a26]">S/ {p.total.toFixed(2)}</div>
                      </div>
                    </div>
                    <p className="text-sm text-[#2d2a26] line-clamp-2">{p.detalle}</p>
                    {p.direccion_entrega && (
                      <p className="text-xs text-[#8a8580]">{p.direccion_entrega}</p>
                    )}
                    <div className="flex items-center justify-between pt-1">
                      {estadoBadge(p.estado)}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCancelarPedidoId(p.id_pedido)}
                          className="p-1.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors cursor-pointer"
                        >
                          <X size={15} />
                        </button>
                        <button
                          onClick={() => handleAbrirCobro(p)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#fbe8dd] text-[#e8956b] hover:bg-[#e8956b] hover:text-white transition-colors text-xs font-bold cursor-pointer"
                        >
                          <CreditCard size={13} />
                          Cobrar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-gray-100 text-xs text-[#8a8580] flex items-center justify-between">
            <span>Mostrando {pedidosFiltrados.length} de {pedidos.length} pedidos</span>
          </div>
        </div>
      </div>

      {/* Modal Cancelar */}
      {cancelarPedidoId !== null && (
        <ModalCancelar
          idPedido={cancelarPedidoId}
          onConfirm={(motivo) => handleCancelar(cancelarPedidoId, motivo)}
          onClose={() => setCancelarPedidoId(null)}
        />
      )}

      {/* Modal Pago */}
      <ModalPago
        isOpen={modalPagoAbierto}
        cuenta={cuentaACobrar}
        onClose={() => { setModalPagoAbierto(false); setCuentaACobrar(null); }}
        onCompletarPago={handleCompletarPago}
      />
    </div>
  );
}
