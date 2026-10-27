"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FlujoPasos } from "../FlujoPasos/FlujoPasos";

const categorias = [
  {
    id: 1,
    titulo: "Helados",
    descripcion: "+20 sabores artesanales",
    precio: "9.00",
    imagen: "/categorias/heladito.jpg",
    ruta: "/cajero/envase-helado",
  },
  {
    id: 2,
    titulo: "Cremoladas",
    descripcion: "Fruta fresca, puro sabor",
    precio: "6.00",
    imagen: "/categorias/cremolada.jpg",
    ruta: "/cajero/envase-cremolada",
  },
  {
    id: 3,
    titulo: "Postres",
    descripcion: "Pequeños grandes antojos",
    precio: "20.00",
    imagen: "/categorias/postres.jpg",
    ruta: "/cajero/envase-helado", // Ajusta si agregas ruta de postres luego
  },
  {
    id: 4,
    titulo: "Bebidas",
    descripcion: "El complemento perfecto",
    precio: "5.00",
    imagen: "/categorias/bebidas.jpg",
    ruta: "/cajero/envase-helado", // Ajusta si agregas ruta de bebidas luego
  },
];

const CategoriaCard = ({
  titulo,
  descripcion,
  precio,
  imagen,
  onClick,
}: {
  titulo: string;
  descripcion: string;
  precio: string;
  imagen: string;
  onClick: () => void;
}) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100 flex flex-col active:scale-[0.99]"
    >
      <div className="relative w-full h-40">
        <Image
          src={imagen}
          alt={titulo}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      <div className="p-4 flex flex-col flex-grow justify-between">
        <div className="flex justify-between items-baseline mb-1">
          <h3 className="text-[#3b4b86] font-bold text-lg">{titulo}</h3>
          <span className="text-gray-400 text-xs font-medium">
            Desde S/ {precio}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-gray-500 text-sm">{descripcion}</p>
        </div>
      </div>
    </div>
  );
};

export default function SeleccionCategoria() {
  const router = useRouter();

  return (
    <div className="bg-[#FAF8F5] p-6 md:p-8 rounded-3xl w-full max-w-4xl font-sans">
      {/* Cabecera */}
      <h2 className="text-3xl font-bold text-gray-800 mb-2">
        ¿Qué vamos a servir?
      </h2>
      <p className="text-gray-500 mb-8 text-sm md:text-base">
        Selecciona una categoría para empezar una nueva venta.
      </p>

      {/* Stepper */}
      <div className="mb-8 overflow-x-auto pb-2">
        <FlujoPasos pasoActual={1} />
      </div>

      {/* Grid de Tarjetas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        {categorias.map((categoria) => (
          <CategoriaCard
            key={categoria.id}
            titulo={categoria.titulo}
            descripcion={categoria.descripcion}
            precio={categoria.precio}
            imagen={categoria.imagen} 
            onClick={() => router.push(categoria.ruta)}
          />
        ))}
      </div>

      {/* ESPACIO CONTROLADO AL FINAL */}
      <div className="h-14 w-full shrink-0" aria-hidden="true" />
    </div>
  );
}