"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import SeleccionSabores from "../SeleccionSabores";
import TuCuenta from "../TuCuenta";
import { ModalPago } from "../ModalPago";

export interface SaborCuenta {
  id: string;
  nombre: string;
  cantidad: number;
}

export default function CajaPage() {
  const searchParams = useSearchParams();
  const producto = searchParams.get("producto") || "Vaso - 3 sabores";
  const precioSeleccionado = Number(searchParams.get("precio") || 24);
  const [sabores, setSabores] = useState<SaborCuenta[]>([]);
  const [modalPagoAbierto, setModalPagoAbierto] = useState(false);

  const actualizarSabores = (nombres: string[]) => {
    setSabores(
      nombres.map((nombre, index) => ({
        id: String(index + 1),
        nombre,
        cantidad: 1,
      })),
    );
  };

  return (
    <div className="relative h-full w-full overflow-y-auto bg-[#faf8f4] lg:overflow-hidden">
      <div className="grid h-full min-h-0 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(320px,380px)]">
        <main className="flex min-h-0 min-w-0 items-start justify-center overflow-visible px-3 py-4 sm:px-4 md:py-5 xl:px-6 xl:py-5">
          <SeleccionSabores onSelectionChange={actualizarSabores} />
        </main>

        <aside className="relative z-10 w-full min-w-0 shrink-0 border-t border-gray-200 bg-white lg:border-l lg:border-t-0">
          <div className="hidden lg:block lg:px-5 lg:pt-4">
            <TuCuenta
              mesa="Mesa 04"
              codigoMesa="B001-0149"
              productoNombre={producto}
              productoDetalle="Gelato artesanal - 240 ml"
              precioUnitario={sabores.length === 3 ? precioSeleccionado : 0}
              sabores={sabores}
              onCobrar={() => setModalPagoAbierto(true)}
            />
          </div>
          <div className="lg:hidden">
            <TuCuenta
              mesa="Mesa 04"
              codigoMesa="B001-0149"
              productoNombre={producto}
              productoDetalle="Gelato artesanal - 240 ml"
              precioUnitario={sabores.length === 3 ? precioSeleccionado : 0}
              sabores={sabores}
              onCobrar={() => setModalPagoAbierto(true)}
            />
          </div>
        </aside>
      </div>

      <ModalPago
        isOpen={modalPagoAbierto}
        total={sabores.length === 3 ? precioSeleccionado : 0}
        onClose={() => setModalPagoAbierto(false)}
      />
    </div>
  );
}
