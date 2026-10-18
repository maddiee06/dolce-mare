"use client";
import React from "react";
import styles from "./ConfirmarSedeModal.module.scss";

export type ConfirmarSedeModalProps = {
  isOpen: boolean;
  sedeNombre: string;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmarSedeModal: React.FC<ConfirmarSedeModalProps> = ({
  isOpen,
  sedeNombre,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center px-4 ${styles.backdrop}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmar-sede-titulo"
    >
      <div
        className={`bg-white rounded-md max-w-sm w-full overflow-hidden ${styles.modalCard}`}
      >
        {/* Barra de acento de marca */}
        <div className="h-1 bg-[#1a3f7a]" />

        <div className="px-7 pt-7 pb-6">
          <p className="text-[11px] font-medium tracking-wider text-[#d85a30] uppercase mb-1.5">
            Confirmar sucursal
          </p>
          <h2
            id="confirmar-sede-titulo"
            className="text-lg font-medium text-slate-900 mb-3.5"
          >
            ¿Trabajar en esta sede?
          </h2>

          <div className="border-l-[3px] border-[#1a3f7a] pl-3.5 py-0.5 mb-4">
            <p className="text-[15px] font-medium text-[#1a3f7a] m-0">
              {sedeNombre}
            </p>
            <p className="text-xs text-slate-400 mt-1 m-0">
              Vas a iniciar tu turno aquí
            </p>
          </div>

          <p className="text-[13px] text-slate-500 leading-relaxed mb-5">
            Verifica que sea la sucursal correcta. No podrás cambiarla una vez
            que inicies.
          </p>

          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-md border border-slate-200 text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex-1 py-2.5 rounded-md border-none bg-[#1a3f7a] text-[13px] font-medium text-white hover:bg-[#15335f] transition cursor-pointer"
            >
              Confirmar e ingresar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmarSedeModal;
