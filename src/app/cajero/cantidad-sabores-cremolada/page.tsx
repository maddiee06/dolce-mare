"use client";
import React, { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FlujoPasos } from "../../../components/cajero/FlujoPasos";
import { SaboresCard } from "../../../components/cajero/SaboresCard";
import { CuentasAbiertas } from "../../../components/cajero/CuentasAbiertas";

function CantidadSaboresCremoladaContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const envase = searchParams.get("envase") || "pequeno";

  // Generamos las opciones dinámicamente basándonos en la carta física
  const obtenerOpcionesCremolada = () => {
    if (envase === "pequeno") {
      return [
        { id: 1, titulo: "Clásico", descripcion: "Refrescante y natural", precio: 6.00, capacidadMl: "Pequeño", imagen: "/saboresCremolada/1SaborC.jpg" },
        { id: 2, titulo: "Especial", descripcion: "Sabores exclusivos", precio: 8.00, capacidadMl: "Pequeño", imagen: "/saboresCremolada/CEspecialPequeña.jpg" },
      ];
    }
    if (envase === "medio-litro") {
      return [
        { id: 3, titulo: "Clásico", descripcion: "Refrescante y natural", precio: 13.00, capacidadMl: "500 ml", imagen: "/saboresCremolada/CClasicaMediano.jpg" },
        { id: 4, titulo: "Especial", descripcion: "Sabores exclusivos", precio: 18.00, capacidadMl: "500 ml", imagen: "/saboresCremolada/CEspecialMediano.jpg" },
      ];
    }
    if (envase === "litro") {
      return [
        { id: 5, titulo: "Clásico", descripcion: "Refrescante y natural", precio: 24.00, capacidadMl: "1000 ml", imagen: "/saboresCremolada/CClasicaMediano.jpg" },
        { id: 6, titulo: "Especial", descripcion: "Sabores exclusivos", precio: 30.00, capacidadMl: "1000 ml", imagen: "/saboresCremolada/CEspecialMediano.jpg" },
      ];
    }
    return [];
  };

  const opcionesActivas = obtenerOpcionesCremolada();

  return (
    <div className="flex flex-col lg:flex-row w-full h-full min-h-[calc(100vh-65px)] bg-[#FAF8F5] overflow-y-auto lg:overflow-hidden">
      <section className="flex-1 flex justify-center p-4 md:p-8 overflow-y-auto">
        <div className="w-full max-w-[900px] flex flex-col gap-6">
          
          <div>
            <Link 
              href="/cajero/envase-cremolada" 
              className="text-[#2a4d8f] text-sm font-semibold mb-4 flex items-center gap-2 hover:underline w-fit"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Cambiar cantidad
            </Link>
            
            <h1 className="text-[32px] font-bold text-[#2d2a26] mb-1">
              Elige tu categoría
            </h1>
            <p className="text-[#8a8580] text-sm md:text-base capitalize">
              Cremolada en {envase.replace("-", " ")} · Clásica o Especial.
            </p>
          </div>

          <div className="py-2">
            <FlujoPasos pasoActual={3} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 lg:gap-6 max-w-2xl">
            {opcionesActivas.map((opcion) => (
              <SaboresCard
                key={opcion.id}
                titulo={opcion.titulo}
                descripcion={opcion.descripcion}
                precio={opcion.precio}
                capacidadMl={opcion.capacidadMl}
                imagen={opcion.imagen}
                onSelect={() => router.push(`/cajero/caja?producto=${encodeURIComponent(opcion.titulo)}&precio=${opcion.precio}`)}
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

export default function CantidadSaboresCremoladaPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#8a8580]">Cargando opciones...</div>}>
      <CantidadSaboresCremoladaContent />
    </Suspense>
  );
}