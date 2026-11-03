"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EnvaseCard } from "../../../components/cajero/ProductosCard";
import { CuentasAbiertas } from "../../../components/cajero/CuentasAbiertas";

const bebidasPrincipales = [
  { 
    id: 1, 
    titulo: "Gaseosas", 
    slug: "gaseosas",
    descripcion: "Bebidas heladas sabor tradicional.", 
    nota: "Inka Kola o Coca Cola", 
    imagen: "/bebidas/gaseosas.jpg" 
  },
  { 
    id: 2, 
    titulo: "Agua", 
    slug: "agua",
    descripcion: "Pura y refrescante.", 
    nota: "Sin gas o Con gas", 
    imagen: "/bebidas/aguas.jpg" 
  },
  { 
    id: 3, 
    titulo: "Café", 
    slug: "cafe",
    descripcion: "Café de grano recién pasado.", 
    nota: "Espresso o Americano", 
    imagen: "/bebidas/cafeenvase.jpg" 
  },
  { 
    id: 4, 
    titulo: "Cerveza Artesanal", 
    slug: "cerveza",
    descripcion: "Elaboración artesanal exclusiva.", 
    nota: "Red Ale o Imperial Stout", 
    imagen: "/bebidas/cervezas.jpg" 
  },
];

export default function BebidasPage() {
  const router = useRouter();

  const manejarSeleccionBebida = (slug: string) => {
    router.push(`/cajero/bebidas/variantes?tipo=${slug}`);
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
              ¿Qué bebida servimos?
            </h1>
            <p className="text-[#8a8580] text-sm md:text-base">
              El complemento perfecto para acompañar tu momento.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-[#2d2a26] mt-2 uppercase">
            BEBIDAS
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {bebidasPrincipales.map((bebida) => (
              <EnvaseCard
                key={bebida.id}
                titulo={bebida.titulo}
                descripcion={bebida.descripcion}
                nota={bebida.nota}
                imagen={bebida.imagen}
                onSelect={() => manejarSeleccionBebida(bebida.slug)} 
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