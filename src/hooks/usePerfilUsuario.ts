"use client";
import { useState, useEffect } from "react";
import { getAvatarUrl } from "../utils/avatar";

/**
 * Hook para la cabecera y barra de navegación superior (TopBar).
 * Mantiene la hora actual de Lima actualizada cada segundo,
 * obtiene los datos del usuario en sesión (nombre y rol)
 * y genera la URL del avatar con las iniciales.
 * 
 * @param initialUserName - Nombre inicial del usuario en caso de provenir de Server Components
 */
export function usePerfilUsuario(initialUserName?: string) {
  const [userName, setUserName] = useState(initialUserName || "");
  const [userRole, setUserRole] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [time, setTime] = useState("");

  // Reloj en tiempo real con formato 24 horas para Perú
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("es-PE", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Si no se proporcionó un nombre inicial, consulta el endpoint /api/auth/perfil
  useEffect(() => {
    if (!initialUserName) {
      fetch("/api/auth/perfil")
        .then((res) => res.json())
        .then((data) => {
          if (data.nombre) setUserName(data.nombre);
          if (data.rol) setUserRole(data.rol);
        })
        .catch(console.error);
    }
  }, [initialUserName]);

  // Alterna la visibilidad del menú desplegable en dispositivos móviles
  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

  // URL del avatar generado a partir del nombre del usuario
  const avatarUrl = getAvatarUrl(userName);

  return {
    userName,
    userRole,
    time,
    isMobileMenuOpen,
    toggleMobileMenu,
    avatarUrl,
  };
}
