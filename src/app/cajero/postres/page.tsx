"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EnvaseCard } from "../../../components/cajero/ProductosCard";
import { CuentasAbiertas, obtenerProductosTexto } from "../../../components/cajero/CuentasAbiertas";
import { PedidoRelacional } from "../../../models/Pedido";
import { ModalPago, CuentaCobrarInfo } from "../ModalPago";
import { DetalleCobroMixto } from "../../../dao/interfaces/IPedidoDAO";

const postresPrincipales = [
  { 
    id: 1, 
    titulo: "Tiramisú", 
    slug: "tiramisu",
    descripcion: "Clásico postre italiano de café.", 
    nota: "Variedades disponibles", 
    imagen: "/postres/clasicotiramisu.jpg" 
  },
  { 
    id: 2, 
    titulo: "Cheesecake", 
    slug: "cheesecake",
    descripcion: "Suave crema de queso artesanal.", 
    nota: "Frutos y sabores frescos", 
    imagen: "/postres/chessecake.jpg" 
  },
  { 
    id: 3, 
    titulo: "Brownies", 
    slug: "brownies",
    descripcion: "Húmedos y achocolatados.", 
    nota: "Clásico o Especial", 
    imagen: "/postres/brownieclasico.jpg" 
  },
];

export default function PostresPage() {
  const router = useRouter();
  const [cuentasAbiertas, setCuentasAbiertas] = useState<PedidoRelacional[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modalPagoAbierto, setModalPagoAbierto] = useState(false);
  const [cuentaACobrar, setCuentaACobrar] = useState<CuentaCobrarInfo | null>(null);

  const cargarCuentas = useCallback(async () => {
    setCargando(true);
    try {
      const res = await fetch("/api/cajero/pedidos");
      const data = await res.json();
      if (res.ok && data.pedidos) {
        setCuentasAbiertas(data.pedidos);
      }
    } catch (err) {
      console.error("Error al cargar cuentas:", err);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarCuentas();
  }, [cargarCuentas]);

  const manejarSeleccionPostre = (slug: string) => {
    router.push(`/cajero/postres/variantes?tipo=${slug}`);
  };

  const handleAbrirCobro = (pedido: PedidoRelacional) => {
    setCuentaACobrar({
      id_pedido: pedido.id_pedido,
      cliente: pedido.observaciones || pedido.cliente || "Mesa",
      total: Number(pedido.total || 0),
      detalle: obtenerProductosTexto(pedido),
    });
    setModalPagoAbierto(true);
  };

  const handleCompletarPago = async (
    idPedido: number,
    metodo: "efectivo" | "tarjeta" | "yape" | "mixto",
    detalleMixto?: DetalleCobroMixto
  ) => {
    const res = await fetch("/api/cajero/cobrar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_pedido: idPedido,
        metodo_pago: metodo,
        detalle_mixto: detalleMixto,
      }),
    });

    if (!res.ok) throw new Error("Error al cobrar pedido");
    await cargarCuentas();
  };

  return (
    <div className="flex flex-col lg:flex-row w-full h-full min-h-[calc(100vh-65px)] bg-[#FAF8F5] overflow-y-auto lg:overflow-hidden">
      {/* PANEL IZQUIERDO / CARD PRINCIPAL */}
      <section className="flex-1 flex justify-center p-4 md:p-8 overflow-y-auto">
        <div className="w-full max-w-[900px] flex flex-col gap-6">
          <div>
            <Link 
              href="/cajero" 
              className="text-[#2a4d8f] text-sm font-semibold mb-4 flex items-center gap-2 hover:underline w-fit cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Volver a categorías
            </Link>
            
            <h1 className="text-[32px] font-bold text-[#2d2a26] mb-1">
              ¿Qué postre servimos?
            </h1>
            <p className="text-[#8a8580] text-sm md:text-base">
              Pequeños grandes antojos, hechos en casa.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-[#2d2a26] mt-2 uppercase">
            POSTRES
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {postresPrincipales.map((postre) => (
              <EnvaseCard
                key={postre.id}
                titulo={postre.titulo}
                descripcion={postre.descripcion}
                nota={postre.nota}
                imagen={postre.imagen}
                onSelect={() => manejarSeleccionPostre(postre.slug)} 
              />
            ))}
          </div>

          <div className="h-9 w-full shrink-0" aria-hidden="true" />
        </div>
      </section>

      {/* SIDEBAR DERECHO: CUENTAS ABIERTAS */}
      <aside className="w-full lg:w-[380px] xl:w-[420px] shrink-0 border-t lg:border-t-0 lg:border-l border-gray-200 bg-white h-full overflow-y-auto">
        <CuentasAbiertas
          pedidos={cuentasAbiertas}
          cargando={cargando}
          onCobrar={handleAbrirCobro}
          onRecargar={cargarCuentas}
        />
      </aside>

      {/* MODAL DE PAGO */}
      <ModalPago
        isOpen={modalPagoAbierto}
        cuenta={cuentaACobrar}
        onClose={() => {
          setModalPagoAbierto(false);
          setCuentaACobrar(null);
        }}
        onCompletarPago={handleCompletarPago}
      />
    </div>
  );
}
