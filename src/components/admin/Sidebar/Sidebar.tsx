"use client";
import React, { useState } from "react";
import Image from "next/image";
import {
  Banknote,
  ChartColumn,
  IceCreamBowl,
  LayoutDashboard,
  LogOut,
  SlidersHorizontal,
} from "lucide-react";
import styles from "./Sidebar.module.scss";

export type SidebarProps = {};

// Arreglo para mapear los items y mantener el código limpio
const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "inventory", label: "Inventario", icon: IceCreamBowl, badge: 4 },
  { id: "boxes", label: "Gestión de cajas", icon: Banknote, badge: 2 },
  { id: "reports", label: "Reportes", icon: ChartColumn },
  { id: "settings", label: "Configuración", icon: SlidersHorizontal },
];

const Sidebar: React.FC<SidebarProps> = ({}) => {
  // Estado para controlar qué elemento está activo (necesario para la animación CSS)
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <aside
      className={`${styles.sidebar} sticky top-0 flex h-screen w-64 flex-none flex-col px-4 pb-4 pt-4`}
    >
      {/* Marca */}
      <div className="px-3 pb-3 flex items-center justify-center">
        <Image
          src="/logo.svg"
          alt="Logo de Dolce Mare"
          width={85}
          height={85}
          className="h-auto drop-shadow-sm transition-transform hover:scale-105"
          priority
        />
      </div>

      <hr className={styles.separacion} />

      {/* Navegación */}
      <nav
        className={`${styles.nav} relative flex flex-col gap-1`}
        // Pasamos el índice activo a CSS para que la píldora se deslice correctamente
        style={{ "--active-index": activeIndex } as React.CSSProperties}
      >
        {/* Fondo deslizable (Pill) */}
        <span className={`${styles.pill} absolute inset-x-0 top-0 h-12`}>
          <span className={`${styles.pillBar} absolute inset-y-3`} />
        </span>

        {/* Renderizado dinámico de los botones */}
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeIndex === index;

          return (
            <button
              key={item.id}
              onClick={() => setActiveIndex(index)}
              className={`${styles.item} ${isActive ? styles.itemActive : ""} flex h-12 items-center gap-3.5 px-3.5 z-10`}
            >
              <Icon
                className={`size-5.5 flex-none transition-colors ${isActive ? "text-blue-900" : "text-gray-500"}`}
                strokeWidth={isActive ? 2 : 1.6}
              />
              <span className="flex-1 text-left">{item.label}</span>

              {item.badge && (
                <span
                  className={`${styles.badge} grid h-5.5 min-w-5.5 place-items-center rounded-full px-2 text-xs font-semibold`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Pie */}
      <div className="mt-auto flex flex-col gap-2.5">
        <button
          className={`${styles.store} flex w-full items-center gap-3 p-3 text-left`}
        >
          <span
            className={`${styles.avatar} grid size-10 flex-none place-items-center font-extrabold shadow-sm`}
          >
            M
          </span>
          <span className="flex min-w-0 flex-col whitespace-nowrap">
            <span
              className={`${styles.storeName} text-sm font-bold leading-tight tracking-wide`}
            >
              Dolce Mare
            </span>
            <span className={`${styles.storeMeta} text-xs font-medium mt-0.5`}>
              Administrador
            </span>
          </span>
        </button>

        <hr className={styles.separacion} />

        <button
          className={`${styles.logout} flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium`}
        >
          <LogOut className="size-5 flex-none" strokeWidth={1.8} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
