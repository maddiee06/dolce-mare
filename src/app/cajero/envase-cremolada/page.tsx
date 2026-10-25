"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FlujoPasos } from "../../../components/cajero/FlujoPasos";
import { EnvaseCard } from "../../../components/cajero/ProductosCard";
import { CuentasAbiertas } from "../../../components/cajero/CuentasAbiertas";

const opcionesEnvaseCremolada = [
  {
    id: 1,
    titulo: "Pequeño",
    slug: "pequeno", 
    descripcion: "Cómodo para disfrutar sin prisa.",
    nota: "240 ml · Envase incluido",
    imagen: "/envase/envasecremolada.jpg",
  },
  {
    id: 2,
    titulo: "1/2 Litro",
    slug: "medio-litro", 
    descripcion: "Cómodo para disfrutar sin prisa.",
    nota: "500 ml · Envase incluido",
    imagen: "/envase/envasemedioL.jpg",
  },
  {
    id: 3,
    titulo: "1 Litro",
    slug: "litro", 
    descripcion: "Cómodo para disfrutar sin prisa.",
    nota: "1000 ml · Envase incluido",
    imagen: "/envase/envaseLitro.jpg",
  },
];

export default function EnvaseCremoladaPage() {
  const router = useRouter();

  const manejarSeleccionEnvase = (slugEnvase: string) => {
    router.push(`/cajero/cantidad-sabores-cremolada?envase=${slugEnvase}`);
  };

  return (
    <div className="flex flex-col lg:flex-row w-full h-full min-h-[calc(100vh-65px)] bg-[#FAF8F5] overflow-y-auto lg:overflow-hidden">
      
      <section className="flex-1 flex justify-center p-4 md:p-8 overflow-y-auto">
        <div className="w-full max-w-[900px] flex flex-col gap-6">
          
          <div>
            <Link 
              href="/cajero" 
              className="text-[#2a4d8f] text-sm font-semibold mb-4 flex items-center gap-2 hover:underline w-fit"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Volver a categorías
            </Link>
            
            <h1 className="text-[32px] font-bold text-[#2d2a26] mb-1">
              Elige tu envase
            </h1>
            <p className="text-[#8a8580] text-sm md:text-base">
              Cremoladas artesanales · La misma frescura, a tu manera.
            </p>
          </div>

          <div className="py-2">
            <FlujoPasos pasoActual={2} />
          </div>

          <h2 className="text-2xl font-bold text-[#2d2a26] mt-2">
            CREMOLADAS
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {opcionesEnvaseCremolada.map((envase) => (
              <EnvaseCard
                key={envase.id}
                titulo={envase.titulo}
                descripcion={envase.descripcion}
                nota={envase.nota}
                imagen={envase.imagen}
                onSelect={() => manejarSeleccionEnvase(envase.slug)} 
              />
            ))}
          </div>

          <div className="h-9 w-full shrink-0" aria-hidden="true" />
        </div>
      </section>

      <aside className="w-full lg:w-[380px] xl:w-[420px] shrink-0 border-t lg:border-t-0 lg:border-l border-gray-200 bg-white">
        {/* Pasamos un arreglo vacío en lugar de datos estáticos */}
        <CuentasAbiertas pedidos={[]} />
      </aside>
      
    </div>
  );
}