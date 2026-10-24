"use client";

import Link from "next/link";
import FiltrosInventario from "../../../components/cajero/Inventario/FiltrosInventario";
import ResumenInventario from "../../../components/cajero/Inventario/ResumenInventario";
import SubTabsInventario from "../../../components/cajero/Inventario/SubTabsInventario";
import TablaInventario from "../../../components/cajero/Inventario/TablaInventario";
import { useInventario } from "../../../hooks/useInventario";

export default function InventarioEnvasesPage() {
  const inv = useInventario("envases");

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-text-secondary">Envases y utensilios</h1>
          <p className="mt-1 text-sm text-text-disabled">
            Revisa tus existencias y lleva el Kardex de cada artículo, sin salir del cajero.
          </p>
        </div>

        <Link
          href="/cajero/inventario/kardex/registrar"
          className="rounded-xl bg-botton-primary px-6 py-3 font-semibold text-text-secondary transition hover:brightness-95"
        >
          Registrar movimiento
        </Link>
      </div>

      <SubTabsInventario nota="Todos los artículos se controlan en unidades" />

      <div className="mb-5 flex flex-wrap items-stretch gap-4">
        <FiltrosInventario
          busqueda={inv.busqueda}
          onBusqueda={inv.setBusqueda}
          estado={inv.estado}
          onEstado={inv.setEstado}
          etiquetaBusqueda="Buscar artículo"
          placeholder="Nombre del envase o utensilio"
        />
        {inv.datos && <ResumenInventario resumen={inv.datos.resumen} unidad="artículos" />}
      </div>

      {inv.error && (
        <p className="mb-4 rounded-2xl bg-error px-5 py-3 text-sm text-text-secondary">
          {inv.error}
        </p>
      )}

      {inv.cargando && !inv.datos && <p className="text-text-disabled">Cargando inventario…</p>}

      {inv.datos?.grupos.map((g) => (
        <TablaInventario key={g.categoria} grupo={g} />
      ))}

      {inv.datos && inv.datos.grupos.length === 0 && !inv.error && (
        <p className="rounded-2xl bg-nav px-6 py-10 text-center text-text-disabled">
          No hay artículos que coincidan con tu búsqueda.
        </p>
      )}
    </>
  );
}