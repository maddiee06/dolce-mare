"use client";
import React from "react";
import { KpiCard } from "@/src/components/admin/KpiCard";
// import { SalesChartCard } from './SalesChartCard';
// import { StockAlertsCard } from './StockAlertsCard';

export default function DashboardView() {
  return (
    <div className="p-6 bg-[#131316] min-h-screen text-white flex flex-col gap-5">
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Ventas de hoy"
          value="S/ 1,428.00"
          subtitle="-36.3% vs. ayer a esta hora"
          subtitleColor="text-orange-400"
        />
        <KpiCard
          title="Ventas realizadas"
          value="86"
          subtitle="Comprobantes pagados"
        />
        <KpiCard
          title="Ticket promedio"
          value="S/ 16.60"
          subtitle="Por venta de hoy"
        />
        <KpiCard
          title="Cuentas abiertas"
          value="4"
          subtitle="S/ 84.00 por cobrar"
          subtitleColor="text-blue-400"
        />
      </section>

      {/* Fila 2: Gráfico (Ancho) y Alertas (Estrecho) */}
      <section className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* El gráfico ocupa 3 de las 4 columnas */}
        <div className="lg:col-span-3 bg-[#1e1e24] rounded-2xl border border-gray-800 p-5 min-h-[350px]">
          {/* <SalesChartCard /> */}
          <h2 className="text-blue-200 font-semibold text-lg">
            Evolución de ventas
          </h2>
          <p className="text-gray-400 text-sm">
            Últimos 7 días · S/ 12,798.00 acumulados
          </p>
          {/* Aquí integrarías Recharts o Chart.js */}
        </div>

        {/* El inventario ocupa 1 columna */}
        <div className="lg:col-span-1 bg-[#1e1e24] rounded-2xl border border-gray-800 p-5 min-h-[350px]">
          {/* <StockAlertsCard /> */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-blue-200 font-semibold text-lg">
              Stock por reponer
            </h2>
            <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-1 rounded-md font-medium">
              3 alertas
            </span>
          </div>
          {/* Aquí mapearías los ProgressBarItem */}
        </div>
      </section>
    </div>
  );
}
