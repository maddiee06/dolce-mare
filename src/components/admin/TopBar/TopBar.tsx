"use client";
import React from "react";
import { Bell, MapPin } from "lucide-react";
import styles from "./TopBar.module.scss";
import { usePerfilUsuario } from "../../../hooks/usePerfilUsuario";

export type TopBarProps = {
  initialUserName?: string;
  nombreSede?: string;
};

const TopBar: React.FC<TopBarProps> = ({
  initialUserName,
  nombreSede = "Sede no seleccionada",
}) => {
  const { userName, userRole, time, avatarUrl } =
    usePerfilUsuario(initialUserName);

  return (
    <header
      className={`${styles.topbar} flex h-20 w-full items-center justify-between px-8`}
    >
      {/* Lado Izquierdo*/}
      <div className="flex items-center gap-2">
        <MapPin className="size-5 text-primario" strokeWidth={2} />{" "}
        <span className="text-lg font-bold text-primario">{nombreSede}</span>
      </div>

      {/* Lado Derecho*/}
      <div className="flex items-center gap-6">
        {/* Reloj */}
        <div className="text-sm font-bold text-texto-mutado">{time || "00:00"}</div>

        {/* Botón de Notificaciones */}
        <button
          className={`${styles.iconButton} relative flex size-10 items-center justify-center rounded-full transition-colors hover:bg-superficie-hover`}
        >
          <Bell className="size-5" strokeWidth={1.5} />
          <span className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-peligro"></span>
        </button>

        <div className="w-px h-8 opacity-30 bg-borde-gris" />

        {/* Perfil de Usuario */}
        <div className="flex items-center gap-3 cursor-pointer">
          <img
            className="w-10 h-10 rounded-full object-cover border border-borde-gris"
            src={avatarUrl}
            alt={`Avatar de ${userName || "Administrador"}`}
            onError={(e) => {
              e.currentTarget.src = "/default-avatar.png";
            }}
          />
          <div className="flex flex-col">
            <span
              className={`${styles.userName} text-sm font-semibold leading-tight`}
            >
              {userName || "Cargando..."}
            </span>
            <p className="text-sm text-texto-mutado">
              {Number(userRole) === 1 ? "Administrador" : "Cajero"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
