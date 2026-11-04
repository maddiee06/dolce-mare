"use client";

import React, { useState } from "react";
import {
  Unlock,
  MinusCircle,
  Coins,
  ArrowDownRight,
  Sparkles,
  Banknote,
  CreditCard,
  Smartphone,
  TrendingDown,
  Clock,
  CheckCircle,
  Calendar,
  Download,
  ChevronRight,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import ModalRegistrarRetiro from "./ModalRegistrarRetiro";
import ModalDetalleArqueo, { MockTurnoCerrado } from "./ModalDetalleArqueo";

const MOCK_ARQUEOS: MockTurnoCerrado[] = [
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
    observacion: "Turno cerrado sin novedades. Conteo exacto en caja física.",
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
    observacion: "Alta afluencia de clientes. Arqueo verificado conforme.",
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

export const VistaGestionCajas: React.FC = () => {
  const [modalRetiroAbierto, setModalRetiroAbierto] = useState(false);
  const [arqueoSeleccionado, setArqueoSeleccionado] =
    useState<MockTurnoCerrado | null>(null);
  const [filtroPeriodo, setFiltroPeriodo] = useState("7_dias");

  const formatMoneda = (monto: number) =>
    `S/ ${Math.abs(monto).toLocaleString("es-PE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <div className="w-full max-w-7xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* ============================================================== */}
      {/* 1. CABECERA DE PÁGINA (Limpia y con espaciado generoso mb-8)   */}
      {/* ============================================================== */}
      <header className="mb-8 space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-bold text-texto-primario tracking-tight">
          Gestión de Cajas
        </h1>
        <p className="text-sm text-texto-mutado">
          Supervisa el turno actual, registra retiros y revisa el historial de arqueos.
        </p>
      </header>

      <div className="space-y-8">
        {/* ============================================================== */}
        {/* 2. PANEL CAJA ACTIVA (bg-superficie, rounded-3xl, p-8)         */}
        {/* ============================================================== */}
        <section
          aria-label="Caja activa actual"
          className="bg-superficie rounded-3xl p-6 sm:p-8 border border-borde-suave shadow-[var(--sombra-tarjeta)] transition-all"
        >
          {/* Header del panel: Flex separando Turno Abierto y Botón Registrar Retiro */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-borde-gris-claro">
            <div className="flex flex-wrap items-center gap-3.5">
              {/* Badge Turno Abierto con ícono verde Unlock y fondo bg-exito-fondo */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-exito-fondo text-exito-texto border border-exito-borde shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                </span>
                <Unlock size={14} className="text-emerald-700" />
                <span>Turno Abierto</span>
              </div>

              <span className="hidden sm:inline-block w-px h-4 bg-borde-gris" />

              {/* Responsable */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primario-suave text-texto-primario font-bold text-xs flex items-center justify-center border border-primario/15">
                  CR
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-bold text-texto-principal">
                    Camila Rojas
                  </span>
                  <span className="text-xs text-texto-mutado">
                    Turno Mañana (08:30 - 16:30)
                  </span>
                </div>
              </div>
            </div>

            {/* Botón: fondo transparente, borde sutil, hover gris */}
            <div>
              <button
                type="button"
                onClick={() => setModalRetiroAbierto(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm text-texto-principal bg-transparent hover:bg-superficie-hover border border-borde-gris transition-all duration-200 cursor-pointer shadow-2xs active:scale-[0.98]"
              >
                <MinusCircle size={17} className="text-coral-oscuro" />
                <span>Registrar Retiro</span>
              </button>
            </div>
          </div>

          {/* Grid de Métricas: Efectivo Esperado destacado en text-texto-oscuro */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 py-6">
            {/* Fondo Inicial */}
            <div className="bg-superficie-gris rounded-2xl p-5 border border-borde-tenue flex flex-col justify-between">
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
                  S/ 150.00
                </div>
                <p className="text-xs text-texto-mutado mt-1">
                  Monto de apertura en caja
                </p>
              </div>
            </div>

            {/* Retiros */}
            <div className="bg-superficie-gris rounded-2xl p-5 border border-borde-tenue flex flex-col justify-between">
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
                  -S/ 20.00
                </div>
                <p className="text-xs text-texto-mutado mt-1">
                  1 egreso registrado (Insumos)
                </p>
              </div>
            </div>

            {/* Efectivo Esperado (Destacado visualmente con text-texto-oscuro y mayor tamaño) */}
            <div className="relative bg-gradient-to-br from-primario-suave/80 via-superficie to-superficie rounded-2xl p-5 border-2 border-primario/25 shadow-sm flex flex-col justify-between overflow-hidden">
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
                <div className="text-3xl sm:text-4xl font-extrabold text-texto-oscuro tracking-tight">
                  S/ 480.00
                </div>
                <div className="flex items-center gap-1 text-xs text-texto-mutado mt-1.5">
                  <span>Fondo (S/ 150) + Cobros (S/ 350) - Retiro (S/ 20)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Desglose: Tarjeta interna gris (bg-superficie-gris rounded-2xl p-5) */}
          <div className="bg-superficie-gris rounded-2xl p-5 border border-borde-tenue">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-texto-primario">
                  Desglose de Cobros del Turno
                </span>
                <span className="text-xs text-texto-mutado">
                  • Total ventas:{" "}
                  <strong className="text-texto-principal font-semibold">
                    S/ 850.00
                  </strong>
                </span>
              </div>
              <span className="text-[11px] text-texto-mutado font-medium">
                37 transacciones registradas
              </span>
            </div>

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
                    S/ 350.00
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
                    S/ 240.00
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
                    S/ 185.00
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
                    S/ 75.00
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* 3. AUDITORÍA DEL MES (ÍCONOS CON FONDO CIRCULAR TENUE)         */}
        {/* ============================================================== */}
        <section aria-label="Auditoría del mes" className="space-y-4">
          <h2 className="text-base font-semibold text-texto-secundario tracking-tight flex items-center gap-2">
            <ShieldCheck size={18} className="text-texto-primario" />
            <span>Auditoría del Mes</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* KPI 1: Faltantes (Ícono rojo sobre círculo bg-error-fondo) */}
            <div className="bg-superficie border border-borde-suave rounded-2xl p-5 shadow-[var(--sombra-tarjeta)] flex items-center gap-4 transition-all hover:border-error-borde">
              <div className="w-12 h-12 rounded-full bg-error-fondo text-error-texto flex items-center justify-center shrink-0 border border-error-borde/70">
                <TrendingDown size={22} />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-medium text-texto-mutado block">
                  Faltantes acumulados
                </span>
                <div className="text-xl sm:text-2xl font-bold text-error-texto tracking-tight mt-0.5">
                  -S/ 15.00
                </div>
                <span className="text-xs text-texto-claro block">
                  1 turno con descuadre
                </span>
              </div>
            </div>

            {/* KPI 2: Por revisar (Ícono naranja sobre círculo bg-advertencia-fondo) */}
            <div className="bg-superficie border border-borde-suave rounded-2xl p-5 shadow-[var(--sombra-tarjeta)] flex items-center gap-4 transition-all hover:border-advertencia-borde">
              <div className="w-12 h-12 rounded-full bg-advertencia-fondo text-advertencia-texto flex items-center justify-center shrink-0 border border-advertencia-borde/70">
                <Clock size={22} />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-medium text-texto-mutado block">
                  Turnos por revisar
                </span>
                <div className="text-xl sm:text-2xl font-bold text-advertencia-texto tracking-tight mt-0.5">
                  2 turnos
                </div>
                <span className="text-xs text-texto-claro block">
                  Pendientes de firma o revisión
                </span>
              </div>
            </div>

            {/* KPI 3: Efectividad (Ícono verde sobre círculo bg-exito-fondo) */}
            <div className="bg-superficie border border-borde-suave rounded-2xl p-5 shadow-[var(--sombra-tarjeta)] flex items-center gap-4 transition-all hover:border-exito-borde">
              <div className="w-12 h-12 rounded-full bg-exito-fondo text-exito-texto flex items-center justify-center shrink-0 border border-exito-borde/70">
                <CheckCircle size={22} />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-medium text-texto-mutado block">
                  Efectividad de arqueo
                </span>
                <div className="text-xl sm:text-2xl font-bold text-exito-texto tracking-tight mt-0.5">
                  98.4%
                </div>
                <span className="text-xs text-texto-claro block">
                  31 de 32 turnos cuadrados
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* 4. HISTORIAL DE ARQUEOS (LISTA EN flex-col gap-4)              */}
        {/* ============================================================== */}
        <section aria-label="Historial de arqueos" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-texto-primario tracking-tight">
                Historial de Arqueos
              </h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-superficie-gris text-texto-mutado border border-borde-gris">
                {MOCK_ARQUEOS.length} turnos
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
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-texto-mutado">
                  <Calendar size={14} />
                </div>
              </div>

              {/* Botón Exportar */}
              <button
                type="button"
                onClick={() =>
                  alert("Simulación: Reporte de arqueos exportado a Excel")
                }
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-texto-primario hover:bg-primario-suave border border-transparent hover:border-borde-suave transition-all duration-200 cursor-pointer shadow-2xs active:scale-98"
              >
                <Download size={16} />
                <span>Exportar</span>
              </button>
            </div>
          </div>

          {/* Encabezado descriptivo para desktop */}
          <div className="hidden lg:grid grid-cols-12 gap-4 px-5 py-2 text-xs font-semibold text-texto-mutado uppercase tracking-wider">
            <div className="col-span-3">Fecha y Turno</div>
            <div className="col-span-3">Responsable</div>
            <div className="col-span-2">Monto Esperado</div>
            <div className="col-span-2">Diferencia</div>
            <div className="col-span-1">Estado</div>
            <div className="col-span-1 text-right">Acción</div>
          </div>

          {/* Lista en flex-col gap-4 con jerarquía estricta */}
          <div className="flex flex-col gap-4">
            {MOCK_ARQUEOS.map((item) => (
              <div
                key={item.id}
                className="bg-superficie rounded-2xl p-4 sm:p-5 border border-borde-suave hover:bg-superficie-hover hover:border-primario/30 transition-all duration-200 shadow-[var(--sombra-tarjeta)] group"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                  {/* Fecha y Turno (col-span-3) */}
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

                  {/* Responsable (col-span-3) */}
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

                  {/* Jerarquía estricta: Monto principal en bold oscuro y "Contado:" en text-texto-claro text-xs (col-span-2) */}
                  <div className="lg:col-span-2 flex flex-col justify-center">
                    <span className="text-xs text-texto-mutado lg:hidden font-medium">
                      Monto Esperado:
                    </span>
                    <span className="text-sm font-bold text-texto-oscuro">
                      {formatMoneda(item.montoEsperado)}
                    </span>
                    <span className="text-xs text-texto-claro mt-0.5">
                      Contado: {formatMoneda(item.montoReal)}
                    </span>
                  </div>

                  {/* Diferencia (col-span-2) */}
                  <div className="lg:col-span-2 flex flex-col justify-center">
                    <span className="text-xs text-texto-mutado lg:hidden font-medium">
                      Diferencia:
                    </span>
                    {item.diferencia === 0 ? (
                      <span className="text-sm font-medium text-texto-mutado">
                        S/ 0.00 Exacto
                      </span>
                    ) : item.diferencia < 0 ? (
                      <span className="text-sm font-bold text-error-texto">
                        -{formatMoneda(item.diferencia)} Faltante
                      </span>
                    ) : (
                      <span className="text-sm font-bold text-exito-texto">
                        +{formatMoneda(item.diferencia)} Sobrante
                      </span>
                    )}
                  </div>

                  {/* Badge de Estado con ícono Lucide (col-span-1) */}
                  <div className="lg:col-span-1 flex items-center">
                    {item.estado === "cuadrado" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-exito-fondo text-exito-texto border border-exito-borde shadow-2xs">
                        <CheckCircle size={13} className="shrink-0" />
                        <span>Cuadrado</span>
                      </span>
                    )}
                    {item.estado === "faltante" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-error-fondo text-error-texto border border-error-borde shadow-2xs">
                        <AlertCircle size={13} className="shrink-0" />
                        <span>Faltante</span>
                      </span>
                    )}
                    {item.estado === "por_revisar" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-advertencia-fondo text-advertencia-texto border border-advertencia-borde shadow-2xs">
                        <Clock size={13} className="shrink-0" />
                        <span>Por revisar</span>
                      </span>
                    )}
                  </div>

                  {/* Botón Revisar (col-span-1) */}
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
        </section>
      </div>

      {/* ============================================================== */}
      {/* 5. MODALES EN CARPETAS INDEPENDIENTES                          */}
      {/* ============================================================== */}
      <ModalRegistrarRetiro
        isOpen={modalRetiroAbierto}
        onClose={() => setModalRetiroAbierto(false)}
        nombreResponsable="Camila Rojas"
        efectivoDisponible={480.0}
      />

      <ModalDetalleArqueo
        isOpen={Boolean(arqueoSeleccionado)}
        onClose={() => setArqueoSeleccionado(null)}
        mockData={arqueoSeleccionado}
      />
    </div>
  );
};

export default VistaGestionCajas;
