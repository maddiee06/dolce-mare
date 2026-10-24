"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import FormularioMovimiento from "../../../../../components/cajero/Inventario/FormularioMovimiento";
import {
  listarInventario,
  listarTiposMovimiento,
  obtenerResponsable,
  registrarMovimiento,
} from "../../../../../services/inventarioApi";
import type {
  ArticuloInventario,
  RegistrarMovimientoInput,
  Responsable,
  TipoMovimiento,
} from "../../../../../models/Inventario";
import type { ClaseMovimiento } from "../../../../../utils/movimientos";

function RegistrarContenido() {
  const router = useRouter();
  const params = useSearchParams();
  const idProducto = Number(params.get("producto")) || null;
  const tipoParam = params.get("tipo");
  const clase: ClaseMovimiento =
    tipoParam === "salida" || tipoParam === "ajuste" ? tipoParam : "entrada";

  const [articulos, setArticulos] = useState<ArticuloInventario[]>([]);
  const [tipos, setTipos] = useState<TipoMovimiento[]>([]);
  const [responsable, setResponsable] = useState<Responsable | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      listarInventario({ tipo: "envases" }),
      listarInventario({ tipo: "sabores" }),
      listarTiposMovimiento(),
      obtenerResponsable().catch(() => null),
    ])
      .then(([a, b, t, r]) => {
        setArticulos([...a.grupos, ...b.grupos].flatMap((g) => g.articulos));
        setTipos(t);
        setResponsable(r);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Error al cargar"))
      .finally(() => setCargando(false));
  }, []);

  const hrefVolver = idProducto
    ? `/cajero/inventario/kardex?producto=${idProducto}`
    : "/cajero/inventario/kardex";

  async function guardar(input: RegistrarMovimientoInput) {
    await registrarMovimiento(input);
    router.push(`/cajero/inventario/kardex?producto=${input.idProducto}`);
    router.refresh();
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-text-secondary">Registrar movimiento</h1>
          <p className="mt-1 text-sm text-text-disabled">
            Completa los datos y revisa el nuevo saldo antes de guardar.
          </p>
        </div>
        <Link
          href={hrefVolver}
          className="rounded-xl bg-text-primary/10 px-5 py-2.5 text-sm font-semibold text-text-primary transition hover:bg-text-primary/20"
        >
          ← Volver al Kardex
        </Link>
      </div>

      {error && (
        <p className="mb-4 rounded-2xl bg-error px-5 py-3 text-sm text-text-secondary">{error}</p>
      )}

      {cargando && <p className="text-text-disabled">Cargando…</p>}

      {!cargando && !error && (
        <FormularioMovimiento
          articulos={articulos}
          tipos={tipos}
          responsable={responsable}
          articuloInicialId={idProducto}
          claseInicial={clase}
          hrefCancelar={hrefVolver}
          onGuardar={guardar}
        />
      )}
    </>
  );
}

export default function RegistrarMovimientoPage() {
  return (
    <Suspense fallback={<p className="text-text-disabled">Cargando…</p>}>
      <RegistrarContenido />
    </Suspense>
  );
}