"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import type {
  ArticuloInventario,
  RegistrarMovimientoInput,
  Responsable,
  TipoMovimiento,
} from "../../../../models/Inventario";
import { calcularEstadoStock, formatearCantidad } from "../../../../utils/estadoStock";
import { tipoAjuste, tiposDeClase, type ClaseMovimiento } from "../../../../utils/movimientos";
import styles from "./FormularioMovimiento.module.scss";

interface Props {
  articulos: ArticuloInventario[];
  tipos: TipoMovimiento[];
  responsable: Responsable | null;
  articuloInicialId?: number | null;
  claseInicial?: ClaseMovimiento;
  hrefCancelar: string;
  onGuardar: (input: RegistrarMovimientoInput) => Promise<void>;
}

const OPCIONES: { clase: ClaseMovimiento; simbolo: string; texto: string }[] = [
  { clase: "entrada", simbolo: "+", texto: "Entrada" },
  { clase: "salida", simbolo: "−", texto: "Salida" },
  { clase: "ajuste", simbolo: "≈", texto: "Ajuste" },
];

const ETIQUETA_CANTIDAD: Record<ClaseMovimiento, string> = {
  entrada: "Cantidad de entrada",
  salida: "Cantidad de salida",
  ajuste: "Saldo contado (conteo físico)",
};

const redondear = (n: number) => Math.round(n * 100) / 100;

export default function FormularioMovimiento({
  articulos,
  tipos,
  responsable,
  articuloInicialId,
  claseInicial = "entrada",
  hrefCancelar,
  onGuardar,
}: Props) {
  const [idProducto, setIdProducto] = useState(articuloInicialId ? String(articuloInicialId) : "");
  const [clase, setClase] = useState<ClaseMovimiento>(claseInicial);
  const [idTipo, setIdTipo] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [motivo, setMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const articulo = articulos.find((a) => String(a.idProducto) === idProducto);
  const stock = articulo?.stockActual ?? 0;
  const unidad = articulo?.unidadMedida ?? "unidades";

  const opciones = tiposDeClase(tipos, clase);
  const cant = Number(cantidad);
  const hayCantidad =
    cantidad.trim() !== "" && Number.isFinite(cant) && (clase === "ajuste" ? cant >= 0 : cant > 0);
  const diferencia = clase === "ajuste" && hayCantidad ? redondear(cant - stock) : 0;

  let tipo: TipoMovimiento | undefined;
  if (clase === "ajuste") {
    tipo = diferencia > 0 ? tipoAjuste(tipos, "suma") : diferencia < 0 ? tipoAjuste(tipos, "resta") : undefined;
  } else {
    tipo =
      opciones.length === 1
        ? opciones[0]
        : opciones.find((t) => String(t.idTipoMovimiento) === idTipo);
  }

  const cantidadMov = clase === "ajuste" ? Math.abs(diferencia) : cant;
  const resultante =
    articulo && hayCantidad
      ? redondear(clase === "entrada" ? stock + cant : clase === "salida" ? stock - cant : cant)
      : null;

  const sinTipos = clase !== "ajuste" && opciones.length === 0;
  const faltaTipoAjuste = clase === "ajuste" && hayCantidad && diferencia !== 0 && !tipo;
  const insuficiente = resultante !== null && resultante < 0;

  const puedeEnviar =
    !!articulo &&
    hayCantidad &&
    !!tipo &&
    resultante !== null &&
    !insuficiente &&
    motivo.trim().length > 0 &&
    (clase !== "ajuste" || diferencia !== 0) &&
    !enviando;

  const estadoRes =
    resultante !== null && articulo ? calcularEstadoStock(resultante, articulo.stockMinimo) : null;

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (!puedeEnviar || !articulo || !tipo) return;

    setEnviando(true);
    setError(null);

    const detalle =
      clase === "ajuste"
        ? `Ajuste por conteo físico (${formatearCantidad(stock)} → ${formatearCantidad(cant)}). ${motivo.trim()}`
        : motivo.trim();

    try {
      await onGuardar({
        idProducto: articulo.idProducto,
        idTipoMovimiento: tipo.idTipoMovimiento,
        cantidad: cantidadMov,
        motivo: detalle.slice(0, 255),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo registrar el movimiento");
      setEnviando(false);
    }
  }

  return (
    <div className={styles.layout}>
      <form className={styles.tarjeta} onSubmit={enviar}>
        <div className={styles.cabecera}>
          <h2 className={styles.titulo}>Datos del movimiento</h2>
          <span className={styles.nota}>Todos los campos son obligatorios</span>
        </div>

        <div className={styles.form}>
          <label className={styles.campo}>
            <span>Artículo</span>
            <select value={idProducto} onChange={(e) => setIdProducto(e.target.value)} required>
              <option value="">Selecciona un artículo</option>
              {articulos.map((a) => (
                <option key={a.idProducto} value={a.idProducto}>
                  {a.nombre} · {a.categoria}
                </option>
              ))}
            </select>
          </label>

          <div className={styles.campo}>
            <span>Tipo de movimiento</span>
            <div className={styles.tipos}>
              {OPCIONES.map((o) => (
                <button
                  key={o.clase}
                  type="button"
                  className={`${styles.opcion} ${clase === o.clase ? styles.activa : ""}`}
                  onClick={() => {
                    setClase(o.clase);
                    setIdTipo("");
                    setCantidad("");
                  }}
                >
                  <span aria-hidden>{o.simbolo}</span>
                  {o.texto}
                </button>
              ))}
            </div>
            <p className={styles.ayuda}>
              Entrada suma · Salida resta · Ajuste fija el saldo del conteo físico
            </p>
          </div>

          {clase !== "ajuste" && opciones.length > 1 && (
            <label className={styles.campo}>
              <span>Motivo de {clase === "entrada" ? "la entrada" : "la salida"}</span>
              <select value={idTipo} onChange={(e) => setIdTipo(e.target.value)} required>
                <option value="">Selecciona una opción</option>
                {opciones.map((t) => (
                  <option key={t.idTipoMovimiento} value={t.idTipoMovimiento}>
                    {t.nombre}
                  </option>
                ))}
              </select>
            </label>
          )}

          <div className={styles.fila}>
            <label className={styles.campo}>
              <span>{ETIQUETA_CANTIDAD[clase]}</span>
              <input
                type="number"
                min={clase === "ajuste" ? "0" : "0.01"}
                step="0.01"
                inputMode="decimal"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                placeholder="0"
                required
              />
            </label>

            <div className={styles.campo}>
              <span>Unidad del artículo</span>
              <div className={styles.lectura}>{articulo ? unidad : "—"}</div>
            </div>
          </div>

          <label className={styles.campo}>
            <span>Motivo / referencia</span>
            <input
              type="text"
              maxLength={200}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej. Compra de reposición · FC01-0083"
              required
            />
          </label>

          <div className={styles.campo}>
            <span>Responsable</span>
            <div className={styles.lectura}>
              {responsable ? `${responsable.nombre} · ${responsable.rol}` : "—"}
            </div>
          </div>

          {sinTipos && (
            <p className={styles.error}>
              No hay tipos de {clase === "entrada" ? "entrada" : "salida"} configurados en la base
              de datos.
            </p>
          )}
          {faltaTipoAjuste && (
            <p className={styles.error}>
              Falta el tipo de movimiento de ajuste ({diferencia > 0 ? "que sume" : "que reste"}) en
              la base de datos.
            </p>
          )}
          {clase === "ajuste" && hayCantidad && diferencia === 0 && (
            <p className={styles.error}>El saldo contado es igual al saldo actual: no hay nada que ajustar.</p>
          )}
          {insuficiente && <p className={styles.error}>Stock insuficiente para esta salida.</p>}
          {error && <p className={styles.error}>{error}</p>}
        </div>

        <div className={styles.acciones}>
          <span className={styles.nota}>Vista previa · Aún no registrado</span>
          <div className={styles.botones}>
            <Link href={hrefCancelar} className={styles.cancelar}>
              Cancelar
            </Link>
            <button type="submit" className={styles.guardar} disabled={!puedeEnviar}>
              {enviando ? "Guardando…" : "Guardar movimiento"}
            </button>
          </div>
        </div>
      </form>

      <aside className={styles.lateral}>
        <div className={styles.panel}>
          <h3 className={styles.panelTitulo}>Así quedará el saldo</h3>

          {articulo ? (
            <>
              <div className={styles.articulo}>
                <div className={styles.avatar}>{articulo.nombre.charAt(0).toUpperCase()}</div>
                <div>
                  <div className={styles.articuloNombre}>{articulo.nombre}</div>
                  <div className={styles.articuloUnidad}>Unidad: {unidad}</div>
                </div>
              </div>

              <div className={styles.filaDato}>
                <span>Saldo actual</span>
                <strong>{formatearCantidad(stock)}</strong>
              </div>

              <div className={styles.filaDato}>
                <span>
                  {clase === "entrada"
                    ? "Entrada a registrar"
                    : clase === "salida"
                      ? "Salida a registrar"
                      : "Ajuste calculado"}
                </span>
                <strong>
                  {!hayCantidad
                    ? "—"
                    : clase === "entrada"
                      ? `+ ${formatearCantidad(cant)}`
                      : clase === "salida"
                        ? `− ${formatearCantidad(cant)}`
                        : diferencia === 0
                          ? "Sin cambios"
                          : `${diferencia > 0 ? "+" : "−"} ${formatearCantidad(Math.abs(diferencia))}`}
                </strong>
              </div>

              <div className={`${styles.nuevo} ${insuficiente ? styles.nuevoError : ""}`}>
                <span className={styles.nuevoLabel}>Nuevo saldo</span>
                <div className={styles.nuevoValor}>
                  {resultante !== null ? `${formatearCantidad(resultante)} ${unidad}` : "—"}
                </div>
                {resultante !== null && (
                  <div className={styles.formula}>
                    {clase === "entrada" && `${formatearCantidad(stock)} + ${formatearCantidad(cant)} = ${formatearCantidad(resultante)}`}
                    {clase === "salida" && `${formatearCantidad(stock)} − ${formatearCantidad(cant)} = ${formatearCantidad(resultante)}`}
                    {clase === "ajuste" && `Conteo físico: ${formatearCantidad(cant)}`}
                  </div>
                )}
              </div>

              {estadoRes && (
                <p
                  className={`${styles.estado} ${
                    estadoRes === "disponible" ? styles.ok : estadoRes === "stock_bajo" ? styles.bajo : styles.agotado
                  }`}
                >
                  {estadoRes === "disponible" &&
                    `Disponible · Por encima del mínimo de ${formatearCantidad(articulo.stockMinimo)} ${unidad}.`}
                  {estadoRes === "stock_bajo" &&
                    `Stock bajo · En o por debajo del mínimo de ${formatearCantidad(articulo.stockMinimo)} ${unidad}.`}
                  {estadoRes === "agotado" && "Agotado · El saldo quedará en 0."}
                </p>
              )}
            </>
          ) : (
            <p className={styles.vacioPanel}>Selecciona un artículo para ver cómo quedará su saldo.</p>
          )}
        </div>

        <div className={styles.aviso}>
          <h3 className={styles.avisoTitulo}>Todo queda en el Kardex</h3>
          <p>
            El movimiento quedará identificado con su cantidad, motivo y responsable, y se podrá
            consultar en el historial del artículo.
          </p>
        </div>
      </aside>
    </div>
  );
}