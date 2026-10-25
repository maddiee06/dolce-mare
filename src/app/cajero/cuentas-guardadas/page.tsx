"use client";
import React, { useState, useEffect } from "react";
import { CuentasGuardadas, CuentaGuardadaType } from "../../../components/cajero/CuentasGuardadas";

export default function PageCuentasGuardadas() {
  const [cuentas, setCuentas] = useState<CuentaGuardadaType[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Aquí es donde harás el fetch a Supabase más adelante. por ahora solo va a salir un mensaje de "Cargando..." alksaksw
    setCargando(false); 
  }, []);

  return (
    // Importamos el componente visual 
    <CuentasGuardadas cuentas={cuentas} cargando={cargando} />
  );
}