import { formatearCantidad } from "../../../../utils/estadoStock";
import EstadoStockBadge from "../EstadoStockBadge";
import type { ArticuloInventario } from "../../../../models/Inventario";
import styles from "./TablaHelados.module.scss";

interface Props {
  helados: ArticuloInventario[];
  onAjustar: (producto: ArticuloInventario) => void;
}

export default function TablaHelados({ helados, onAjustar }: Props) {
  if (helados.length === 0) {
    return (
      <div className="rounded-xl border border-[#2a4d8f]/10 bg-white p-8 text-center text-sm text-[#8a8580] shadow-sm">
        No hay sabores de helado registrados o que coincidan con la búsqueda.
      </div>
    );
  }

  return (
    <div className={styles.contenedor}>
      <div className={styles.tarjeta}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className={styles.cabecera}>
              <tr>
                <th className="py-4 pl-6 text-[#8a8580] font-medium">
                  Artículo
                </th>
                <th className="py-4 text-center text-[#8a8580] font-medium">
                  Formato / Unidad
                </th>
                <th className="py-4 text-center text-[#8a8580] font-medium">
                  Stock actual
                </th>
                <th className="py-4 text-center text-[#8a8580] font-medium">
                  Mínimo
                </th>
                <th className="py-4 text-center text-[#8a8580] font-medium">
                  Estado
                </th>
                <th className="py-4 pr-6 text-center text-[#8a8580] font-medium">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody>
              {helados.map((helado) => (
                <tr key={helado.idProducto} className={styles.fila}>
                  <td className="py-4 pl-6">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-900">
                        {helado.nombre}
                      </span>
                      <span className="text-sm text-[#8a8580]">
                        {helado.categoria}
                      </span>
                    </div>
                  </td>

                  <td className="py-4 text-center text-[#8a8580]">
                    {helado.unidadMedida}
                  </td>

                  <td className="py-4 text-center font-semibold text-gray-900">
                    {formatearCantidad(helado.stockActual)}
                  </td>

                  <td className="py-4 text-center text-[#8a8580]">
                    {formatearCantidad(helado.stockMinimo)}
                  </td>

                  <td className="py-4 text-center">
                    <EstadoStockBadge estado={helado.estado} />
                  </td>

                  <td className="py-4 pr-6 text-center">
                    <button
                      className="px-4 py-2 font-semibold text-[#2a4d8f] bg-[#fbe8dd] rounded-lg hover:bg-[#f5dacb] transition-colors"
                      onClick={() => onAjustar(helado)}
                    >
                      {helado.estado === "agotado" ||
                      helado.estado === "stock_bajo"
                        ? "Reponer"
                        : "Ajustar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
