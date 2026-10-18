"use client";
import React, { useState, useEffect } from "react";
import { BienvenidaModal } from "../BienvenidaModal";

const CLAVE_BIENVENIDA = "bienvenida_mostrada";

export function BienvenidaWrapper({ userName }: { userName: string }) {
  const [mostrarBienvenida, setMostrarBienvenida] = useState(false);

  useEffect(() => {
    const yaVista = sessionStorage.getItem(CLAVE_BIENVENIDA);
    if (!yaVista) {
      const timer = setTimeout(() => {
        setMostrarBienvenida(true);
      }, 0);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleEntendido = () => {
    sessionStorage.setItem(CLAVE_BIENVENIDA, "true");
    setMostrarBienvenida(false);
  };

  return (
    <BienvenidaModal
      isOpen={mostrarBienvenida}
      userName={userName}
      onEntendido={handleEntendido}
    />
  );
}

export default BienvenidaWrapper;
