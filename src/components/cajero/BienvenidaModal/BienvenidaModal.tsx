"use client";
import React from "react";
import styles from "./BienvenidaModal.module.scss";

export type BienvenidaModalProps = {
  isOpen: boolean;
  userName: string;
  onEntendido: () => void;
};

const pasos = [
  {
    titulo: "Navega por las pestañas",
    descripcion:
      "Revisa Caja, Pendientes, Historial e Inventario para familiarizarte con el panel.",
  },
  {
    titulo: "Revisa el stock de productos",
    descripcion:
      "Confirma que los productos disponibles coincidan con lo que tienes físicamente.",
  },
  {
    titulo: "Abre tu caja",
    descripcion:
      "Cuando estés lista, haz clic en el botón de abrir caja para iniciar tu turno.",
  },
];

const BienvenidaModal: React.FC<BienvenidaModalProps> = ({
  isOpen,
  userName,
  onEntendido,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center px-4 ${styles.backdrop}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="bienvenida-titulo"
    >
      <div
        className={`bg-white rounded-lg shadow-2xl max-w-md w-full relative overflow-hidden ${styles.modalCard}`}
      >
        <div className="h-1.5 bg-[#1B3E7A] w-full" />

        <div className="p-8 pt-7">
          <span className="text-[11px] font-bold tracking-wider text-[#D84B20] block mb-1">
            INICIO DE TURNO
          </span>
          <h2
            id="bienvenida-titulo"
            className="text-[22px] font-semibold text-[#1F1F1F] leading-tight tracking-tight mb-1"
          >
            Bienvenida, {userName}
          </h2>
          <p className="text-sm text-[#7D7D7D] font-normal mb-8 leading-normal">
            Antes de empezar tu turno, sigue estos pasos
          </p>

          <ol className="flex flex-col mb-8 list-none p-0 m-0">
            {pasos.map((paso, index) => {
              const numero = String(index + 1).padStart(2, "0");
              const esUltimo = index === pasos.length - 1;
              const esActivo = index === 2;

              return (
                <li
                  key={paso.titulo}
                  className={`flex items-start gap-5 py-5 first:pt-0 ${!esUltimo ? "border-b border-[#F0F0F0]" : "pb-0"}`}
                >
                  <span
                    className={`text-[25px] font-medium leading-[25px] tracking-tight shrink-0 select-none ${esActivo ? "text-[#1B3E7A]" : "text-[#D0D0D0]"}`}
                  >
                    {numero}
                  </span>
                  <div className="flex flex-col">
                    <h3 className="text-sm font-semibold text-[#1F1F1F] leading-[22px] m-0">
                      {paso.titulo}
                    </h3>
                    <p className="text-xs text-[#525252] mt-1 leading-[18px]">
                      {paso.descripcion}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>

          <button
            type="button"
            onClick={onEntendido}
            className="w-full py-3.5 px-4 rounded-lg text-sm font-semibold text-white bg-[#1B407E] hover:bg-[#153263] active:bg-[#0F2447] transition-colors duration-150 cursor-pointer text-center"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default BienvenidaModal;
