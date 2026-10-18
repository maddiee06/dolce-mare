"use client";

import React from "react";
import Image from "next/image";

const categorias = [
  {
    id: 1,
    titulo: "Helados",
    descripcion: "+20 sabores artesanales",
    precio: "9.00",
    imagen: "/categorias/heladito.jpg",
  },
  {
    id: 2,
    titulo: "Cremoladas",
    descripcion: "Fruta fresca, puro sabor",
    precio: "6.00",
    imagen: "/categorias/cremolada.jpg",
  },
  {
    id: 3,
    titulo: "Postres",
    descripcion: "Pequeños grandes antojos",
    precio: "20.00",
    imagen: "/categorias/postres.jpg",
  },
  {
    id: 4,
    titulo: "Bebidas",
    descripcion: "El complemento perfecto",
    precio: "5.00",
    imagen: "/categorias/bebidas.jpg",
  },
];

// 3. RECIBIR LA PROPIEDAD 'imagen' EN EL COMPONENTE
const CategoriaCard = ({
  titulo,
  descripcion,
  precio,
  imagen,
}: {
  titulo: string;
  descripcion: string;
  precio: string;
  imagen: string;
}) => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100 flex flex-col">
      {/* 4. REEMPLAZAR EL ESPACIO GRIS POR LA IMAGEN DE NEXT.JS */}
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
      <div className="flex items-center space-x-2 md:space-x-4 text-xs md:text-sm mb-8 overflow-x-auto pb-2">
        <div className="flex items-center text-[#3b4b86] font-bold whitespace-nowrap">
          <span className="bg-orange-200 text-orange-700 rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2">
            01
          </span>
          Categoría
        </div>
        <span className="text-gray-300 font-bold">&gt;</span>
        <div className="text-gray-400 font-medium whitespace-nowrap">
          02 Envase
        </div>
        <span className="text-gray-300 font-bold">&gt;</span>
        <div className="text-gray-400 font-medium whitespace-nowrap">
          03 Cantidad
        </div>
        <span className="text-gray-300 font-bold">&gt;</span>
        <div className="text-gray-400 font-medium whitespace-nowrap">
          04 Sabores
        </div>
      </div>

      {/* Grid de Tarjetas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        {categorias.map((categoria) => (
          <CategoriaCard
            key={categoria.id}
            titulo={categoria.titulo}
            descripcion={categoria.descripcion}
            precio={categoria.precio}
            imagen={categoria.imagen} // <-- NO OLVIDES PASAR LA IMAGEN AQUÍ TAMBIÉN
          />
        ))}
      </div>
    </div>
  );
}
