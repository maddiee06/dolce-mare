import React from "react";
import { cookies } from "next/headers";
import { createClient } from "@/src/utils/supabase/server";
import { DashboardDAO } from "@/src/dao/supabase/DashboardDAO";
import { DashboardController } from "@/src/controllers/DashboardController";

import { KpiCard } from "@/src/components/admin/dashboard/KpiCard";
import { TopSaboresCard } from "@/src/components/admin/dashboard/TopSaboresCard";
import { MetodosPagoCard } from "@/src/components/admin/dashboard/MetodosPagoCard";
import { RankingPersonalCard } from "@/src/components/admin/dashboard/RankingPersonalCard";
import { AlertasOperativasCard } from "@/src/components/admin/dashboard/AlertasOperativasCard";
import { EvolucionVentasCard } from "@/src/components/admin/dashboard/EvolucionVentasCard";
import { MetodoPagoData } from "@/src/components/admin/dashboard/MetodosPagoCard/MetodosPagoCard";

export const instant = false;

export default async function DashboardView() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const dao = new DashboardDAO(supabase);
  const controller = new DashboardController(dao);

  const idSedeCookie = cookieStore.get("id_sede")?.value;
  const idSede = idSedeCookie ? parseInt(idSedeCookie, 10) : 1;

  const dbData = await controller.getDashboardCompleto(idSede);

  const formatSoles = (monto: number) =>
    `S/ ${monto.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1a365d]">Resumen General</h1>
        <p className="text-sm text-gray-500 mt-1">
          Métricas principales de las operaciones de hoy.
        </p>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Ventas de hoy"
          value={formatSoles(dbData.resumen.ventasHoy)}
          subtitle={`${dbData.resumen.variacionVentas > 0 ? "+" : ""}${dbData.resumen.variacionVentas.toFixed(1)}% vs. ayer a esta hora`}
          subtitleColor={
            dbData.resumen.variacionVentas >= 0
              ? "text-green-500"
              : "text-red-500"
          }
        />
        <KpiCard
          title="Ventas realizadas"
          value={dbData.resumen.cantidadVentas.toString()}
          subtitle="Comprobantes pagados"
        />
        <KpiCard
          title="Ticket promedio"
          value={formatSoles(dbData.resumen.ticketPromedio)}
          subtitle="Por venta de hoy"
        />
        <KpiCard
          title="Cuentas abiertas"
          value={dbData.resumen.cuentasAbiertas.toString()}
          subtitle={`${formatSoles(dbData.resumen.montoPorCobrar)} por cobrar`}
          subtitleColor="text-blue-500"
        />
      </section>

      <section className="w-full">
        <EvolucionVentasCard
          datos={dbData.evolucion.datos}
          acumulado={formatSoles(dbData.evolucion.acumulado)}
          rangoFechas="Últimos 7 días"
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopSaboresCard sabores={dbData.sabores} />
        <MetodosPagoCard metodos={dbData.metodos as MetodoPagoData[]} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RankingPersonalCard personal={dbData.personal} />
        <AlertasOperativasCard
          stockAlertas={dbData.stock}
          mermas={dbData.mermas}
        />
      </section>
    </div>
  );
}
