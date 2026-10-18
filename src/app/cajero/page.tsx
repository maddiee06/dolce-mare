"use client";
import React from "react";
import SeleccionCategoria from "../../components/cajero/SeleccionCategoria";
import { CuentasAbiertas } from "../../components/cajero/CuentasAbiertas";

const PEDIDOS_INICIALES = [
  {
    id_pedido: 101,
    total: 28.5,
    fecha_pedido: "2026-10-18T16:37:00.000Z",
    estado: { nombre: "Abierto" },
    entrega: { nombre: "Mesa 3" },
    detalle_pedido: [
      { cantidad: 2, productos: { nombre: "Helado Artesanal Doble" } },
      { cantidad: 1, productos: { nombre: "Cremolada de Mango" } },
    ],
  },
  {
    id_pedido: 102,
    total: 18.0,
    fecha_pedido: "2026-10-18T16:22:00.000Z",
    estado: { nombre: "Abierto" },
    entrega: { nombre: "Delivery" },
    detalle_pedido: [
      { cantidad: 1, productos: { nombre: "Postre Tres Leches" } },
    ],
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
