"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import EstadoStockBadge from "../../../../components/cajero/Inventario/EstadoStockBadge";
import FiltroPeriodoKardex from "../../../../components/cajero/Inventario/FiltroPeriodoKardex";
import ResumenKardex from "../../../../components/cajero/Inventario/ResumenKardex";
import TablaKardex from "../../../../components/cajero/Inventario/TablaKardex";
import {
  listarInventario,
  obtenerKardex,
} from "../../../../services/inventarioApi";
import { formatearCantidad } from "../../../../utils/estadoStock";
import { exportarKardexCsv } from "../../../../utils/exportarKardex";
import type {
  ArticuloInventario,
  KardexRespuesta,
} from "../../../../models/Inventario";

const BOTON_SECUNDARIO =
  "rounded-xl bg-text-primary/10 px-5 py-2.5 text-sm font-semibold text-text-primary transition hover:bg-text-primary/20";

function KardexContenido() {
  const router = useRouter();
  const params = useSearchParams();

  const idProducto = Number(params.get("producto")) || null;
  const desde = params.get("desde") ?? undefined;
  const hasta = params.get("hasta") ?? undefined;

  const [articulos, setArticulos] = useState<ArticuloInventario[]>([]);
  const [kardex, setKardex] = useState<KardexRespuesta | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Cargar lista de artículos (Solo si no hay uno seleccionado)
  useEffect(() => {
    if (idProducto) return;

    let cancelado = false;
    const espera = setTimeout(async () => {
      try {
        const [a, b] = await Promise.all([
          listarInventario({ tipo: "envases" }),
          listarInventario({ tipo: "sabores" }),
        ]);
        if (cancelado) return;

        const todosLosArticulos = [...a.grupos, ...b.grupos].flatMap(
          (g) => g.articulos,
        );
        setArticulos(todosLosArticulos);
      } catch (e) {
        if (!cancelado) {
          setError(
            e instanceof Error ? e.message : "Error al cargar los artículos",
          );
        }
      }
    }, 0);

    return () => {
      cancelado = true;
      clearTimeout(espera);
    };
  }, [idProducto]);

  // 2. Cargar el Kardex del producto seleccionado
  useEffect(() => {
    let cancelado = false;

    const espera = setTimeout(async () => {
      if (!idProducto) {
        setKardex(null);
        return;
      }

      setCargando(true);
      try {
        const r = await obtenerKardex(idProducto, desde, hasta);
        if (cancelado) return;
        setKardex(r);
        setError(null);
      } catch (e) {
        if (cancelado) return;
        setKardex(null);
        setError(e instanceof Error ? e.message : "Error al cargar el kardex");
      } finally {
        if (!cancelado) setCargando(false);
      }
    }, 0);

    return () => {
      cancelado = true;
      clearTimeout(espera);
    };
  }, [idProducto, desde, hasta]);

  // Agrupación optimizada con useMemo
  const porCategoria = useMemo(() => {
    const mapa = new Map<string, ArticuloInventario[]>();
    for (const a of articulos) {
      mapa.set(a.categoria, [...(mapa.get(a.categoria) ?? []), a]);
    }
    return [...mapa.entries()];
  }, [articulos]);

  function aplicarFiltro(d: string, h: string) {
    router.replace(
      `/cajero/inventario/kardex?producto=${idProducto}&desde=${d}&hasta=${h}`,
    );
  }

  const art = kardex?.articulo;
  const enlaceRegistrar = (clase: string) =>
    `/cajero/inventario/kardex/registrar?producto=${idProducto}&tipo=${clase}`;

  return (
    <>
      {/* Cabecera y Botón Exportar */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-text-secondary">
            {art ? `Kardex de ${art.nombre}` : "Kardex"}
          </h1>
          <p className="mt-1 text-sm text-text-disabled">
            Cada entrada y salida, en orden. Consulta el saldo de este artículo.
          </p>
        </div>
        <button
          type="button"
          disabled={!kardex}
          onClick={() => kardex && exportarKardexCsv(kardex)}
          className={`${BOTON_SECUNDARIO} disabled:cursor-not-allowed disabled:opacity-50`}
        >
          ↓ Exportar Kardex
        </button>
      </div>

      {/* Manejo de Errores Visuales */}
      {error && (
        <p className="my-4 rounded-2xl bg-error px-5 py-3 text-sm text-text-secondary">
          {error}
        </p>
      )}

      {/* Selector de Producto (Si no hay selección) */}
      {!idProducto && (
        <label className="my-5 flex max-w-md flex-col gap-1 rounded-3xl bg-nav px-4 py-3">
          <span className="text-xs text-text-disabled">Artículo</span>
          <select
            value=""
            onChange={(e) =>
              e.target.value &&
              router.replace(
                `/cajero/inventario/kardex?producto=${e.target.value}`,
              )
            }
            className="rounded-xl bg-fondo px-3 py-2.5 text-sm text-text-secondary outline-none focus:ring-2 focus:ring-border-2"
          >
            <option value="">Selecciona un artículo</option>
            {porCategoria.map(([categoria, lista]) => (
              <optgroup key={categoria} label={categoria}>
                {lista.map((a) => (
                  <option key={a.idProducto} value={a.idProducto}>
                    {a.nombre}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
      )}

      {/* Estado de Carga */}
      {cargando && !kardex && (
        <p className="mt-6 text-text-disabled">Cargando kardex…</p>
      )}

      {/* Vista del Kardex Activo */}
      {kardex && art && (
        <>
          <div className="my-5 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-nav px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-seleccion text-xl font-bold text-text-primary">
                {art.nombre.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-lg font-semibold text-text-primary">
                    {art.nombre}
                  </span>
                  <EstadoStockBadge estado={art.estado} />
                </div>
                <div className="mt-0.5 text-xs text-text-disabled">
                  {art.categoria} · Unidad: {art.unidadMedida} · Mínimo:{" "}
                  {formatearCantidad(art.stockMinimo)} ·{" "}
                  <Link
                    href="/cajero/inventario/kardex"
                    className="text-text-primary hover:underline"
                  >
                    Cambiar artículo
                  </Link>
                </div>
              </div>
            </div>

            {/* Acciones de Kardex */}
            <div className="flex flex-wrap gap-2">
              <Link
                href={enlaceRegistrar("entrada")}
                className={BOTON_SECUNDARIO}
              >
                + Registrar entrada
              </Link>
              <Link
                href={enlaceRegistrar("salida")}
                className={BOTON_SECUNDARIO}
              >
                − Registrar salida
              </Link>
              <Link
                href={enlaceRegistrar("ajuste")}
                className={BOTON_SECUNDARIO}
              >
                ≈ Registrar ajuste
              </Link>
            </div>
          </div>

          <FiltroPeriodoKardex
            desde={kardex.desde}
            hasta={kardex.hasta}
            cargando={cargando}
            onAplicar={aplicarFiltro}
          />

          <ResumenKardex
            resumen={kardex.resumen}
            desde={kardex.desde}
            unidad={art.unidadMedida}
          />

          <TablaKardex
            movimientos={kardex.movimientos}
            unidad={art.unidadMedida}
          />
        </>
      )}
    </>
  );
}

export default function KardexPage() {
  return (
    <Suspense fallback={<p className="text-text-disabled">Cargando…</p>}>
      <KardexContenido />
    </Suspense>
  );
}
