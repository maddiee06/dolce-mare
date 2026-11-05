"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Search,
  Calendar,
  Eye,
  Printer,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  RefreshCw,
  Receipt,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  Banknote,
  Smartphone,
  Layers,
} from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface MetodoPago { nombre: string }
interface EstadoVenta { nombre: string }
interface TipoEntrega { nombre: string }
interface PedidoRef {
  observaciones?: string | null;
  direccion_entrega?: string | null;
  tipos_entrega?: TipoEntrega | null;
}

export interface VentaItem {
  id_venta: number;
  id_pedido: number | null;
  id_metodo_pago: number;
  id_estado_venta: number;
  fecha_venta: string;
  subtotal: number;
  igv: number;
  total: number;
  metodos_pago?: MetodoPago | null;
  estados_venta?: EstadoVenta | null;
  pedidos?: PedidoRef | null;
}

interface DetalleVentaItem {
  id_detalle_venta: number;
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
  descuento: number;
  subtotal: number;
  productos?: { id_producto: number; nombre: string; codigo?: string } | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatFecha(iso: string): { fecha: string; hora: string } {
  const d = new Date(iso);
  const fecha = d.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "America/Lima",
  });
  const hora = d.toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/Lima",
  });
  return { fecha, hora };
}

function estadoBadge(id: number, nombre?: string | null) {
  const label = nombre || (id === 1 ? "Pagado" : id === 2 ? "Anulado" : "—");
  if (id === 1)
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-green-50 text-green-700 border border-green-200">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
        {label}
      </span>
    );
  if (id === 2)
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-600 border border-red-200">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
        {label}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
      {label}
    </span>
  );
}

function metodoPagoIcon(id: number) {
  if (id === 1) return <Banknote size={14} className="text-green-600" />;
  if (id === 2) return <CreditCard size={14} className="text-blue-600" />;
  if (id === 3 || id === 4) return <Smartphone size={14} className="text-purple-600" />;
  if (id === 5) return <Layers size={14} className="text-orange-500" />;
  return <CreditCard size={14} className="text-gray-500" />;
}

// ─── Modal de Detalle de Venta ────────────────────────────────────────────────

function ModalDetalleVenta({
  idVenta,
  onClose,
}: {
  idVenta: number;
  onClose: () => void;
}) {
  const [cargando, setCargando] = useState(true);
  const [venta, setVenta] = useState<VentaItem | null>(null);
  const [detalle, setDetalle] = useState<DetalleVentaItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function cargar() {
      setCargando(true);
      setError(null);
      try {
        const res = await fetch(`/api/cajero/historial/${idVenta}`);
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || "Error al cargar");
        setVenta(data.venta);
        setDetalle(data.detalle || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, [idVenta]);

  const { fecha, hora } = venta?.fecha_venta
    ? formatFecha(venta.fecha_venta)
    : { fecha: "—", hora: "—" };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#fae9db] flex items-center justify-center">
              <Receipt size={18} className="text-[#e8956b]" />
            </div>
            <div>
              <h2 className="font-bold text-[#2d2a26] text-base leading-tight">
                Venta #{idVenta}
              </h2>
              {venta && (
                <p className="text-xs text-[#8a8580]">
                  {fecha} · {hora}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-[#8a8580] hover:text-[#2d2a26] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-4 flex flex-col gap-4">
          {cargando ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-[#8a8580]">
              <Loader2 size={28} className="animate-spin text-[#e8956b]" />
              <p className="text-sm">Cargando detalle...</p>
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 p-4 bg-red-50 rounded-xl text-red-600 text-sm">
              <AlertCircle size={18} />
              {error}
            </div>
          ) : venta ? (
            <>
              {/* Resumen */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#FAF8F5] rounded-2xl p-3">
                  <p className="text-[11px] text-[#8a8580] font-medium mb-1">Estado</p>
                  {estadoBadge(venta.id_estado_venta, venta.estados_venta?.nombre)}
                </div>
                <div className="bg-[#FAF8F5] rounded-2xl p-3">
                  <p className="text-[11px] text-[#8a8580] font-medium mb-1">Método de pago</p>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-[#2d2a26]">
                    {metodoPagoIcon(venta.id_metodo_pago)}
                    {venta.metodos_pago?.nombre || "—"}
                  </div>
                </div>
                {venta.pedidos?.observaciones && (
                  <div className="col-span-2 bg-[#FAF8F5] rounded-2xl p-3">
                    <p className="text-[11px] text-[#8a8580] font-medium mb-1">Referencia</p>
                    <p className="text-sm font-semibold text-[#2d2a26] line-clamp-2">
                      {venta.pedidos.observaciones}
                    </p>
                  </div>
                )}
                {venta.pedidos?.direccion_entrega && (
                  <div className="col-span-2 bg-[#FAF8F5] rounded-2xl p-3">
                    <p className="text-[11px] text-[#8a8580] font-medium mb-1">Dirección de entrega</p>
                    <p className="text-sm text-[#2d2a26]">{venta.pedidos.direccion_entrega}</p>
                  </div>
                )}
              </div>

              {/* Productos */}
              <div>
                <h3 className="text-xs font-bold text-[#8a8580] uppercase tracking-wider mb-2">
                  Productos
                </h3>
                {detalle.length === 0 ? (
                  <p className="text-sm text-[#8a8580] py-4 text-center">Sin productos registrados.</p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {detalle.map((d) => (
                      <div
                        key={d.id_detalle_venta}
                        className="flex items-start justify-between gap-2 py-2 border-b border-gray-50 last:border-0"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#2d2a26] truncate">
                            {d.productos?.nombre || `Producto #${d.id_producto}`}
                          </p>
                          <p className="text-[11px] text-[#8a8580]">
                            {d.cantidad} × S/ {Number(d.precio_unitario).toFixed(2)}
                            {d.descuento > 0 && (
                              <span className="ml-1 text-green-600">
                                (-S/ {Number(d.descuento).toFixed(2)})
                              </span>
                            )}
                          </p>
                        </div>
                        <span className="text-sm font-bold text-[#2d2a26] shrink-0">
                          S/ {Number(d.subtotal).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Totales */}
              <div className="bg-[#FAF8F5] rounded-2xl p-4 flex flex-col gap-2">
                <div className="flex justify-between text-sm text-[#8a8580]">
                  <span>Subtotal</span>
                  <span>S/ {Number(venta.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-[#8a8580]">
                  <span>IGV (18%)</span>
                  <span>S/ {Number(venta.igv).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-[#2d2a26] text-base pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>S/ {Number(venta.total).toFixed(2)}</span>
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-[#8a8580] hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cerrar
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#fae9db] text-[#a87552] hover:bg-[#f5dacb] text-sm font-bold transition-colors cursor-pointer"
          >
            <Printer size={16} />
            Imprimir
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal HistorialVentas ─────────────────────────────────────

const ESTADOS_FILTRO = [
  { value: "todos", label: "Todos los estados" },
  { value: "pagado", label: "Pagado" },
  { value: "anulado", label: "Anulado" },
];

const METODOS_FILTRO = [
  { value: "todos", label: "Tipo de pago" },
  { value: "1", label: "Efectivo" },
  { value: "2", label: "Tarjeta" },
  { value: "3", label: "Yape" },
  { value: "4", label: "Plin" },
  { value: "5", label: "Mixto" },
];

function formatFechaInput(d: Date): string {
  return d.toISOString().split("T")[0];
}

export function HistorialVentas() {
  const [ventas, setVentas] = useState<VentaItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalVentas, setTotalVentas] = useState(0);
  const [pagina, setPagina] = useState(1);
  const POR_PAGINA = 15;

  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("todos");
  const [metodoPagoFiltro, setMetodoPagoFiltro] = useState("todos");
  const [fechaFiltro, setFechaFiltro] = useState(formatFechaInput(new Date()));

  const [ventaDetalleId, setVentaDetalleId] = useState<number | null>(null);

  const busquedaRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cargarHistorial = useCallback(
    async (pag = pagina, q = busqueda) => {
      setCargando(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          fecha: fechaFiltro,
          estado: estadoFiltro,
          buscar: q,
          pagina: String(pag),
          por_pagina: String(POR_PAGINA),
        });
        const res = await fetch(`/api/cajero/historial?${params}`);
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || "Error al cargar historial");

        let filtradas: VentaItem[] = data.ventas || [];

        // Filtro local por método de pago (ya que la API no lo filtra)
        if (metodoPagoFiltro !== "todos") {
          filtradas = filtradas.filter(
            (v) => String(v.id_metodo_pago) === metodoPagoFiltro
          );
        }

        setVentas(filtradas);
        setTotalVentas(data.total ?? filtradas.length);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setCargando(false);
      }
    },
    [pagina, busqueda, fechaFiltro, estadoFiltro, metodoPagoFiltro]
  );

  useEffect(() => {
    cargarHistorial(1, busqueda);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fechaFiltro, estadoFiltro, metodoPagoFiltro]);

  const handleBusqueda = (val: string) => {
    setBusqueda(val);
    if (busquedaRef.current) clearTimeout(busquedaRef.current);
    busquedaRef.current = setTimeout(() => {
      setPagina(1);
      cargarHistorial(1, val);
    }, 400);
  };

  const totalPaginas = Math.max(1, Math.ceil(totalVentas / POR_PAGINA));

  const totalDia = ventas.reduce(
    (s, v) => (v.id_estado_venta === 1 ? s + Number(v.total) : s),
    0
  );

  return (
    <div className="w-full h-full overflow-y-auto bg-[#FAF8F5]">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8 flex flex-col gap-6">

        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-[32px] font-bold text-[#2d2a26] leading-tight">
              Historial de Ventas
            </h1>
            <p className="text-[#8a8580] text-sm mt-0.5">
              Cada venta, en orden. Consulta e imprime tus comprobantes.
            </p>
          </div>
          <Link href="/cajero">
            <button className="flex items-center gap-2 bg-[#e8956b] hover:bg-[#d88258] text-white px-5 py-2.5 rounded-full font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap shadow-sm">
              <span className="text-lg leading-none">+</span>
              Nueva venta
            </button>
          </Link>
        </div>

        {/* KPI rápido */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs">
            <p className="text-xs text-[#8a8580] font-medium mb-1">Ventas hoy</p>
            <p className="text-2xl font-extrabold text-[#2d2a26]">{ventas.filter(v => v.id_estado_venta === 1).length}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs">
            <p className="text-xs text-[#8a8580] font-medium mb-1">Total cobrado</p>
            <p className="text-2xl font-extrabold text-[#2a4d8f]">S/ {totalDia.toFixed(2)}</p>
          </div>
          <div className="col-span-2 md:col-span-1 bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs text-[#8a8580] font-medium mb-1">Estado</p>
              <div className="flex items-center gap-1.5">
                <CheckCircle size={14} className="text-green-600" />
                <span className="text-sm font-bold text-[#2d2a26]">
                  {ventas.filter(v => v.id_estado_venta === 1).length} Pagadas
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <XCircle size={14} className="text-red-500" />
                <span className="text-sm text-[#8a8580]">
                  {ventas.filter(v => v.id_estado_venta === 2).length} Anuladas
                </span>
              </div>
            </div>
            <button
              onClick={() => cargarHistorial(pagina, busqueda)}
              disabled={cargando}
              title="Actualizar"
              className="p-2 rounded-xl hover:bg-gray-100 text-[#8a8580] hover:text-[#2a4d8f] transition-colors cursor-pointer"
            >
              <RefreshCw size={16} className={cargando ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          {/* Búsqueda */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a8580]" />
            <input
              type="text"
              placeholder="Buscar por correlativo o cliente"
              value={busqueda}
              onChange={(e) => handleBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 bg-white text-sm focus:outline-none focus:border-[#e8956b] transition-colors"
            />
          </div>

          {/* Fecha */}
          <div className="relative flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2.5 cursor-pointer hover:border-[#e8956b] transition-colors">
            <Calendar size={15} className="text-[#8a8580]" />
            <input
              type="date"
              value={fechaFiltro}
              onChange={(e) => { setFechaFiltro(e.target.value); setPagina(1); }}
              className="text-sm text-[#2d2a26] bg-transparent outline-none cursor-pointer"
            />
          </div>

          {/* Estado */}
          <select
            value={estadoFiltro}
            onChange={(e) => { setEstadoFiltro(e.target.value); setPagina(1); }}
            className="bg-white border border-gray-200 text-sm rounded-full px-4 py-2.5 outline-none cursor-pointer hover:border-[#e8956b] transition-colors appearance-none pr-8"
          >
            {ESTADOS_FILTRO.map((e) => (
              <option key={e.value} value={e.value}>{e.label}</option>
            ))}
          </select>

          {/* Método de pago */}
          <select
            value={metodoPagoFiltro}
            onChange={(e) => { setMetodoPagoFiltro(e.target.value); setPagina(1); }}
            className="bg-white border border-gray-200 text-sm rounded-full px-4 py-2.5 outline-none cursor-pointer hover:border-[#e8956b] transition-colors appearance-none pr-8"
          >
            {METODOS_FILTRO.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>

        {/* Tabla / Lista */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
          {/* Vista escritorio: tabla */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-[11px] font-bold text-[#8a8580] uppercase tracking-wider px-6 py-3.5">
                    Fecha y hora
                  </th>
                  <th className="text-left text-[11px] font-bold text-[#8a8580] uppercase tracking-wider px-4 py-3.5">
                    Correlativo
                  </th>
                  <th className="text-left text-[11px] font-bold text-[#8a8580] uppercase tracking-wider px-4 py-3.5">
                    Cliente / Referencia
                  </th>
                  <th className="text-left text-[11px] font-bold text-[#8a8580] uppercase tracking-wider px-4 py-3.5">
                    Monto / Pago
                  </th>
                  <th className="text-left text-[11px] font-bold text-[#8a8580] uppercase tracking-wider px-4 py-3.5">
                    Estado
                  </th>
                  <th className="text-right text-[11px] font-bold text-[#8a8580] uppercase tracking-wider px-6 py-3.5">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-[#8a8580]">
                        <Loader2 size={28} className="animate-spin text-[#e8956b]" />
                        <p className="text-sm">Cargando historial...</p>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-red-500">
                        <AlertCircle size={24} />
                        <p className="text-sm">{error}</p>
                        <button
                          onClick={() => cargarHistorial()}
                          className="text-xs underline text-[#e8956b] cursor-pointer"
                        >
                          Reintentar
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : ventas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-[#8a8580] text-sm">
                      No hay ventas registradas para los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  ventas.map((v) => {
                    const { fecha, hora } = formatFecha(v.fecha_venta);
                    const obs = v.pedidos?.observaciones || "Cliente general";
                    return (
                      <tr
                        key={v.id_venta}
                        className="border-b border-gray-50 hover:bg-[#FAF8F5] transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-[#2d2a26]">{fecha}</div>
                          <div className="text-xs text-[#8a8580]">{hora}</div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-bold text-[#2a4d8f]">
                            #{String(v.id_venta).padStart(4, "0")}
                          </span>
                        </td>
                        <td className="px-4 py-4 max-w-[180px]">
                          <p className="font-medium text-[#2d2a26] truncate">{obs}</p>
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-bold text-[#2d2a26]">
                            S/ {Number(v.total).toFixed(2)}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-[#8a8580] mt-0.5">
                            {metodoPagoIcon(v.id_metodo_pago)}
                            {v.metodos_pago?.nombre || "—"}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {estadoBadge(v.id_estado_venta, v.estados_venta?.nombre)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setVentaDetalleId(v.id_venta)}
                              title="Ver detalle"
                              className="p-2 rounded-xl hover:bg-[#fae9db] text-[#8a8580] hover:text-[#e8956b] transition-colors cursor-pointer"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => window.print()}
                              title="Imprimir"
                              className="p-2 rounded-xl hover:bg-gray-100 text-[#8a8580] hover:text-[#2d2a26] transition-colors cursor-pointer"
                            >
                              <Printer size={16} />
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

          {/* Vista móvil: tarjetas */}
          <div className="md:hidden flex flex-col divide-y divide-gray-50">
            {cargando ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-[#8a8580]">
                <Loader2 size={24} className="animate-spin text-[#e8956b]" />
                <p className="text-sm">Cargando...</p>
              </div>
            ) : error ? (
              <div className="p-6 text-center text-red-500 text-sm">{error}</div>
            ) : ventas.length === 0 ? (
              <div className="p-8 text-center text-[#8a8580] text-sm">
                No hay ventas para los filtros seleccionados.
              </div>
            ) : (
              ventas.map((v) => {
                const { fecha, hora } = formatFecha(v.fecha_venta);
                const obs = v.pedidos?.observaciones || "Cliente general";
                return (
                  <div key={v.id_venta} className="p-4 flex flex-col gap-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-bold text-[#2a4d8f] text-sm">
                          #{String(v.id_venta).padStart(4, "0")}
                        </span>
                        <p className="text-xs text-[#8a8580] mt-0.5">
                          {fecha} · {hora}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#2d2a26]">
                          S/ {Number(v.total).toFixed(2)}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-[#8a8580] justify-end mt-0.5">
                          {metodoPagoIcon(v.id_metodo_pago)}
                          {v.metodos_pago?.nombre}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-[#2d2a26] font-medium line-clamp-1">{obs}</p>
                    <div className="flex items-center justify-between">
                      {estadoBadge(v.id_estado_venta, v.estados_venta?.nombre)}
                      <button
                        onClick={() => setVentaDetalleId(v.id_venta)}
                        className="flex items-center gap-1.5 text-xs font-bold text-[#e8956b] hover:underline cursor-pointer"
                      >
                        <Eye size={14} />
                        Ver detalle
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer con paginación */}
          <div className="px-4 md:px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8a8580]">
            <span>
              Mostrando {ventas.length} de {totalVentas} ventas
            </span>
            {totalPaginas > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { const p = Math.max(1, pagina - 1); setPagina(p); cargarHistorial(p); }}
                  disabled={pagina === 1}
                  className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 cursor-pointer disabled:cursor-default"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: Math.min(totalPaginas, 5) }, (_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => { setPagina(p); cargarHistorial(p); }}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        pagina === p
                          ? "bg-[#2a4d8f] text-white"
                          : "hover:bg-gray-100 text-[#8a8580]"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => { const p = Math.min(totalPaginas, pagina + 1); setPagina(p); cargarHistorial(p); }}
                  disabled={pagina === totalPaginas}
                  className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 cursor-pointer disabled:cursor-default"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Detalle */}
      {ventaDetalleId !== null && (
        <ModalDetalleVenta
          idVenta={ventaDetalleId}
          onClose={() => setVentaDetalleId(null)}
        />
      )}
    </div>
  );
}

export default HistorialVentas;
