"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Store,
  Clock,
  History,
  Package,
  Settings,
  X,
  ShelvingUnit,
} from "lucide-react";
import styles from "./NavCajeroSidebar.module.scss";
import { RolNombre } from "../../../models/Usuario";

export type NavCajeroSidebarProps = {
  isOpen?: boolean;
  onClose: () => void;
  avatarUrl?: string;
  userName: string;
  userRole: RolNombre;
  isCajaAbierta?: boolean;
  pendingCount?: number;
};

const NavCajeroSidebar: React.FC<NavCajeroSidebarProps> = ({
  isOpen = false,
  onClose,
  avatarUrl = "/avatar.png",
  userName = "Usuario",
  userRole = "Cajero",
  isCajaAbierta = false,
  pendingCount = 0,
}) => {
  const pathname = usePathname();

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

  const isActive = (path: string) => pathname === path;

  // Función helper para clases comunes de enlaces en el sidebar
  const getSidebarLinkClasses = (path: string) => {
    const baseClasses =
      "w-full flex items-center justify-between px-4 py-3 rounded-xl text-base transition-all text-left cursor-pointer";
    return `${baseClasses} ${
      isActive(path)
        ? `font-bold ${styles.navBtnActive}`
        : `font-medium hover:bg-black/5 ${styles.navBtnInactive}`
    }`;
  };

  return (
    <>
      <div
        className={`${styles.backdrop} ${isOpen ? styles.backdropActive : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`${styles.sidebarContainer} ${isOpen ? styles.sidebarOpen : ""}`}
        aria-hidden={!isOpen}
      >
        <button
          onClick={onClose}
          className="absolute top-7 right-6 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-black/5 transition cursor-pointer"
          aria-label="Cerrar menú"
        >
          <X size={20} />
        </button>

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
                style={{
                  backgroundColor: isCajaAbierta
                    ? "var(--color-success)"
                    : "#DC2626",
                }}
              />
            </div>

            <div className="flex flex-col min-w-0">
              <h3
                className={`text-base font-bold tracking-tight truncate m-0 leading-tight ${styles.userName}`}
              >
                {userName}
              </h3>
              <p className="text-sm text-gray-500">
                {Number(userRole) === 1 ? "Administrador" : "Cajero"}
              </p>
            </div>
          </div>
        </div>

        <div className="p-3 flex-1 flex flex-col justify-between overflow-y-auto">
          <nav className="space-y-1">
            {/* Opción: Inicio */}
            <Link
              href="/cajero"
              onClick={onClose}
              className={getSidebarLinkClasses("/cajero")}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-1.5 h-4 rounded-full ${isActive("/cajero") ? styles.activeIndicator : "opacity-0"}`}
                />
                <span
                  className={`w-5 h-5 flex items-center justify-center text-current ${isActive("/cajero") ? "opacity-80" : "opacity-70"}`}
                >
                  <Store size={18} strokeWidth={2} />
                </span>
                <span>Inicio</span>
              </div>
            </Link>

            {/* Opción: Caja */}
            <Link
              href="/cajero/caja"
              onClick={onClose}
              className={getSidebarLinkClasses("/cajero/caja")}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-1.5 h-4 rounded-full ${isActive("/cajero/caja") ? styles.activeIndicator : "opacity-0"}`}
                />
                <span
                  className={`w-5 h-5 flex items-center justify-center text-current ${isActive("/cajero/caja") ? "opacity-80" : "opacity-70"}`}
                >
                  <Package size={18} strokeWidth={2} />
                </span>
                <span>Caja</span>
              </div>
            </Link>

            {/* Opción: Pendientes */}
            <Link
              href="/cajero/pendientes"
              onClick={onClose}
              className={getSidebarLinkClasses("/cajero/pendientes")}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-1.5 h-4 rounded-full ${isActive("/cajero/pendientes") ? styles.activeIndicator : "opacity-0"}`}
                />
                <span
                  className={`w-5 h-5 flex items-center justify-center text-current ${isActive("/cajero/pendientes") ? "opacity-80" : "opacity-70"}`}
                >
                  <Clock size={18} strokeWidth={2} />
                </span>
                <span>Pendientes</span>
              </div>
              {pendingCount > 0 && (
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${styles.countBadge}`}
                >
                  {pendingCount}
                </span>
              )}
            </Link>

            {/* Opción: Historial */}
            <Link
              href="/cajero/historial"
              onClick={onClose}
              className={getSidebarLinkClasses("/cajero/historial")}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-1.5 h-4 rounded-full ${isActive("/cajero/historial") ? styles.activeIndicator : "opacity-0"}`}
                />
                <span
                  className={`w-5 h-5 flex items-center justify-center text-current ${isActive("/cajero/historial") ? "opacity-80" : "opacity-70"}`}
                >
                  <History size={18} strokeWidth={2} />
                </span>
                <span>Historial</span>
              </div>
            </Link>

            {/* Opción: Inventario */}
            <Link
              href="/cajero/inventario"
              onClick={onClose}
              className={getSidebarLinkClasses("/cajero/inventario")}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-1.5 h-4 rounded-full ${isActive("/cajero/inventario") ? styles.activeIndicator : "opacity-0"}`}
                />
                <span
                  className={`w-5 h-5 flex items-center justify-center text-current ${isActive("/cajero/inventario") ? "opacity-80" : "opacity-70"}`}
                >
                  <ShelvingUnit size={18} strokeWidth={2} />
                </span>
                <span>Inventario</span>
              </div>
            </Link>
          </nav>

          {/* Ajustes */}
          <div className="pt-3 pb-2 border-t border-stone-200/100 mt-auto">
            <Link
              href="/cajero/ajustes"
              onClick={onClose}
              className={getSidebarLinkClasses("/cajero/ajustes")}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-1.5 h-4 rounded-full ${isActive("/cajero/ajustes") ? styles.activeIndicator : "opacity-0"}`}
                />
                <span
                  className={`w-5 h-5 flex items-center justify-center text-current ${isActive("/cajero/ajustes") ? "opacity-80" : "opacity-70"}`}
                >
                  <Settings size={18} strokeWidth={2} />
                </span>
                <span>Ajustes</span>
              </div>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};

export default NavCajeroSidebar;
