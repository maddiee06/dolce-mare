"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FlujoPasos } from "../../../components/cajero/FlujoPasos";
import { EnvaseCard } from "../../../components/cajero/ProductosCard";
import { CuentasAbiertas } from "../../../components/cajero/CuentasAbiertas";
// Tus datos de envases

const opcionesEnvase = [
  {
    id: 1,
    titulo: "Vaso",
    descripcion: "Cómodo para disfrutar sin prisa.",
    nota: "240 ml · Envase incluido",
    imagen: "/envase/envasecremolada.jpg",
  },
  {
    id: 2,
    titulo: "Cono",
    descripcion: "Crujiente hasta el último bocado.",
    nota: "Cono artesanal · Sin costo extra",
    imagen: "/envase/conohelado.jpg",
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
  }
];

export default function EnvasePage() {

  const [cantidadCono, setCantidadCono] = useState(0);

  const incrementar = () => setCantidadCono(c => c + 1);
  const decrementar = () => setCantidadCono(c => Math.max(0, c - 1)); //inicializa en 0 y no permite negativo made

  return (
    
    <div className="flex flex-col lg:flex-row w-full h-full min-h-[calc(100vh-65px)] bg-[#FAF8F5] overflow-y-auto lg:overflow-hidden">
      
      {}
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
        Helados artesanales · La misma cremosidad, a tu manera.
      </p>
    </div>

    {/* Flujo Pasos */}
    <div className="py-2">
      <FlujoPasos pasoActual={2} />
    </div>

    <h2 className="text-2xl font-bold text-[#2d2a26] mt-2">
      HELADOS
    </h2>

    {/* Tarjetas de Envase */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
      {opcionesEnvase.map((envase) => (
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

    {/* SECCIÓN: CONO ADICIONAL */}
    <div className="bg-white rounded-2xl p-5 border border-transparent hover:border-[#fbe8dd] transition-colors shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
      <div className="flex items-center gap-4">
        <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
          <Image 
            src="/conohelado.jpg" 
            alt="Cono extra" 
            fill 
            className="object-cover" 
          />
        </div>
        <div>
          <h3 className="text-[#2a4d8f] font-bold text-lg">Cono adicional</h3>
          <p className="text-[#8a8580] text-sm">
            Agrega otro cono artesanal a tu pedido por <span className="text-[#2d2a26] font-medium">+ S/ 1.00</span>.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-end gap-3 shrink-0">
        <span className="bg-[#fbe8dd] text-[#e8956b] font-bold text-sm px-3 py-1 rounded-full">
           + S/ {(cantidadCono * 1).toFixed(2)}
        </span>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-50 rounded-full border border-gray-200 p-1">
            <button onClick={decrementar} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
              -
            </button>
            <span className="w-6 text-center font-medium text-[#2d2a26]">{cantidadCono}</span>
            <button onClick={incrementar} className="w-8 h-8 rounded-full flex items-center justify-center bg-[#fbe8dd] text-[#e8956b] hover:bg-[#e8956b] hover:text-white transition-colors">
              +
            </button>
          </div>
          <button className="bg-[#fbe8dd] text-[#e8956b] font-semibold px-4 py-2 rounded-full hover:bg-[#e8956b] hover:text-white transition-colors text-sm">
            {cantidadCono > 0 ? "Agregado" : "Agregar"}
          </button>
        </div>
      </div>
    </div>

    {/* ESTA LÍNEA CREA EL ESPACIO FÍSICO AL FINAL DEL SCROLL */}
    <div className="h-9 w-full shrink-0" aria-hidden="true" />

  </div>
</section>

      {}
      {}
      <aside className="w-full lg:w-[380px] xl:w-[420px] shrink-0 border-t lg:border-t-0 lg:border-l border-gray-200 bg-white">
        <CuentasAbiertas pedidos={PEDIDOS_INICIALES} />
      </aside>
      
    </div>
  );
}