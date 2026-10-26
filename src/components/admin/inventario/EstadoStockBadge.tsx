import React from "react";

interface Props {
  estado: "disponible" | "stock_bajo" | "agotado" | string;
}

export default function EstadoStockBadge({ estado }: Props) {
  // Definimos los colores y textos según el estado
  const config = {
    disponible: {
      etiqueta: "Disponible",
      clases: "bg-emerald-100 text-emerald-800 border-emerald-200",
    },
    stock_bajo: {
      etiqueta: "Stock Bajo",
      clases: "bg-amber-100 text-amber-800 border-amber-200",
    },
    agotado: {
      etiqueta: "Agotado",
      clases: "bg-rose-100 text-rose-800 border-rose-200",
    },
  };

  // Si llega un estado que no reconocemos, usamos un gris neutral por defecto
  const estilo = config[estado as keyof typeof config] || {
    etiqueta: estado || "Desconocido",
    clases: "bg-gray-100 text-gray-700 border-gray-200",
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${estilo.clases}`}
    >
      {estilo.etiqueta}
    </span>
  );
}
