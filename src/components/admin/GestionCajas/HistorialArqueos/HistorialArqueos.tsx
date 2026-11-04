"use client";

import React, { useState } from "react";
import {
  Download,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  ChevronRight,
  User,
  Filter,
  DollarSign,
  Receipt,
} from "lucide-react";

export type EstadoArqueo = "cuadrado" | "faltante" | "por_revisar";

export interface ItemArqueo {
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
  estado: EstadoArqueo;
  desglose: {
    efectivo: number;
    tarjeta: number;
    yape: number;
    plin: number;
    retiros: number;
  };
  observacion?: string;
}

const MOCK_ARQUEOS: ItemArqueo[] = [
  {
    id: "ARQ-2026-104",
    fecha: "Ayer, 02 Nov",
    hora: "15:30 - 22:45",
    turno: "Turno Tarde",
    responsable: {
      nombre: "Diego Salazar",
      iniciales: "DS",
      rol: "Cajero Principal",
    },
    montoEsperado: 820.0,
    montoReal: 820.0,
    diferencia: 0.0,
    estado: "cuadrado",
    desglose: {
      efectivo: 450.0,
      tarjeta: 210.0,
      yape: 120.0,
      plin: 40.0,
      retiros: 0.0,
    },
    observacion: "Turno cerrado sin novedades. Conteo exacto en caja.",
  },
  {
    id: "ARQ-2026-103",
    fecha: "Dom, 01 Nov",
    hora: "16:00 - 23:00",
    turno: "Turno Tarde",
    responsable: {
      nombre: "Luciana Mendoza",
      iniciales: "LM",
      rol: "Cajera",
    },
    montoEsperado: 1140.0,
    montoReal: 1125.0,
    diferencia: -15.0,
    estado: "faltante",
    desglose: {
      efectivo: 680.0,
      tarjeta: 290.0,
      yape: 110.0,
      plin: 60.0,
      retiros: 50.0,
    },
    observacion: "Diferencia de S/ 15.00 detectada en efectivo. En investigación.",
  },
  {
    id: "ARQ-2026-102",
    fecha: "Sáb, 31 Oct",
    hora: "16:00 - 23:30",
    turno: "Turno Noche",
    responsable: {
      nombre: "Mateo Paredes",
      iniciales: "MP",
      rol: "Cajero",
    },
    montoEsperado: 1480.0,
    montoReal: 1480.0,
    diferencia: 0.0,
    estado: "cuadrado",
    desglose: {
      efectivo: 790.0,
      tarjeta: 420.0,
      yape: 180.0,
      plin: 90.0,
      retiros: 30.0,
    },
    observacion: "Fin de semana con alta afluencia. Arqueo completado conforme.",
  },
  {
    id: "ARQ-2026-101",
    fecha: "Sáb, 31 Oct",
    hora: "09:00 - 16:00",
    turno: "Turno Mañana",
    responsable: {
      nombre: "Camila Rojas",
      iniciales: "CR",
      rol: "Cajera",
    },
    montoEsperado: 650.0,
    montoReal: 650.0,
    diferencia: 0.0,
    estado: "cuadrado",
    desglose: {
      efectivo: 380.0,
      tarjeta: 150.0,
      yape: 90.0,
      plin: 30.0,
      retiros: 15.0,
    },
    observacion: "Cuadratura sin observaciones.",
  },
  {
    id: "ARQ-2026-100",
    fecha: "Vie, 30 Oct",
    hora: "15:30 - 22:30",
    turno: "Turno Tarde",
    responsable: {
      nombre: "Diego Salazar",
      iniciales: "DS",
      rol: "Cajero Principal",
    },
    montoEsperado: 920.0,
    montoReal: 920.0,
    diferencia: 0.0,
    estado: "por_revisar",
    desglose: {
      efectivo: 510.0,
      tarjeta: 230.0,
      yape: 130.0,
      plin: 50.0,
      retiros: 25.0,
    },
    observacion: "Falta firma de supervisor de sede en el comprobante físico.",
  },
];

export interface HistorialArqueosProps {
  arqueos?: ItemArqueo[];
}

export const HistorialArqueos: React.FC<HistorialArqueosProps> = ({
  arqueos = MOCK_ARQUEOS,
}) => {
  const [filtroPeriodo, setFiltroPeriodo] = useState("7_dias");
  const [arqueoSeleccionado, setArqueoSeleccionado] = useState<ItemArqueo | null>(
    null,
  );

  const formatMoneda = (monto: number) =>
    `S/ ${Math.abs(monto).toLocaleString("es-PE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const renderBadgeEstado = (estado: EstadoArqueo) => {
    switch (estado) {
      case "cuadrado":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-exito-fondo text-exito-texto border border-exito-borde shadow-2xs">
            <CheckCircle2 size={13} className="shrink-0" />
            <span>Cuadrado</span>
          </span>
        );
      case "faltante":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-error-fondo text-error-texto border border-error-borde shadow-2xs">
            <AlertTriangle size={13} className="shrink-0" />
            <span>Faltante</span>
          </span>
        );
      case "por_revisar":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-advertencia-fondo text-advertencia-texto border border-advertencia-borde shadow-2xs">
            <Clock size={13} className="shrink-0" />
            <span>Por revisar</span>
          </span>
        );
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* ============================================================== */}
      {/* HEADER DE LISTA                                                */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h2 className="text-xl font-bold text-texto-primario tracking-tight">
            Historial de Arqueos
          </h2>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-superficie-gris text-texto-mutado border border-borde-gris">
            {arqueos.length} turnos
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Select de periodo */}
          <div className="relative">
            <select
              value={filtroPeriodo}
              onChange={(e) => setFiltroPeriodo(e.target.value)}
              className="bg-superficie border border-borde-gris rounded-xl px-3.5 py-2 pr-8 text-sm text-texto-principal font-medium shadow-2xs focus:outline-none focus:border-primario cursor-pointer transition-colors appearance-none"
            >
              <option value="7_dias">Últimos 7 días</option>
              <option value="15_dias">Últimos 15 días</option>
              <option value="mes_actual">Este mes</option>
              <option value="mes_anterior">Mes anterior</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-texto-mutado">
              <Calendar size={14} />
            </div>
          </div>

          {/* Botón fantasma: Exportar */}
          <button
            type="button"
            onClick={() => alert("Simulación: Reporte de arqueos exportado a Excel")}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-texto-primario hover:bg-primario-suave border border-transparent hover:border-borde-suave transition-all duration-200 cursor-pointer shadow-2xs active:scale-98"
          >
            <Download size={16} />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* ENCABEZADOS DE COLUMNA (Sutil, solo visible en desktop)       */}
      {/* ============================================================== */}
      <div className="hidden lg:grid grid-cols-12 gap-4 px-5 py-2 text-xs font-semibold text-texto-mutado uppercase tracking-wider">
        <div className="col-span-3">Fecha y Turno</div>
        <div className="col-span-3">Responsable</div>
        <div className="col-span-2">Monto Esperado</div>
        <div className="col-span-2">Diferencia</div>
        <div className="col-span-1">Estado</div>
        <div className="col-span-1 text-right">Acción</div>
      </div>

      {/* ============================================================== */}
      {/* LA LISTA (PROHIBIDO <table>, USANDO flex flex-col gap-3)        */}
      {/* ============================================================== */}
      <div className="flex flex-col gap-3">
        {arqueos.map((item) => (
          <div
            key={item.id}
            className="bg-superficie rounded-xl p-4 sm:p-5 border border-borde-suave hover:bg-superficie-hover hover:border-primario/30 transition-all duration-200 shadow-[var(--sombra-tarjeta)] group"
          >
            {/* GRID RESPONSIVE */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
              {/* Col 1: Fecha y Turno (col-span-3) */}
              <div className="lg:col-span-3 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-superficie-gris text-texto-primario flex items-center justify-center shrink-0 border border-borde-tenue group-hover:border-primario/20 transition-colors">
                  <Calendar size={18} />
                </div>
                <div className="flex flex-col leading-snug">
                  <span className="text-sm font-bold text-texto-principal">
                    {item.fecha}
                  </span>
                  <span className="text-xs text-texto-mutado mt-0.5">
                    {item.hora} • {item.turno}
                  </span>
                </div>
              </div>

              {/* Col 2: Responsable (col-span-3) */}
              <div className="lg:col-span-3 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primario-suave text-texto-primario font-bold text-xs flex items-center justify-center border border-primario/15 shrink-0">
                  {item.responsable.iniciales}
                </div>
                <div className="flex flex-col leading-tight min-w-0">
                  <span className="text-sm font-semibold text-texto-principal truncate">
                    {item.responsable.nombre}
                  </span>
                  <span className="text-xs text-texto-mutado">
                    {item.responsable.rol}
                  </span>
                </div>
              </div>

              {/* Col 3: Monto Esperado (col-span-2) */}
              <div className="lg:col-span-2 flex flex-col justify-center">
                <span className="text-xs text-texto-mutado lg:hidden font-medium">
                  Monto Esperado:
                </span>
                <span className="text-sm font-bold text-texto-principal">
                  {formatMoneda(item.montoEsperado)}
                </span>
                <span className="text-[11px] text-texto-mutado">
                  Contado: {formatMoneda(item.montoReal)}
                </span>
              </div>

              {/* Col 4: Diferencia (col-span-2) */}
              <div className="lg:col-span-2 flex flex-col justify-center">
                <span className="text-xs text-texto-mutado lg:hidden font-medium">
                  Diferencia:
                </span>
                {item.diferencia === 0 ? (
                  <span className="text-sm font-medium text-texto-mutado">
                    S/ 0.00 Exacto
                  </span>
                ) : item.diferencia < 0 ? (
                  <span className="text-sm font-bold text-danger">
                    -{formatMoneda(item.diferencia)} Faltante
                  </span>
                ) : (
                  <span className="text-sm font-bold text-exito">
                    +{formatMoneda(item.diferencia)} Sobrante
                  </span>
                )}
              </div>

              {/* Col 5: Badge de Estado (col-span-1) */}
              <div className="lg:col-span-1 flex items-center">
                {renderBadgeEstado(item.estado)}
              </div>

              {/* Col 6: Botón Final "Revisar" (col-span-1) */}
              <div className="lg:col-span-1 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setArqueoSeleccionado(item)}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-primario hover:text-primario-oscuro group-hover:translate-x-0.5 transition-all cursor-pointer"
                >
                  <span>Revisar</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ============================================================== */}
      {/* MODAL DETALLE DE ARQUEO ("Revisar")                              */}
      {/* ============================================================== */}
      {arqueoSeleccionado && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 animate-in fade-in duration-200"
        >
          <div className="bg-superficie rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-borde-suave shadow-2xl space-y-5">
            {/* Cabecera del modal */}
            <div className="flex items-center justify-between pb-4 border-b border-borde-tenue">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primario-suave text-texto-primario flex items-center justify-center">
                  <Receipt size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-texto-primario">
                    Detalle del Arqueo #{arqueoSeleccionado.id}
                  </h3>
                  <p className="text-xs text-texto-mutado">
                    {arqueoSeleccionado.fecha} • {arqueoSeleccionado.turno}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setArqueoSeleccionado(null)}
                className="text-texto-mutado hover:text-texto-principal p-1.5 rounded-xl hover:bg-superficie-gris cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Fila de Responsable y Estado */}
            <div className="flex items-center justify-between p-3.5 bg-superficie-gris rounded-xl">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primario-suave text-texto-primario font-bold text-xs flex items-center justify-center">
                  {arqueoSeleccionado.responsable.iniciales}
                </div>
                <div>
                  <span className="text-xs text-texto-mutado block">
                    Cajero responsable
                  </span>
                  <span className="text-sm font-bold text-texto-principal">
                    {arqueoSeleccionado.responsable.nombre}
                  </span>
                </div>
              </div>
              <div>{renderBadgeEstado(arqueoSeleccionado.estado)}</div>
            </div>

            {/* Comparativa Monto Esperado vs Real */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-superficie-gris rounded-xl border border-borde-tenue">
                <span className="text-[11px] font-semibold uppercase text-texto-mutado block mb-1">
                  Esperado
                </span>
                <span className="text-base font-bold text-texto-principal">
                  {formatMoneda(arqueoSeleccionado.montoEsperado)}
                </span>
              </div>
              <div className="p-3 bg-superficie-gris rounded-xl border border-borde-tenue">
                <span className="text-[11px] font-semibold uppercase text-texto-mutado block mb-1">
                  Contado Real
                </span>
                <span className="text-base font-bold text-texto-principal">
                  {formatMoneda(arqueoSeleccionado.montoReal)}
                </span>
              </div>
              <div
                className={`p-3 rounded-xl border ${
                  arqueoSeleccionado.diferencia < 0
                    ? "bg-error-fondo border-error-borde text-error-texto"
                    : "bg-exito-fondo border-exito-borde text-exito-texto"
                }`}
              >
                <span className="text-[11px] font-semibold uppercase block mb-1">
                  Diferencia
                </span>
                <span className="text-base font-bold">
                  {arqueoSeleccionado.diferencia === 0
                    ? "S/ 0.00"
                    : arqueoSeleccionado.diferencia < 0
                      ? `-${formatMoneda(arqueoSeleccionado.diferencia)}`
                      : `+${formatMoneda(arqueoSeleccionado.diferencia)}`}
                </span>
              </div>
            </div>

            {/* Desglose de cobros del arqueo */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-texto-primario">
                Desglose registrado por métodos de pago
              </h4>
              <div className="divide-y divide-borde-tenue rounded-xl border border-borde-tenue text-sm bg-superficie">
                <div className="flex justify-between p-2.5">
                  <span className="text-texto-mutado">Efectivo en gaveta:</span>
                  <span className="font-bold text-texto-principal">
                    {formatMoneda(arqueoSeleccionado.desglose.efectivo)}
                  </span>
                </div>
                <div className="flex justify-between p-2.5">
                  <span className="text-texto-mutado">Cobros con Tarjeta (POS):</span>
                  <span className="font-bold text-texto-principal">
                    {formatMoneda(arqueoSeleccionado.desglose.tarjeta)}
                  </span>
                </div>
                <div className="flex justify-between p-2.5">
                  <span className="text-texto-mutado">Yape:</span>
                  <span className="font-bold text-texto-principal">
                    {formatMoneda(arqueoSeleccionado.desglose.yape)}
                  </span>
                </div>
                <div className="flex justify-between p-2.5">
                  <span className="text-texto-mutado">Plin:</span>
                  <span className="font-bold text-texto-principal">
                    {formatMoneda(arqueoSeleccionado.desglose.plin)}
                  </span>
                </div>
                {arqueoSeleccionado.desglose.retiros > 0 && (
                  <div className="flex justify-between p-2.5 bg-rose-50/50 text-danger">
                    <span>Retiros de caja durante el turno:</span>
                    <span className="font-bold">
                      -{formatMoneda(arqueoSeleccionado.desglose.retiros)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Observaciones */}
            {arqueoSeleccionado.observacion && (
              <div className="p-3 bg-superficie-gris rounded-xl text-xs text-texto-mutado border border-borde-tenue">
                <strong className="text-texto-principal block mb-0.5">
                  Nota de auditoría:
                </strong>
                {arqueoSeleccionado.observacion}
              </div>
            )}

            {/* Botón de cierre */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setArqueoSeleccionado(null)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-boton-primario hover:bg-boton-primario-hover transition-colors shadow-xs cursor-pointer"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistorialArqueos;
