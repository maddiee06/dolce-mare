"use client";

import React, { useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  SlidersHorizontal,
  History,
  ArrowRight,
  User,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import styles from "./HistorialMovimientos.module.scss";

export interface Movimiento {
  id: string;
  fecha: string;
  usuario: string;
  producto: string;
  tipo: "Ingreso" | "Merma" | "Ajuste";
  cantidad: number;
}

export interface HistorialMovimientosProps {
  movimientos?: Movimiento[];
  onVerHistorialCompleto?: () => void;
  className?: string;
}

// Datos de prueba simulados con el contexto real de Dolce Mare
const MOCK_MOVIMIENTOS: Movimiento[] = [
  {
    id: "mov-01",
    fecha: "Hoy, 14:32",
    usuario: "Carlos Ruiz (Admin)",
    producto: "Helado de Lúcuma",
    tipo: "Ingreso",
    cantidad: 15,
  },
  {
    id: "mov-02",
    fecha: "Hoy, 11:15",
    usuario: "Ana Torres (Cajero)",
    producto: "Cremolada de Fresa",
    tipo: "Merma",
    cantidad: 2,
  },
  {
    id: "mov-03",
    fecha: "Ayer, 18:40",
    usuario: "Carlos Ruiz (Admin)",
    producto: "Vasos 16 oz Eco",
    tipo: "Ajuste",
    cantidad: 50,
  },
  {
    id: "mov-04",
    fecha: "Ayer, 09:20",
    usuario: "Lucía Méndez (Turno)",
    producto: "Helado Chocolate Belga",
    tipo: "Ingreso",
    cantidad: 10,
  },
];

/**
 * Resuelve la unidad de medida visual según el artículo
 */
function deducirUnidad(producto: string): string {
  const p = producto.toLowerCase();
  if (p.includes("cremolada")) return "Vasos";
  if (p.includes("helado") || p.includes("lúcuma") || p.includes("chocolate"))
    return "Porc.";
  if (p.includes("vaso") || p.includes("envase") || p.includes("eco"))
    return "Unid.";
  return "Unid.";
}

/**
 * Configuración visual y semántica por tipo de movimiento
 * usando los tokens de color del sistema de diseño de Dolce Mare
 */
const TIPO_CONFIG: Record<
  Movimiento["tipo"],
  {
    badge: string;
    icono: React.ReactNode;
    prefijo: string;
    cantidadColor: string;
    bordeTarjeta: string;
  }
> = {
  Ingreso: {
    badge: "bg-exito-fondo text-exito-texto border-exito-borde",
    icono: <ArrowDownLeft className="h-3.5 w-3.5 stroke-[2.5]" />,
    prefijo: "+",
    cantidadColor: "text-exito-texto font-extrabold",
    bordeTarjeta: "hover:border-exito-borde/80",
  },
  Merma: {
    badge: "bg-error-fondo text-error-texto border-error-borde",
    icono: <ArrowUpRight className="h-3.5 w-3.5 stroke-[2.5]" />,
    prefijo: "-",
    cantidadColor: "text-error-texto font-extrabold",
    bordeTarjeta: "hover:border-error-borde/80",
  },
  Ajuste: {
    badge: "bg-advertencia-fondo text-advertencia-texto border-advertencia-borde",
    icono: <SlidersHorizontal className="h-3.5 w-3.5 stroke-[2.5]" />,
    prefijo: "±",
    cantidadColor: "text-advertencia-texto font-extrabold",
    bordeTarjeta: "hover:border-advertencia-borde/80",
  },
};

export default function HistorialMovimientos({
  movimientos = MOCK_MOVIMIENTOS,
  onVerHistorialCompleto,
  className = "",
}: HistorialMovimientosProps) {
  const [estaPlegado, setEstaPlegado] = useState(false);

  return (
    <div
      className={`rounded-2xl border border-borde-suave bg-superficie p-4 sm:p-5 shadow-[var(--sombra-tarjeta)] ${styles.contenedor} ${className}`}
    >
      {/* Barra Superior de la Sección */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-borde-tenue">
        {/* Lado Izquierdo: Título + Badge de Pulso */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primario-suave text-primario">
            <History className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-texto-primario tracking-tight">
                Últimos Movimientos
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-superficie-gris px-2 py-0.5 text-[11px] font-semibold text-texto-secundario border border-borde-gris">
                <span className="h-1.5 w-1.5 rounded-full bg-exito animate-pulse" />
                {movimientos.length} recientes
              </span>
            </div>
          </div>
        </div>

        {/* Lado Derecho: Acciones (Ver Todo y Plegar) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onVerHistorialCompleto}
            className="group inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-primario-claro hover:bg-primario-suave hover:text-primario transition-all focus:outline-none"
          >
            <span>Ver historial completo</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>

          <button
            type="button"
            onClick={() => setEstaPlegado(!estaPlegado)}
            title={estaPlegado ? "Expandir tarjetas" : "Plegar resumen"}
            className="rounded-xl border border-borde-gris bg-superficie p-1.5 text-texto-mutado hover:bg-superficie-hover hover:text-texto-primario transition-all focus:outline-none"
          >
            {estaPlegado ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Grid de Tarjetas Ejecutivas */}
      {!estaPlegado && (
        <div className="mt-3.5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {movimientos.map((mov) => {
            const conf = TIPO_CONFIG[mov.tipo];
            const unidad = deducirUnidad(mov.producto);

            return (
              <div
                key={mov.id}
                className={`group relative flex flex-col justify-between rounded-xl border border-borde-suave bg-[#fdfcf9] p-3.5 transition-all duration-200 hover:bg-superficie ${conf.bordeTarjeta} ${styles.tarjetaMovimiento}`}
              >
                {/* Cabecera de la tarjeta: Badge + Cantidad */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold border ${conf.badge}`}
                  >
                    {conf.icono}
                    <span>{mov.tipo}</span>
                  </span>

                  <span
                    className={`text-xs font-bold tracking-tight ${conf.cantidadColor}`}
                  >
                    {conf.prefijo}
                    {mov.cantidad}{" "}
                    <span className="text-[10px] font-normal text-texto-mutado lowercase">
                      {unidad}
                    </span>
                  </span>
                </div>

                {/* Contenido Central: Nombre del Producto */}
                <div className="my-2.5">
                  <h3
                    title={mov.producto}
                    className="text-sm font-bold text-texto-oscuro group-hover:text-primario transition-colors truncate"
                  >
                    {mov.producto}
                  </h3>
                </div>

                {/* Pie de Tarjeta: Usuario y Hora */}
                <div className="flex items-center justify-between border-t border-borde-tenue/60 pt-2 text-[11px] text-texto-mutado">
                  <div className="flex items-center gap-1 truncate max-w-[55%]">
                    <User className="h-3 w-3 shrink-0 opacity-70" />
                    <span className="truncate">{mov.usuario.split(" ")[0]}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Clock className="h-3 w-3 opacity-70" />
                    <span>{mov.fecha}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
