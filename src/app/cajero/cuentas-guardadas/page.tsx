"use client";

import React, { useState, useEffect } from "react";
import { CuentasGuardadas, CuentaGuardadaType } from "../../../components/cajero/CuentasGuardadas";

export default function PageCuentasGuardadas() {
  const [cuentas, setCuentas] = useState<CuentaGuardadaType[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      setCargando(true);
      try {
        const res = await fetch("/api/cajero/pedidos");
        const data = await res.json();
        if (res.ok && data.pedidos) {
          type DetalleItem = { productos?: { nombre?: string }; cantidad?: number };
          const mapeadas: CuentaGuardadaType[] = data.pedidos.map((p: {
            id_pedido: number;
            observaciones?: string | null;
            cliente?: string | null;
            direccion_entrega?: string | null;
            detalle_pedido?: DetalleItem[];
            total: number | string;
            fecha_pedido: string;
            estados_pedido?: { nombre?: string } | null;
            estado?: string | null;
            tipos_entrega?: { nombre?: string } | null;
            tipo_entrega?: string | null;
          }) => ({
            id_pedido: p.id_pedido,
            cliente: p.observaciones || p.cliente || "Mesa",
            direccion_entrega: p.direccion_entrega || null,
            detalle:
              p.detalle_pedido
                ?.map((d) => `${d.productos?.nombre || "Producto"} × ${d.cantidad || 1}`)
                .join(", ") || "Sin productos",
            total: Number(p.total || 0),
            fecha_pedido: p.fecha_pedido,
            estado: p.estados_pedido?.nombre || p.estado || "Abierto",
            tipo_entrega: p.tipos_entrega?.nombre || p.tipo_entrega || "Mesa",
          }));
          setCuentas(mapeadas);
        }
      } catch (err) {
        console.error("Error al cargar cuentas guardadas:", err);
      } finally {
        setCargando(false);
      }
    }

    cargar();
  }, []);

  return <CuentasGuardadas cuentas={cuentas} cargando={cargando} />;
}
