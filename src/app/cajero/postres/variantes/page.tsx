"use client";
import React, { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { EnvaseCard } from "../../../../components/cajero/ProductosCard";
import { CuentasAbiertas } from "../../../../components/cajero/CuentasAbiertas";

function VariantesPostresContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tipo = searchParams.get("tipo") || "tiramisu";

  // Opciones con los precios y notas adaptadas para EnvaseCard
  const obtenerVariantes = () => {
    if (tipo === "tiramisu") {
      return [
        { id: 1, titulo: "Tiramisú Clásico", descripcion: "Tradicional con café y cacao.", nota: "S/ 18.00 · Porción", imagen: "/postres/clasicotiramisu.jpg" },
        { id: 2, titulo: "Tiramisú de Pistacho", descripcion: "Exquisita crema de pistacho.", nota: "S/ 22.00 · Porción", imagen: "/postres/pistacciotiramisu.jpg" },
      ];
    }
    if (tipo === "cheesecake") {
      return [
        { id: 3, titulo: "Cheesecake de Maracuyá", descripcion: "Topping de maracuyá fresco.", nota: "S/ 22.00 · Porción", imagen: "/postres/chessecakemaracuya.jpg" },
        { id: 4, titulo: "Cheesecake de Frambuesa", descripcion: "Reducción de frambuesas silvestres.", nota: "S/ 22.00 · Porción", imagen: "/postres/chessecakeframbuesa.jpg" },
      ];
    }
    if (tipo === "brownies") {
      return [
        { id: 5, titulo: "Brownie Clásico", descripcion: "Húmedo con fudge de chocolate.", nota: "S/ 6.00 · Unidad", imagen: "/postres/brownieclasico.jpg" },
        { id: 6, titulo: "Brownie Especial", descripcion: "Relleno de manjar y nueces.", nota: "S/ 8.00 · Unidad", imagen: "/postres/brownieespecial.jpg" },
      ];
    }
    return [];
  };

  const opcionesActivas = obtenerVariantes();

  return (
    <div className="flex flex-col lg:flex-row w-full h-full min-h-[calc(100vh-65px)] bg-[#FAF8F5] overflow-y-auto lg:overflow-hidden">
      
      <section className="flex-1 flex justify-center p-4 md:p-8 overflow-y-auto">
        <div className="w-full max-w-[900px] flex flex-col gap-6">
          
          <div>
            <Link 
              href="/cajero/postres" 
              className="text-[#2a4d8f] text-sm font-semibold mb-4 flex items-center gap-2 hover:underline w-fit"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Cambiar postre
            </Link>
            
            <h1 className="text-[32px] font-bold text-[#2d2a26] mb-1 capitalize">
              Elige tus sabores favoritos de {tipo}
            </h1>
            <p className="text-[#8a8580] text-sm md:text-base">
              Selecciona la opción de tu preferencia.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-[#2d2a26] mt-2 uppercase">
            {tipo}
          </h2>

          {/* Grid con las mismas proporciones de 3 columnas (o 2 según prefieras) */}
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

export default function VariantesPostresPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#8a8580]">Cargando opciones...</div>}>
      <VariantesPostresContent />
    </Suspense>
  );
}