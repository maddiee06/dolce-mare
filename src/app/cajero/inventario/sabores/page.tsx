"use client";

import Link from "next/link";
import FiltrosInventario from "../../../../components/cajero/Inventario/FiltrosInventario";
import ResumenInventario from "../../../../components/cajero/Inventario/ResumenInventario";
import SubTabsInventario from "../../../../components/cajero/Inventario/SubTabsInventario";
import TarjetaSabores from "../../../../components/cajero/Inventario/TarjetaSabores";
import { useInventario } from "../../../../hooks/useInventario";

export default function InventarioSaboresPage() {
  const inv = useInventario("sabores");

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-text-secondary">Sabores</h1>
          <p className="mt-1 text-sm text-text-disabled">
            Controla helados y cremoladas por separado, con una misma unidad de medida.
          </p>
        </div>

        <Link
          href="/cajero/inventario/kardex/registrar"
          className="rounded-xl bg-botton-primary px-6 py-3 font-semibold text-text-secondary transition hover:brightness-95"
        >
          Registrar movimiento
        </Link>
      </div>

      <SubTabsInventario nota="Sabores medidos en litros (L)" />

      <div className="mb-5 flex flex-wrap items-stretch gap-4">
        <FiltrosInventario
          busqueda={inv.busqueda}
          onBusqueda={inv.setBusqueda}
          estado={inv.estado}
          onEstado={inv.setEstado}
          etiquetaBusqueda="Buscar sabor"
          placeholder="Nombre del sabor"
        />
        {inv.datos && <ResumenInventario resumen={inv.datos.resumen} unidad="sabores" />}
      </div>

      {inv.error && (
        <p className="mb-4 rounded-2xl bg-error px-5 py-3 text-sm text-text-secondary">
          {inv.error}
        </p>
      )}

      {inv.cargando && !inv.datos && <p className="text-text-disabled">Cargando sabores…</p>}

      {inv.datos && (
        <div className="grid items-start gap-5 lg:grid-cols-2">
          {inv.datos.grupos.map((g) => (
            <TarjetaSabores key={g.categoria} grupo={g} />
          ))}

          <div className="rounded-3xl bg-seleccion px-6 py-5 text-sm text-text-secondary">
            <h3 className="mb-1 font-semibold text-text-primary">Un Kardex para cada sabor</h3>
            <p>
              Las entradas aumentan el stock; las ventas y mermas lo reducen. Registra siempre las
              cantidades en litros, también en los ajustes.
            </p>
            <p className="mt-3 text-xs text-text-disabled">
              Stock bajo: existencias iguales o inferiores al mínimo. Agotado: saldo de 0 L.
            </p>
          </div>
        </div>
      )}

      {inv.datos && inv.datos.grupos.length === 0 && !inv.error && (
        <p className="rounded-2xl bg-nav px-6 py-10 text-center text-text-disabled">
          No hay sabores que coincidan con tu búsqueda.
        </p>
      )}
    </>
  );
}