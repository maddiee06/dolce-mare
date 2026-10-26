import React from "react";

interface Props {
  estado: "disponible" | "stock_bajo" | "agotado" | string;
}

export default function EstadoStockBadge({ estado }: Props) {
  // Definimos los colores y textos según el estado
  const config = {
    disponible: {
      etiqueta: "Disponible",
      clases: "bg-exito-fondo text-exito-texto border-exito-borde",
    },
    stock_bajo: {
      etiqueta: "Stock Bajo",
      clases: "bg-advertencia-fondo text-advertencia-texto border-advertencia-borde",
    },
    agotado: {
      etiqueta: "Agotado",
      clases: "bg-error-fondo text-error-texto border-error-borde",
    },
  };

  // Si llega un estado que no reconocemos, usamos un gris neutral por defecto
  const estilo = config[estado as keyof typeof config] || {
    etiqueta: estado || "Desconocido",
    clases: "bg-superficie-hover text-texto-mutado border-borde-gris",
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${estilo.clases}`}
    >
      {estilo.etiqueta}
    </span>
  );
}
