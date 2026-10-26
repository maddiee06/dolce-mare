"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Settings } from "lucide-react";
import styles from "./MenuPerfil.module.scss";

interface MenuPerfilProps {
  userName: string;
  userRole: string | number;
  avatarUrl: string;
}

export function MenuPerfil({ userName, userRole, avatarUrl }: MenuPerfilProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [cerrando, setCerrando] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setCerrando(true);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        router.push("/login");
        router.refresh();

        setTimeout(() => {
          setCerrando(false);
          setIsOpen(false);
        }, 800);
      } else {
        setCerrando(false);
      }
    } catch (error) {
      console.error("Error al cerrar sesión", error);
      setCerrando(false);
    }
  };

  const displayRole = Number(userRole) === 1 ? "Administrador" : "Cajero";

  return (
    <div className={styles.container} ref={menuRef}>
      <div className={styles.trigger} onClick={() => setIsOpen(!isOpen)}>
        <img
          className="w-10 h-10 rounded-full object-cover border border-stone-200"
          src={avatarUrl}
          alt={`Avatar de ${userName || "Cajero"}`}
        />
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-bold text-stone-700">
            {userName || "Cajero"}
          </span>
          <p className="text-sm text-stone-500">{displayRole}</p>
        </div>
        <Image
          src="/chevron-down.svg"
          alt="Desplegar menú"
          width={18}
          height={18}
          className={`opacity-60 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className={styles.dropdown}>
          <Link
            href="/cajero/ajustes"
            onClick={() => setIsOpen(false)}
            className={styles.menuItem}
          >
            <Settings size={16} strokeWidth={1.5} className="text-stone-500" />
            <span>Configuración</span>
          </Link>

          <div className={styles.divider} />

          <button
            onClick={handleLogout}
            disabled={cerrando}
            className={styles.menuItemDanger}
          >
            {cerrando ? (
              <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin opacity-70" />
            ) : (
              <LogOut size={16} strokeWidth={1.5} className="opacity-80" />
            )}
            <span>{cerrando ? "Saliendo..." : "Cerrar sesión"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
