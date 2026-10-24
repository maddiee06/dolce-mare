"use client";
import { useState, useEffect } from "react";
import { getAvatarUrl } from "../utils/avatar";

export function usePerfilUsuario(initialUserName?: string) {
  const [userName, setUserName] = useState(initialUserName || "");
  const [userRole, setUserRole] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [time, setTime] = useState("");

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

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);
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
