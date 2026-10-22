"use client";
import React from "react";
import Link from "next/link";
import { FlujoPasos } from "../../../components/cajero/FlujoPasos";
import { EnvaseCard } from "../../../components/cajero/ProductosCard";
import { CuentasAbiertas } from "../../../components/cajero/CuentasAbiertas";

const opcionesEnvaseCremolada = [
  {
    id: 1,
    titulo: "Pequeño",
    descripcion: "Cómodo para disfrutar sin prisa.",
    nota: "240 ml · Envase incluido",
    imagen: "/envase/envasecremolada.jpg",
  },
  {
    id: 2,
    titulo: "1/2 Litro",
    descripcion: "Cómodo para disfrutar sin prisa.",
    nota: "500 ml · Envase incluido",
    imagen: "/envase/envasemedioL.jpg",
  },
  {
    id: 3,
    titulo: "1 Litro",
    descripcion: "Cómodo para disfrutar sin prisa.",
    nota: "1000 ml · Envase incluido",
    imagen: "/envase/envaseLitro.jpg",
  },
];

const PEDIDOS_INICIALES = [
  {
    id_pedido: 101,
    total: 28.5,
    fecha_pedido: "2026-10-18T16:37:00.000Z",
    estado: { nombre: "Abierto" },
    entrega: { nombre: "Mesa 3" },
    detalle_pedido: [
      { cantidad: 2, productos: { nombre: "Helado Artesanal Doble" } },
      { cantidad: 1, productos: { nombre: "Cremolada de Mango" } },
    ],
  },
];

export default function EnvaseCremoladaPage() {
  return (
    <div className="flex flex-col lg:flex-row w-full h-full min-h-[calc(100vh-65px)] bg-[#FAF8F5] overflow-y-auto lg:overflow-hidden">
      
      <section className="flex-1 flex justify-center p-4 md:p-8 overflow-y-auto">
        <div className="w-full max-w-[900px] flex flex-col gap-6">
          
          {/* Enlace volver */}
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

          {/* Flujo Pasos */}
          <div className="py-2">
            <FlujoPasos pasoActual={2} />
          </div>

          <h2 className="text-2xl font-bold text-[#2d2a26] mt-2">
            CREMOLADAS
          </h2>

          {/* Tarjetas de Envase en 3 columnas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
  {opcionesEnvaseCremolada.map((envase) => (
    <EnvaseCard
      key={envase.id}
      titulo={envase.titulo}
      descripcion={envase.descripcion}
      nota={envase.nota}
      imagen={envase.imagen}
      onSelect={() => console.log(`Seleccionado: ${envase.titulo}`)}
    />
  ))}
</div>

          <div className="h-9 w-full shrink-0" aria-hidden="true" />

        </div>
      </section>

      <aside className="w-full lg:w-[380px] xl:w-[420px] shrink-0 border-t lg:border-t-0 lg:border-l border-gray-200 bg-white">
        <CuentasAbiertas pedidos={PEDIDOS_INICIALES} />
      </aside>
      
    </div>
  );
}