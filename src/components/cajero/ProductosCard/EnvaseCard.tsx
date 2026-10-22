import React from "react";
import Image from "next/image";

interface EnvaseCardProps {
  titulo: string;
  descripcion: string;
  nota: string;
  imagen: string;
  onSelect?: () => void;
}

export const EnvaseCard: React.FC<EnvaseCardProps> = ({
  titulo,
  descripcion,
  nota,
  imagen,
  onSelect,
}) => {
  return (
    <div
      onClick={onSelect}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100 flex flex-col h-full justify-between"
    >
      {/* Contenedor de Imagen con altura fija proporcional */}
      <div className="relative w-full h-44 bg-[#f8f1e9]">
        <Image
          src={imagen}
          alt={titulo}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      {/* Contenedor de Texto y Footer */}
      <div className="p-4 flex flex-col flex-grow justify-between gap-3">
        <div>
          <h3 className="text-[#2a4d8f] font-bold text-lg mb-1">{titulo}</h3>
          <p className="text-gray-500 text-sm leading-snug">{descripcion}</p>
        </div>

        {/* Footer de la tarjeta con margen superior automático */}
        <p className="text-xs text-gray-400 font-normal mt-auto pt-1">
          {nota}
        </p>
      </div>
    </div>
  );
};