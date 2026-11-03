
"use client";
import React, { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { EnvaseCard } from "../../../../components/cajero/ProductosCard";
import { CuentasAbiertas } from "../../../../components/cajero/CuentasAbiertas";

function VariantesBebidasContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tipo = searchParams.get("tipo") || "gaseosas";

  const obtenerVariantesBebidas = () => {
    if (tipo === "gaseosas") {
      return [
        { id: 1, titulo: "Inka Kola", descripcion: "La bebida del sabor nacional.", nota: "S/ 5.00 · 500 ml", imagen: "/bebidas/inkakola.jpg" },
        { id: 2, titulo: "Coca Cola", descripcion: "Clásica y refrescante.", nota: "S/ 5.00 · 500 ml", imagen: "/bebidas/cocacola.jpg" },
      ];
    }
    if (tipo === "agua") {
      return [
        { id: 3, titulo: "Agua Sin Gas", descripcion: "Agua mineral pura.", nota: "S/ 5.00 · 600 ml", imagen: "/bebidas/aguasingas.jpg" },
        { id: 4, titulo: "Agua Con Gas", descripcion: "Refrescante agua con gas.", nota: "S/ 5.00 · 600 ml", imagen: "/bebidas/aguacongas.jpg" },
      ];
    }
    if (tipo === "cafe") {
      return [
        { id: 5, titulo: "Espresso", descripcion: "Café corto e intenso.", nota: "S/ 5.00 · Taza", imagen: "/bebidas/espresso.jpg" },
        { id: 6, titulo: "Americano", descripcion: "Café suave y aromático.", nota: "S/ 8.00 · Taza", imagen: "/bebidas/americano.jpg" },
      ];
    }
    if (tipo === "cerveza") {
      return [
        { id: 7, titulo: "Cerveza Red Ale", descripcion: "Cerveza artesanal de cuerpo medio.", nota: "S/ 14.00 · 330 ml", imagen: "/bebidas/redale.jpg" },
        { id: 8, titulo: "Cerveza Imperial Stout", descripcion: "Notas oscuras de malta y cacao.", nota: "S/ 14.00 · 330 ml", imagen: "/bebidas/stout.jpg" },
      ];
    }
    return [];
  };

  const opcionesActivas = obtenerVariantesBebidas();

  return (
    <div className="flex flex-col lg:flex-row w-full h-full min-h-[calc(100vh-65px)] bg-[#FAF8F5] overflow-y-auto lg:overflow-hidden">
      
      <section className="flex-1 flex justify-center p-4 md:p-8 overflow-y-auto">
        <div className="w-full max-w-[900px] flex flex-col gap-6">
          
          <div>
            <Link 
              href="/cajero/bebidas" 
              className="text-[#2a4d8f] text-sm font-semibold mb-4 flex items-center gap-2 hover:underline w-fit"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Cambiar categoría de bebida
            </Link>
            
            <h1 className="text-[32px] font-bold text-[#2d2a26] mb-1 capitalize">
              Elige tu tipo de {tipo}
            </h1>
            <p className="text-[#8a8580] text-sm md:text-base">
              Selecciona la opción de tu preferencia.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-[#2d2a26] mt-2 uppercase">
            {tipo}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {opcionesActivas.map((opcion) => (
              <EnvaseCard
                key={opcion.id}
                titulo={opcion.titulo}
                descripcion={opcion.descripcion}
                nota={opcion.nota}
                imagen={opcion.imagen}
                onSelect={() => router.push(`/cajero/caja?producto=${encodeURIComponent(opcion.titulo)}`)}
              />
            ))}
          </div>

          <div className="h-9 w-full shrink-0" aria-hidden="true" />
        </div>
      </section>

      <aside className="w-full lg:w-[380px] xl:w-[420px] shrink-0 border-t lg:border-t-0 lg:border-l border-gray-200 bg-white">
        <CuentasAbiertas pedidos={[]} />
      </aside>
      
    </div>
  );
}

export default function VariantesBebidasPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#8a8580]">Cargando opciones...</div>}>
      <VariantesBebidasContent />
    </Suspense>
  );
}