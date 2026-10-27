"use client";
import React from "react";
import SeleccionCategoria from "../../components/cajero/SeleccionCategoria";
import { CuentasAbiertas } from "../../components/cajero/CuentasAbiertas";
import type { CuentaGuardadaType } from "../../components/cajero/CuentasGuardadas/CuentasGuardadas";

const PEDIDOS_INICIALES: CuentaGuardadaType[] = [
  {
    id_pedido: 101,
    total: 28.5,
    fecha_pedido: "2026-10-18T16:37:00.000Z",
    cliente: "Mesa 3",
    direccion_entrega: null,
    detalle: "2 × Helado Artesanal Doble, 1 × Cremolada de Mango",
    estado: "Abierto",
    tipo_entrega: "Mesa",
  },
  {
    id_pedido: 102,
    total: 18.0,
    fecha_pedido: "2026-10-18T16:22:00.000Z",
    cliente: "Delivery",
    direccion_entrega: "",
    detalle: "1 × Postre Tres Leches",
    estado: "Abierto",
    tipo_entrega: "Delivery",
  },
];

export default function CajeroPage() {
  return (
    <div className="flex flex-col lg:flex-row w-full h-full min-h-[calc(100vh-65px)] bg-[#FAF8F5] overflow-y-auto lg:overflow-hidden">
      <section className="flex-1 flex justify-center p-4 md:p-8 overflow-y-auto">
        <SeleccionCategoria />
      </section>

      <aside className="w-full lg:w-[380px] xl:w-[420px] shrink-0 border-t lg:border-t-0 lg:border-l border-gray-200 bg-white">
        <CuentasAbiertas pedidos={PEDIDOS_INICIALES} />
      </aside>
    </div>
  );
}
