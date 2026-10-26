"use client";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Banknote,
  ChartColumn,
  IceCreamBowl,
  LayoutDashboard,
  LogOut,
  SlidersHorizontal,
} from "lucide-react";
import styles from "./Sidebar.module.scss";

type NavItem = {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number | string;
};

const navItems: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "inventory",
    label: "Inventario",
    href: "/admin/inventario",
    icon: IceCreamBowl,
  },
  {
    id: "boxes",
    label: "Gestión de cajas",
    href: "/admin/cajas",
    icon: Banknote,
  },
  {
    id: "reports",
    label: "Reportes",
    href: "/admin/reportes",
    icon: ChartColumn,
  },
  {
    id: "settings",
    label: "Configuración",
    href: "/admin/configuracion",
    icon: SlidersHorizontal,
  },
];

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [cerrando, setCerrando] = useState(false);

  useEffect(() => {
    setCerrando(false);
  }, [pathname]);

  const handleLogout = async () => {
    setCerrando(true);
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (res.ok) {
        router.push("/login");
        router.refresh();
        setTimeout(() => {
          setCerrando(false);
        }, 800);
      } else {
        console.error("Error al cerrar sesión");
        setCerrando(false);
      }
    } catch (error) {
      console.error("Fallo la petición de cierre de sesión", error);
      setCerrando(false);
    }
  };

  const activeIndex = Math.max(
    0,
    navItems.findIndex((item) => pathname.startsWith(item.href)),
  );

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
        style={{ "--active-index": activeIndex } as React.CSSProperties}
      >
        <span className={`${styles.pill} absolute inset-x-0 top-0 h-12`}>
          <span className={`${styles.pillBar} absolute inset-y-3`} />
        </span>

        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeIndex === index;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`${styles.item} ${
                isActive ? styles.itemActive : ""
              } flex h-12 items-center gap-3.5 px-3.5 z-10`}
            >
              <Icon
                className={`size-5.5 flex-none transition-colors ${
                  isActive ? "text-blue-900" : "text-gray-500"
                }`}
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
            </Link>
          );
        })}
      </nav>

      {/* Pie */}
      <div className="mt-auto flex flex-col gap-2.5">
        <hr className={styles.separacion} />
        <button
          onClick={handleLogout}
          disabled={cerrando}
          className={`${styles.logout} flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium transition-all ${
            cerrando
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-alerta-rojo-fondo hover:text-peligro"
          }`}
        >
          {cerrando ? (
            <span className="h-5 w-5 flex-none animate-spin rounded-full border-2 border-current border-t-transparent"></span>
          ) : (
            <LogOut className="size-5 flex-none" strokeWidth={1.8} />
          )}
          <span>{cerrando ? "Cerrando..." : "Cerrar sesión"}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
