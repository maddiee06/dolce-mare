"use client";
import React from "react";
import { KpiCard } from "@/src/components/admin/dashboard/KpiCard";
import { TopSaboresCard } from "@/src/components/admin/dashboard/TopSaboresCard";
import { MetodosPagoCard } from "@/src/components/admin/dashboard/MetodosPagoCard";
import { RankingPersonalCard } from "@/src/components/admin/dashboard/RankingPersonalCard";
import { AlertasOperativasCard } from "@/src/components/admin/dashboard/AlertasOperativasCard";
import { SaborData } from "@/src/components/admin/dashboard/TopSaboresCard/TopSaboresCard";
import { MetodoPagoData } from "@/src/components/admin/dashboard/MetodosPagoCard/MetodosPagoCard";
import { PersonalData } from "@/src/components/admin/dashboard/RankingPersonalCard/RankingPersonalCard";
import { EvolucionVentasCard } from "@/src/components/admin/dashboard/EvolucionVentasCard";
import {
  MermaAlerta,
  StockAlerta,
} from "@/src/components/admin/dashboard/AlertasOperativasCard/AlertasOperativasCard";
import { VentaDiaData } from "@/src/components/admin/dashboard/EvolucionVentasCard/EvolucionVentasCard";

export default function DashboardView() {
  // Datos Simulados
  const mockEvolucion: VentaDiaData[] = [
    { dia: "Sáb 03", total: 1550, esHoy: false },
    { dia: "Dom 04", total: 1820, esHoy: false },
    { dia: "Lun 05", total: 1680, esHoy: false },
    { dia: "Mar 06", total: 2100, esHoy: false },
    { dia: "Mié 07", total: 1980, esHoy: false },
    { dia: "Jue 08", total: 2240, esHoy: false },
    { dia: "Hoy 09", total: 1428, esHoy: true },
  ];

  const mockSabores: SaborData[] = [
    { nombre: "Lúcuma", nivel: "Premium", cantidad: 198, porcentaje: 100 },
    {
      nombre: "Chocolate Belga 70%",
      nivel: "Especial",
      cantidad: 165,
      porcentaje: 83,
    },
    {
      nombre: "Fresa a la Crema",
      nivel: "Clásico",
      cantidad: 151,
      porcentaje: 76,
    },
    {
      nombre: "Vainilla Bourbon",
      nivel: "Clásico",
      cantidad: 112,
      porcentaje: 56,
    },
    { nombre: "Pistacho", nivel: "Premium", cantidad: 98, porcentaje: 49 },
  ];

  const mockMetodos: MetodoPagoData[] = [
    {
      nombre: "Efectivo",
      monto: "S/ 1,250.00",
      porcentaje: 43.2,
      porcentajeBarra: 100,
      tipo: "efectivo",
    },
    {
      nombre: "Yape",
      monto: "S/ 1,148.00",
      porcentaje: 39.7,
      porcentajeBarra: 90,
      tipo: "yape",
    },
    {
      nombre: "Tarjeta",
      monto: "S/ 495.00",
      porcentaje: 17.1,
      porcentajeBarra: 40,
      tipo: "tarjeta",
    },
  ];

  const mockPersonal: PersonalData[] = [
    { id: 7, nombre: "Mariana Rojas", ventas: 31, ticket: "S/ 16.80" },
    { id: 9, nombre: "Carla Fiestas", ventas: 38, ticket: "S/ 13.40" },
    { id: 11, nombre: "Daniela Ruiz", ventas: 22, ticket: "S/ 10.60" },
  ];

  const mockStock: StockAlerta[] = [
    { nombre: "Base Lúcuma 5L", minimo: "3 bidón", actual: "1 bidón" },
    { nombre: "Base Pistacho 5L", minimo: "2 bidón", actual: "2 bidón" },
  ];

  const mockMermas: MermaAlerta[] = [
    { nombre: "Chocolate Belga 70%", motivo: "Vencido", cantidad: "-0.5" },
    { nombre: "Vasos medianos", motivo: "Dañado", cantidad: "-6" },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Título */}
      <div>
        <h1 className="text-2xl font-bold text-[#1a365d]">Resumen General</h1>
        <p className="text-sm text-gray-500 mt-1">
          Métricas principales de las operaciones de hoy.
        </p>
      </div>

      {/* KPIs */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Ventas de hoy"
          value="S/ 1,428.00"
          subtitle="-36.3% vs. ayer a esta hora"
          subtitleColor="text-red-500"
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
          subtitleColor="text-blue-500"
        />
      </section>

      {/* Evolución de Ventas */}
      <section className="w-full">
        <EvolucionVentasCard
          datos={mockEvolucion}
          acumulado="S/ 12,798.00"
          rangoFechas="03–09 oct 2026"
        />
      </section>

      {/* Top Sabores y Métodos de Pago */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopSaboresCard sabores={mockSabores} />
        <MetodosPagoCard metodos={mockMetodos} />
      </section>

      {/* Ranking Personal y Alertas */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RankingPersonalCard personal={mockPersonal} />
        <AlertasOperativasCard stockAlertas={mockStock} mermas={mockMermas} />
      </section>
    </div>
  );
}
