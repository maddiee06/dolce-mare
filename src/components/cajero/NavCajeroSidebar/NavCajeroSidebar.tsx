"use client";
import React, { useEffect } from "react";
import styles from "./NavCajeroSidebar.module.scss";
import { RolNombre } from "../../../models/Usuario";

export type NavCajeroSidebarProps = {
  isOpen?: boolean;
  onClose: () => void;
  avatarUrl?: string;
  userName: string;
  userRole: RolNombre;
};

const NavCajeroSidebar: React.FC<NavCajeroSidebarProps> = ({
  isOpen = false,
  onClose,
  avatarUrl = "/avatar.png",
  userName = "Usuario",
  userRole = "Cajero",
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Fondo oscuro */}
      <div
        className={`${styles.backdrop} ${isOpen ? styles.backdropActive : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel lateral deslizante */}
      <aside
        className={`${styles.sidebarContainer} ${isOpen ? styles.sidebarOpen : ""}`}
        aria-hidden={!isOpen}
      >
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-7 right-6 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-black/5 transition cursor-pointer"
          aria-label="Cerrar menú"
        >
          <img src="/nav/close.svg" alt="Caja" width={20} height={20} />
        </button>

        {/* Cabecera: Avatar, Usuario, Sede y Estado */}
        <div className="pt-8 px-6 pb-6 pr-14 border-b border-stone-200/100">
          <div className="flex items-start gap-3.5">
            <div className="relative w-12 h-12 shrink-0">
              <img
                className={`w-12 h-12 rounded-full object-cover border ${styles.avatarImg}`}
                src={avatarUrl}
                alt={`Avatar de ${userName || "Cajero"}`}
              />
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs ${styles.cajaIndicator}`}
              />
            </div>

            <div className="flex flex-col min-w-0">
              <h3
                className={`text-base font-bold tracking-tight truncate m-0 leading-tight ${styles.userName}`}
              >
                {userName}
              </h3>
              <p
                className={`text-xs font-medium m-0 mt-0.5 leading-tight ${styles.userRole}`}
              >
                {userRole}
              </p>

              {/* Sede y Estado */}
              <div className="flex items-center gap-1.5 mt-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${styles.sedeBadge}`}
                >
                  Miraflores
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${styles.cajaBadge}`}
                >
                  Caja Abierta
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Secciones: Opciones principales y Ajustes */}
        <div className="p-3 flex-1 flex flex-col justify-between overflow-y-auto">
          <nav className="space-y-1">
            <button
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-base font-bold transition-all text-left cursor-pointer ${styles.navBtnActive}`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-1.5 h-4 rounded-full ${styles.activeIndicator}`}
                />
                <span className="w-5 h-5 flex items-center justify-center text-current opacity-80" />
                <span>Caja</span>
              </div>
            </button>

            <button
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium transition-all text-left cursor-pointer hover:bg-black/5 ${styles.navBtnInactive}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-4 rounded-full opacity-0" />
                <span className="w-5 h-5 flex items-center justify-center text-current opacity-70" />
                <span>Pendientes</span>
              </div>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${styles.countBadge}`}
              >
                3
              </span>
            </button>

            <button
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium transition-all text-left cursor-pointer hover:bg-black/5 ${styles.navBtnInactive}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-4 rounded-full opacity-0" />
                <span className="w-5 h-5 flex items-center justify-center text-current opacity-70" />
                <span>Historial</span>
              </div>
            </button>

            <button
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium transition-all text-left cursor-pointer hover:bg-black/5 ${styles.navBtnInactive}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-4 rounded-full opacity-0" />
                <span className="w-5 h-5 flex items-center justify-center text-current opacity-70" />
                <span>Inventario</span>
              </div>
            </button>
          </nav>

          <div className="pt-3 pb-2 border-t border-stone-200/100 mt-auto">
            <button
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-base font-medium transition-all text-left cursor-pointer hover:bg-black/5 ${styles.navBtnInactive}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-4 rounded-full opacity-0" />
                <span className="w-5 h-5 flex items-center justify-center text-current opacity-70" />
                <span>Ajustes</span>
              </div>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default NavCajeroSidebar;
