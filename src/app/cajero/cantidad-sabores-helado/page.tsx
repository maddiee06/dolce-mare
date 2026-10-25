"use client";
import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FlujoPasos } from "../../../components/cajero/FlujoPasos";
import { SaboresCard } from "../../../components/cajero/SaboresCard";
import { CuentasAbiertas } from "../../../components/cajero/CuentasAbiertas";

function CantidadSaboresHeladoContent() {
  const searchParams = useSearchParams();
  const envase = searchParams.get("envase") || "vaso";

  // Generamos las opciones dinámicamente basándonos en la carta física
  const obtenerOpcionesHelado = () => {
    if (envase === "vaso" || envase === "cono") {
      return [
        { id: 1, titulo: "1 Bola Clásico", descripcion: "1 sabor tradicional", precio: 9.00, capacidadMl: "Vaso/Cono", imagen: "/saboresHelado/1Sabor.jpg" },
        { id: 2, titulo: "1 Bola Premium", descripcion: "1 sabor especial", precio: 12.00, capacidadMl: "Vaso/Cono", imagen: "/saboresHelado/1BolaPremium.jpg" },
        { id: 3, titulo: "2 Bolas Clásico", descripcion: "Elige 2 sabores", precio: 15.00, capacidadMl: "Vaso/Cono", imagen: "/saboresHelado/2BolasClasicas.jpg" },
        { id: 4, titulo: "2 Bolas Premium", descripcion: "Elige 2 sabores", precio: 17.00, capacidadMl: "Vaso/Cono", imagen: "/saboresHelado/2Sabores.jpg" },
      ];
    }
    if (envase === "medio-litro") {
      return [
        { id: 5, titulo: "1/2 Litro Clásico", descripcion: "Sabores tradicionales", precio: 30.00, capacidadMl: "500 ml", imagen: "/saboresHelado/+3BolasClasicos.jpg" },
        { id: 6, titulo: "1/2 Litro Premium", descripcion: "Sabores especiales", precio: 34.00, capacidadMl: "500 ml", imagen: "/saboresHelado/+3BolasPremium.jpg" },
      ];
    }
    if (envase === "litro") {
      return [
        { id: 7, titulo: "1 Litro Clásico", descripcion: "Sabores tradicionales", precio: 58.00, capacidadMl: "1000 ml", imagen: "/saboresHelado/+3BolasClasicos.jpg" },
        { id: 8, titulo: "1 Litro Premium", descripcion: "Sabores especiales", precio: 64.00, capacidadMl: "1000 ml", imagen: "/saboresHelado/+3BolasPremium.jpg" },
      ];
    }
    return [];
  };

  const opcionesActivas = obtenerOpcionesHelado();

  return (
    <div className="flex flex-col lg:flex-row w-full h-full min-h-[calc(100vh-65px)] bg-[#FAF8F5] overflow-y-auto lg:overflow-hidden">
      <section className="flex-1 flex justify-center p-4 md:p-8 overflow-y-auto">
        <div className="w-full max-w-[900px] flex flex-col gap-6">
          
          <div>
            <Link 
              href="/cajero/envase-helado" 
              className="text-[#2a4d8f] text-sm font-semibold mb-4 flex items-center gap-2 hover:underline w-fit"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Cambiar envase
            </Link>
            
            <h1 className="text-[32px] font-bold text-[#2d2a26] mb-1">
              Elige tu categoría
            </h1>
            <p className="text-[#8a8580] text-sm md:text-base capitalize">
              Helado en {envase.replace("-", " ")} · Clásico o Premium.
            </p>
          </div>

          <div className="py-2">
            <FlujoPasos pasoActual={3} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {opcionesActivas.map((opcion) => (
              <SaboresCard
                key={opcion.id}
                titulo={opcion.titulo}
                descripcion={opcion.descripcion}
                precio={opcion.precio}
                capacidadMl={opcion.capacidadMl}
                imagen={opcion.imagen}
                onSelect={() => console.log(`Seleccionado: ${opcion.titulo}`)}
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

export default function CantidadSaboresHeladoPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#8a8580]">Cargando opciones...</div>}>
      <CantidadSaboresHeladoContent />
    </Suspense>
  );
}