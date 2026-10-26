import React, { useState } from "react";
import { X } from "lucide-react";
import type {
  ArticuloInventario,
  TipoMovimiento,
} from "../../../../models/Inventario";
import { formatearCantidad } from "../../../../utils/estadoStock";
import styles from "./AjustarModel.module.scss";

interface AjustarModalProps {
  isOpen: boolean;
  onClose: () => void;
  producto: ArticuloInventario | null;
  tiposMovimiento: TipoMovimiento[];
  onConfirm: (
    idTipoMovimiento: number,
    cantidad: number,
    motivo: string,
  ) => Promise<void>;
}

export default function AjustarModal({
  isOpen,
  onClose,
  producto,
  tiposMovimiento,
  onConfirm,
}: AjustarModalProps) {
  const [idTipoMovimiento, setIdTipoMovimiento] = useState<number | "">("");
  const [cantidad, setCantidad] = useState<number | "">("");
  const [motivo, setMotivo] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !producto) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idTipoMovimiento || !cantidad || cantidad <= 0) {
      setError(
        "Por favor completa el tipo de movimiento y una cantidad mayor a 0.",
      );
      return;
    }

    setGuardando(true);
    setError(null);
    try {
      await onConfirm(Number(idTipoMovimiento), Number(cantidad), motivo);
      setIdTipoMovimiento("");
      setCantidad("");
      setMotivo("");
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al registrar el movimiento.",
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Cabecera del Modal */}
        <div className={styles.header}>
          <h2>Ajustar Stock</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Info del Producto actual */}
          <div className={styles.infoBox}>
            <span className={styles.categoria}>{producto.categoria}</span>
            <span className={styles.nombre}>{producto.nombre}</span>
            <span className={styles.stock}>
              Stock actual: {formatearCantidad(producto.stockActual)}{" "}
              {producto.unidadMedida}.
            </span>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-alerta-rojo-fondo p-3 text-sm text-peligro border border-alerta-rojo-borde">
              {error}
            </div>
          )}

          {/* Formulario */}
          <div className={styles.inputGroup}>
            <label>Tipo de movimiento</label>
            <select
              value={idTipoMovimiento}
              onChange={(e) => setIdTipoMovimiento(Number(e.target.value))}
              disabled={guardando}
            >
              <option value="" disabled>
                Selecciona una opción...
              </option>
              {tiposMovimiento.map((tipo) => (
                <option
                  key={tipo.idTipoMovimiento}
                  value={tipo.idTipoMovimiento}
                >
                  {tipo.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label>Cantidad a ajustar ({producto.unidadMedida})</label>
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={cantidad}
              onChange={(e) =>
                setCantidad(e.target.value === "" ? "" : Number(e.target.value))
              }
              placeholder="Ej. 50"
              disabled={guardando}
            />
          </div>

          <div className={styles.inputGroup}>
            <label>
              Motivo <span>(Opcional)</span>
            </label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej. Ingreso de mercadería, Producto dañado..."
              rows={2}
              disabled={guardando}
            />
          </div>

          {/* Botones de acción */}
          <div className={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.btnCancel}
              disabled={guardando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.btnSubmit}
              disabled={guardando}
            >
              {guardando ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent border-b-transparent"></span>
              ) : (
                "Guardar movimiento"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
