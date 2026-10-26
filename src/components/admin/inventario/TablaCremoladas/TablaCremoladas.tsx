import { formatearCantidad } from "../../../../utils/estadoStock";
import EstadoStockBadge from "../EstadoStockBadge";
import type { ArticuloInventario } from "../../../../models/Inventario";
import styles from "./TablaCremoladas.module.scss";

interface Props {
  cremoladas: ArticuloInventario[];
  onAjustar: (producto: ArticuloInventario) => void;
}

export default function TablaCremoladas({ cremoladas, onAjustar }: Props) {
  if (cremoladas.length === 0) {
    return (
      <div className="rounded-xl border border-borde-tenue bg-superficie p-8 text-center text-sm text-texto-mutado shadow-sm">
        No hay sabores de cremolada registrados o que coincidan con la búsqueda.
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
              {cremoladas.map((cremolada) => (
                <tr key={cremolada.idProducto} className={styles.fila}>
                  <td className="py-4 pl-6">
                    <div className="flex flex-col">
                      <span className="font-semibold text-texto-oscuro">
                        {cremolada.nombre}
                      </span>
                      <span className="text-sm text-texto-mutado">
                        {cremolada.categoria}
                      </span>
                    </div>
                  </td>

                  <td className="py-4 text-center text-texto-mutado">
                    {cremolada.unidadMedida}
                  </td>

                  <td className="py-4 text-center font-semibold text-texto-oscuro">
                    {formatearCantidad(cremolada.stockActual)}
                  </td>

                  <td className="py-4 text-center text-texto-mutado">
                    {formatearCantidad(cremolada.stockMinimo)}
                  </td>

                  <td className="py-4 text-center">
                    <EstadoStockBadge estado={cremolada.estado} />
                  </td>

                  <td className="py-4 pr-6 text-center">
                    <button
                      className="px-4 py-2 font-semibold text-primario bg-seleccion rounded-lg hover:bg-seleccion-hover transition-colors"
                      onClick={() => onAjustar(cremolada)}
                    >
                      {cremolada.estado === "agotado" ||
                      cremolada.estado === "stock_bajo"
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
