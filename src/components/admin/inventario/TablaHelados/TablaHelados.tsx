import { formatearCantidad } from "../../../../utils/estadoStock";
import EstadoStockBadge from "../EstadoStockBadge";
import type { ArticuloInventario } from "../../../../models/Inventario";
import styles from "./TablaHelados.module.scss";
import { Pencil } from "lucide-react";

interface Props {
  helados: ArticuloInventario[];
  onAjustar: (producto: ArticuloInventario) => void;
  onEditar?: (producto: ArticuloInventario) => void;
}

export default function TablaHelados({ helados, onAjustar, onEditar }: Props) {
  if (helados.length === 0) {
    return (
      <div className="rounded-xl border border-borde-tenue bg-superficie p-8 text-center text-sm text-texto-mutado shadow-sm">
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
                <th className="py-4 pl-6 text-texto-mutado font-medium">
                  Artículo
                </th>
                <th className="py-4 text-center text-texto-mutado font-medium">
                  Formato / Unidad
                </th>
                <th className="py-4 text-center text-texto-mutado font-medium">
                  Stock actual
                </th>
                <th className="py-4 text-center text-texto-mutado font-medium">
                  Mínimo
                </th>
                <th className="py-4 text-center text-texto-mutado font-medium">
                  Estado
                </th>
                <th className="py-4 pr-6 text-center text-texto-mutado font-medium">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody>
              {helados.map((helado) => (
                <tr key={helado.idProducto} className={styles.fila}>
                  <td className="py-4 pl-6">
                    <div className="flex flex-col">
                      <span className="font-semibold text-texto-oscuro">
                        {helado.nombre}
                      </span>
                      <span className="text-sm text-texto-mutado">
                        {helado.categoria}
                      </span>
                    </div>
                  </td>

                  <td className="py-4 text-center text-texto-mutado">
                    {helado.unidadMedida || "Porción"}
                  </td>

                  <td className="py-4 text-center font-semibold text-texto-oscuro">
                    {formatearCantidad(helado.stockActual)}
                  </td>

                  <td className="py-4 text-center text-texto-mutado">
                    {formatearCantidad(helado.stockMinimo)}
                  </td>

                  <td className="py-4 text-center">
                    <EstadoStockBadge estado={helado.estado} />
                  </td>

                  <td className="py-4 pr-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        className="px-4 py-2 font-semibold text-primario bg-seleccion rounded-lg hover:bg-seleccion-hover transition-colors"
                        onClick={() => onAjustar(helado)}
                      >
                        {helado.estado === "agotado" ||
                        helado.estado === "stock_bajo"
                          ? "Reponer"
                          : "Ajustar"}
                      </button>
                      {onEditar && (
                        <button
                          type="button"
                          title="Editar información del producto"
                          className="flex items-center justify-center p-2 rounded-lg border border-borde-gris text-texto-mutado hover:text-primario hover:bg-superficie-hover hover:border-primario transition-all"
                          onClick={() => onEditar(helado)}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      )}
                    </div>
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
