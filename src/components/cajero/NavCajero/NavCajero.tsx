"use client";
import React from "react";
import Image from "next/image";
import { Store, Clock, History, Package, Lock, LockOpen } from "lucide-react";
import { usePerfilUsuario } from "../../../hooks/usePerfilUsuario";
import { NavCajeroSidebar } from "../NavCajeroSidebar";
import { RolNombre } from "../../../models/Usuario";

export interface NavCajeroProps {
  userName: string;
  userRole: RolNombre;
  isCajaAbierta?: boolean;
  pendingCount?: number;
}

export function NavCajero({
  userName,
  userRole,
  isCajaAbierta = false,
  pendingCount = 0,
}: NavCajeroProps) {
  const { time, isMobileMenuOpen, toggleMobileMenu, avatarUrl } =
    usePerfilUsuario(userName);

  return (
    <>
      {/* Sidebar Móvil */}
      <NavCajeroSidebar
        isOpen={isMobileMenuOpen}
        onClose={toggleMobileMenu}
        avatarUrl={avatarUrl}
        userName={userName}
        userRole={userRole}
      />

      <div className="block lg:hidden">
        <div
          className="flex justify-between items-center w-full h-[76px] px-6 py-4 border-b border-[var(--color-text-placeholder)]/25"
          style={{ backgroundColor: "var(--color-nav)" }}
        >
          <Image
            className="object-contain"
            src="/logo_vertical.svg"
            alt="Logo Dolce Mare"
            width={120}
            height={50}
            priority
          />

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              {isCajaAbierta ? (
                <LockOpen
                  size={15}
                  strokeWidth={2}
                  color="var(--color-success)"
                />
              ) : (
                <Lock size={15} strokeWidth={2} color="#DC2626" />
              )}
              <span
                className="text-[11px] font-semibold"
                style={{
                  color: isCajaAbierta ? "var(--color-success)" : "#DC2626",
                }}
              >
                {isCajaAbierta ? "Caja abierta" : "Caja cerrada"}
              </span>
            </div>

            {/* Hora */}
            <div className="text-right">
              <span
                className="text-sm font-bold"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {time || "00:00"}
              </span>
            </div>

            {/* Botón hamburguesa que abre el sidebar */}
            <button
              className="p-1.5 cursor-pointer hover:opacity-80 transition"
              onClick={toggleMobileMenu}
              aria-label="Abrir menú"
            >
              <Image
                src="/burger.svg"
                alt="Abrir menú"
                width={24}
                height={24}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Vista Escritorio */}
      <header
        className="hidden lg:flex justify-between items-center w-full h-[76px] px-8 border-b border-[var(--color-text-placeholder)]/25 box-border"
        style={{ backgroundColor: "var(--color-nav)" }}
      >
        {/* Logo */}
        <div className="flex items-center">
          <Image
            className="object-contain"
            src="/logo_vertical.svg"
            alt="Logo Dolce Mare"
            width={140}
            height={60}
            priority
          />
        </div>

        {/* Menú de Navegación Estático */}
        <nav className="h-full flex items-center">
          <ul className="flex items-center gap-2 list-none m-0 p-0 h-full">
            {/* Opción: Caja */}
            <li className="relative h-full flex items-center">
              <button
                type="button"
                className="inline-flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer text-[var(--color-text-disabled)] hover:bg-[var(--color-seleccion)] hover:text-[var(--color-text-primary)]"
              >
                <span className="w-5 h-5 flex items-center justify-center">
                  <Store size={20} strokeWidth={2} />
                </span>
                <span>Caja</span>
              </button>
            </li>

            {/* Opción: Pendientes */}
            <li className="relative h-full flex items-center">
              <button
                type="button"
                className="inline-flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer text-[var(--color-text-disabled)] hover:bg-[var(--color-seleccion)] hover:text-[var(--color-text-primary)]"
              >
                <span className="w-5 h-5 flex items-center justify-center">
                  <Clock size={20} strokeWidth={2} />
                </span>
                <span>Pendientes</span>

                {pendingCount > 0 && (
                  <span
                    className="text-[11px] px-2 py-0.5 rounded-full font-bold border border-[var(--color-border-1)]"
                    style={{
                      backgroundColor: "var(--color-seleccion)",
                      color: "var(--color-text-disabled)",
                    }}
                  >
                    {pendingCount}
                  </span>
                )}
              </button>
            </li>

            {/* Opción: Historial */}
            <li className="relative h-full flex items-center">
              <button
                type="button"
                className="inline-flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer text-[var(--color-text-disabled)] hover:bg-[var(--color-seleccion)] hover:text-[var(--color-text-primary)]"
              >
                <span className="w-5 h-5 flex items-center justify-center">
                  <History size={20} strokeWidth={2} />
                </span>
                <span>Historial</span>
              </button>
            </li>

            {/* Opción: Inventario */}
            <li className="relative h-full flex items-center">
              <button
                type="button"
                className="inline-flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer text-[var(--color-text-disabled)] hover:bg-[var(--color-seleccion)] hover:text-[var(--color-text-primary)]"
              >
                <span className="w-5 h-5 flex items-center justify-center">
                  <Package size={20} strokeWidth={2} />
                </span>
                <span>Inventario</span>
              </button>
            </li>
          </ul>
        </nav>

        {/* Zona derecha: Estado de Caja, Hora y Perfil */}
        <div className="flex items-center gap-5">
          {/* Indicador de Caja */}
          <div className="flex items-center gap-1.5">
            {isCajaAbierta ? (
              <LockOpen
                size={16}
                strokeWidth={2}
                color="var(--color-success)"
              />
            ) : (
              <Lock size={16} strokeWidth={2} color="#DC2626" />
            )}
            <span
              className="text-xs font-bold"
              style={{
                color: isCajaAbierta ? "var(--color-success)" : "#DC2626",
              }}
            >
              {isCajaAbierta ? "Caja abierta" : "Caja cerrada"}
            </span>
          </div>

          {/* Reloj */}
          <div className="flex items-center gap-1.5">
            <span
              className="text-sm font-bold"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {time || "00:00"}
            </span>
          </div>

          {/* Divisor */}
          <div
            className="w-px h-8 opacity-30"
            style={{ backgroundColor: "var(--color-text-placeholder)" }}
          />

          {/* Perfil del Cajero */}
          <div className="flex items-center gap-3 cursor-pointer select-none group">
            <img
              className="w-10 h-10 rounded-full object-cover border"
              style={{ borderColor: "var(--color-border-1)" }}
              src={avatarUrl}
              alt={`Avatar de ${userName || "Cajero"}`}
            />
            <div className="flex flex-col leading-tight">
              <span
                className="text-sm font-bold transition-colors group-hover:opacity-80"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {userName || "Cajero"}
              </span>
              <span
                className="text-xs"
                style={{ color: "var(--color-text-placeholder)" }}
              >
                {userRole || "Ventas"}
              </span>
            </div>
            <Image
              src="/chevron-down.svg"
              alt="Desplegar menú"
              width={18}
              height={18}
              className="opacity-60 group-hover:opacity-100 transition-opacity"
            />
          </div>
        </div>
      </header>
    </>
  );
}

export default NavCajero;
