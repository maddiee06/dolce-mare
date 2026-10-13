"use client";

import React from 'react';

const categorias = [
  {
    id: 1,
    titulo: 'Helados',
    descripcion: '+20 sabores artesanales',
    precio: '9.00'
  },
  {
    id: 2,
    titulo: 'Cremoladas',
    descripcion: 'Fruta fresca, puro sabor',
    precio: '6.00'
  },
  {
    id: 3,
    titulo: 'Postres',
    descripcion: 'Pequeños grandes antojos',
    precio: '20.00'
  },
  {
    id: 4,
    titulo: 'Bebidas',
    descripcion: 'El complemento perfecto',
    precio: '5.00'
  }
];

const CategoriaCard = ({ titulo, descripcion, precio }: { titulo: string, descripcion: string, precio: string }) => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100 flex flex-col">
      
      {/* Espacio temporal en lugar de la imagen */}
      <div className="w-full h-40 bg-gray-100 flex items-center justify-center">
        <span className="text-gray-400 text-sm">Imagen pendiente</span>
      </div>

      <div className="p-4 flex flex-col flex-grow justify-between">
        <div className="flex justify-between items-baseline mb-1">
          <h3 className="text-[#3b4b86] font-bold text-lg">{titulo}</h3>
          <span className="text-gray-400 text-xs font-medium">Desde S/ {precio}</span>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-gray-500 text-sm">{descripcion}</p>
          <svg className="w-4 h-4 text-[#3b4b86]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" />
          </svg>
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
        <div className="text-gray-400 font-medium whitespace-nowrap">02 Envase</div>
        <span className="text-gray-300 font-bold">&gt;</span>
        <div className="text-gray-400 font-medium whitespace-nowrap">03 Cantidad</div>
        <span className="text-gray-300 font-bold">&gt;</span>
        <div className="text-gray-400 font-medium whitespace-nowrap">04 Sabores</div>
      </div>

      {/* Grid de Tarjetas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        {categorias.map((categoria) => (
          <CategoriaCard 
            key={categoria.id}
            titulo={categoria.titulo}
            descripcion={categoria.descripcion}
            precio={categoria.precio}
          />
        ))}
      </div>
      
    </div>
  );
}