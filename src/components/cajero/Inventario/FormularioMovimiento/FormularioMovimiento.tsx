"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import type {
  ArticuloInventario,
  RegistrarMovimientoInput,
  Responsable,
  TipoMovimiento,
} from "../../../../models/Inventario";
import { calcularEstadoStock, formatearCantidad } from "../../../../utils/estadoStock";
import { tipoAjuste, tiposDeClase, type ClaseMovimiento } from "../../../../utils/movimientos";
import {
  esSaborOBandeja,
  formatearBandejas,
  OPCIONES_FRACCIONES,
} from "../../../../utils/formatoBandejas";
import {
  describirStockEmpaque,
  identificarTipoEmpaque,
} from "../../../../utils/empaques";
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

  // Modo de empaque para envases y utensilios ('caja' | 'paquete' | 'unidad')
  const [modoEmpaque, setModoEmpaque] = useState<"caja" | "paquete" | "unidad">("unidad");

  const articulo = articulos.find((a) => String(a.idProducto) === idProducto);
  const esSabor = articulo ? esSaborOBandeja(articulo.categoria) : false;
  const empaqueInfo = articulo && !esSabor ? identificarTipoEmpaque(articulo.nombre) : null;

  // Actualizar modo sugerido al seleccionar artículo
  const handleSeleccionarArticulo = (id: string) => {
    setIdProducto(id);
    setCantidad("");
    const nuevoArt = articulos.find((a) => String(a.idProducto) === id);
    if (nuevoArt && !esSaborOBandeja(nuevoArt.categoria)) {
      const info = identificarTipoEmpaque(nuevoArt.nombre);
      if (info.tipo === "conos" && info.unidadesPorCaja) {
        setModoEmpaque(clase === "entrada" ? "caja" : "unidad");
      } else if (info.tipo === "obleas") {
        setModoEmpaque(clase === "entrada" ? "caja" : "paquete");
      } else if (info.unidadesPorPaquete) {
        setModoEmpaque(clase === "entrada" ? "paquete" : "unidad");
      }
    }
  };

  const stock = articulo?.stockActual ?? 0;
  const unidadMostrar = esSabor
    ? "Bandejas"
    : articulo
      ? articulo.unidadMedida
      : "unidades";

  const opciones = tiposDeClase(tipos, clase);

  // Cálculo de la cantidad real en unidades / bandejas para el inventario
  const cantIngresada = Number(cantidad);
  const hayCantidad =
    cantidad.trim() !== "" &&
    Number.isFinite(cantIngresada) &&
    (clase === "ajuste" ? cantIngresada >= 0 : cantIngresada > 0);

  // Multiplicador según el empaque seleccionado
  const factorMultiplicador = useMemo(() => {
    if (esSabor || !empaqueInfo || clase === "ajuste") return 1;
    if (modoEmpaque === "caja" && empaqueInfo.unidadesPorCaja) {
      return empaqueInfo.unidadesPorCaja;
    }
    if (modoEmpaque === "paquete" && empaqueInfo.unidadesPorPaquete) {
      return empaqueInfo.unidadesPorPaquete;
    }
    return 1;
  }, [esSabor, empaqueInfo, modoEmpaque, clase]);

  // Cantidad total real en la unidad base (unidades de conos/obleas/vasos, o bandejas para helados)
  const cantTotalBase = hayCantidad ? redondear(cantIngresada * factorMultiplicador) : 0;

  const diferencia = clase === "ajuste" && hayCantidad ? redondear(cantTotalBase - stock) : 0;

  let tipo: TipoMovimiento | undefined;
  if (clase === "ajuste") {
    tipo =
      diferencia > 0
        ? tipoAjuste(tipos, "suma")
        : diferencia < 0
          ? tipoAjuste(tipos, "resta")
          : undefined;
  } else {
    tipo =
      opciones.length === 1
        ? opciones[0]
        : opciones.find((t) => String(t.idTipoMovimiento) === idTipo);
  }

  const cantidadMov = clase === "ajuste" ? Math.abs(diferencia) : cantTotalBase;
  const resultante =
    articulo && hayCantidad
      ? redondear(
          clase === "entrada"
            ? stock + cantTotalBase
            : clase === "salida"
              ? stock - cantTotalBase
              : cantTotalBase,
        )
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
    resultante !== null && articulo
      ? calcularEstadoStock(resultante, articulo.stockMinimo)
      : null;

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (!puedeEnviar || !articulo || !tipo) return;

    setEnviando(true);
    setError(null);

    // Preparar descripción detallada del movimiento según el empaque o bandeja
    let detalleEmpaque = "";
    if (esSabor) {
      detalleEmpaque = `${formatearBandejas(cantidadMov, true)}`;
    } else if (empaqueInfo && factorMultiplicador > 1) {
      if (modoEmpaque === "caja") {
        detalleEmpaque = `${cantIngresada} caja(s) [${cantidadMov} uds]`;
      } else if (modoEmpaque === "paquete") {
        detalleEmpaque = `${cantIngresada} paquete(s) [${cantidadMov} uds]`;
      }
    }

    let detalle = "";
    if (clase === "ajuste") {
      const stockTxt = esSabor ? formatearBandejas(stock) : formatearCantidad(stock);
      const cantTxt = esSabor ? formatearBandejas(cantTotalBase) : formatearCantidad(cantTotalBase);
      detalle = `Ajuste por conteo físico (${stockTxt} → ${cantTxt}). ${motivo.trim()}`;
    } else {
      detalle = detalleEmpaque ? `${detalleEmpaque} · ${motivo.trim()}` : motivo.trim();
    }

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
          {/* Selección de Artículo */}
          <label className={styles.campo}>
            <span>Artículo</span>
            <select
              value={idProducto}
              onChange={(e) => handleSeleccionarArticulo(e.target.value)}
              required
            >
              <option value="">Selecciona un artículo</option>
              {articulos.map((a) => (
                <option key={a.idProducto} value={a.idProducto}>
                  {a.nombre} · {a.categoria}
                </option>
              ))}
            </select>
          </label>

          {/* Tipo de Movimiento (Entrada, Salida, Ajuste) */}
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
                    if (empaqueInfo) {
                      setModoEmpaque(
                        o.clase === "entrada"
                          ? empaqueInfo.tipo === "conos" || empaqueInfo.tipo === "obleas"
                            ? "caja"
                            : "paquete"
                          : "unidad",
                      );
                    }
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

          {/* Motivo según el tipo */}
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

          {/* Opciones de Empaque si es envase/utensilio */}
          {!esSabor && empaqueInfo && clase !== "ajuste" && (
            <div className={styles.campo}>
              <span>Modo de ingreso / unidad</span>
              <div className={styles.modosEmpaque}>
                {empaqueInfo.unidadesPorCaja && (
                  <button
                    type="button"
                    className={`${styles.modoBtn} ${modoEmpaque === "caja" ? styles.modoBtnActivo : ""}`}
                    onClick={() => setModoEmpaque("caja")}
                  >
                    📦 Por Caja ({empaqueInfo.unidadesPorCaja} uds)
                  </button>
                )}
                {empaqueInfo.unidadesPorPaquete && (
                  <button
                    type="button"
                    className={`${styles.modoBtn} ${modoEmpaque === "paquete" ? styles.modoBtnActivo : ""}`}
                    onClick={() => setModoEmpaque("paquete")}
                  >
                    📦 Por Paquete ({empaqueInfo.unidadesPorPaquete} uds)
                  </button>
                )}
                <button
                  type="button"
                  className={`${styles.modoBtn} ${modoEmpaque === "unidad" ? styles.modoBtnActivo : ""}`}
                  onClick={() => setModoEmpaque("unidad")}
                >
                  Unidades sueltas
                </button>
              </div>
            </div>
          )}

          {/* Cantidad y Unidad */}
          <div className={styles.fila}>
            <label className={styles.campo}>
              <span>
                {esSabor
                  ? clase === "ajuste"
                    ? "Saldo en bandejas (conteo físico)"
                    : `Cantidad en bandejas (${clase})`
                  : modoEmpaque === "caja"
                    ? `Número de cajas (${clase})`
                    : modoEmpaque === "paquete"
                      ? `Número de paquetes (${clase})`
                      : `Cantidad de unidades (${clase})`}
              </span>
              <input
                type="number"
                min={clase === "ajuste" ? "0" : "0.01"}
                step={esSabor ? "0.25" : "1"}
                inputMode="decimal"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                placeholder={esSabor ? "Ej: 0.5 o 1" : "0"}
                required
              />
            </label>

            <div className={styles.campo}>
              <span>Unidad de control</span>
              <div className={styles.lectura}>
                {articulo ? unidadMostrar : "—"}
              </div>
            </div>
          </div>

          {/* Fracciones rápidas para sabores (helados y cremoladas) */}
          {esSabor && (
            <div className={styles.fraccionesContenedor}>
              <span className={styles.fraccionesEtiqueta}>
                Fracciones rápidas de bandeja:
              </span>
              <div className={styles.fracciones}>
                {OPCIONES_FRACCIONES.map((f) => (
                  <button
                    key={f.valor}
                    type="button"
                    className={`${styles.fraccionBtn} ${
                      Number(cantidad) === f.valor ? styles.fraccionBtnActiva : ""
                    }`}
                    onClick={() => setCantidad(String(f.valor))}
                  >
                    {f.etiqueta}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mensaje de conversión en vivo */}
          {hayCantidad && (
            <>
              {esSabor && (
                <div className={styles.infoConversion}>
                  🍨 Cantidad en bandejas: <strong>{formatearBandejas(cantIngresada, true)}</strong>
                </div>
              )}
              {!esSabor && factorMultiplicador > 1 && (
                <div className={styles.infoConversion}>
                  📦 Conversión: {cantIngresada} {modoEmpaque}(s) × {factorMultiplicador} uds ={" "}
                  <strong>{cantTotalBase} unidades</strong> que ingresarán al stock
                </div>
              )}
            </>
          )}

          {/* Motivo o Referencia */}
          <label className={styles.campo}>
            <span>Motivo / referencia</span>
            <input
              type="text"
              maxLength={200}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej. Reposición de proveedor · Factura FC01-0083"
              required
            />
          </label>

          {/* Responsable */}
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
            <p className={styles.error}>
              El saldo contado es igual al saldo actual: no hay nada que ajustar.
            </p>
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

      {/* Panel Lateral de Vista Previa del Saldo */}
      <aside className={styles.lateral}>
        <div className={styles.panel}>
          <h3 className={styles.panelTitulo}>Así quedará el saldo</h3>

          {articulo ? (
            <>
              <div className={styles.articulo}>
                <div className={styles.avatar}>{articulo.nombre.charAt(0).toUpperCase()}</div>
                <div>
                  <div className={styles.articuloNombre}>{articulo.nombre}</div>
                  <div className={styles.articuloUnidad}>
                    {articulo.categoria} · {unidadMostrar}
                  </div>
                </div>
              </div>

              {/* Saldo actual */}
              <div className={styles.filaDato}>
                <span>Saldo actual</span>
                <strong>
                  {esSabor
                    ? formatearBandejas(stock, true)
                    : `${formatearCantidad(stock)} uds`}
                </strong>
              </div>

              {/* Movimiento a registrar */}
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
                    : esSabor
                      ? clase === "entrada"
                        ? `+ ${formatearBandejas(cantTotalBase)}`
                        : clase === "salida"
                          ? `− ${formatearBandejas(cantTotalBase)}`
                          : diferencia === 0
                            ? "Sin cambios"
                            : `${diferencia > 0 ? "+" : "−"} ${formatearBandejas(Math.abs(diferencia))}`
                      : clase === "entrada"
                        ? `+ ${formatearCantidad(cantTotalBase)} uds`
                        : clase === "salida"
                          ? `− ${formatearCantidad(cantTotalBase)} uds`
                          : diferencia === 0
                            ? "Sin cambios"
                            : `${diferencia > 0 ? "+" : "−"} ${formatearCantidad(Math.abs(diferencia))} uds`}
                </strong>
              </div>

              {/* Nuevo Saldo */}
              <div className={`${styles.nuevo} ${insuficiente ? styles.nuevoError : ""}`}>
                <span className={styles.nuevoLabel}>Nuevo saldo resultante</span>
                <div className={styles.nuevoValor}>
                  {resultante !== null
                    ? esSabor
                      ? formatearBandejas(resultante)
                      : `${formatearCantidad(resultante)} ${unidadMostrar}`
                    : "—"}
                </div>
                {resultante !== null && (
                  <div className={styles.formula}>
                    {esSabor ? (
                      <span>{formatearBandejas(resultante, true)}</span>
                    ) : (
                      <>
                        <span>{formatearCantidad(resultante)} unidades</span>
                        {describirStockEmpaque(articulo.nombre, resultante) && (
                          <span> · ({describirStockEmpaque(articulo.nombre, resultante)})</span>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {estadoRes && (
                <p
                  className={`${styles.estado} ${
                    estadoRes === "disponible"
                      ? styles.ok
                      : estadoRes === "stock_bajo"
                        ? styles.bajo
                        : styles.agotado
                  }`}
                >
                  {estadoRes === "disponible" &&
                    `Disponible · Por encima del mínimo de ${
                      esSabor
                        ? formatearBandejas(articulo.stockMinimo)
                        : `${formatearCantidad(articulo.stockMinimo)} ${unidadMostrar}`
                    }.`}
                  {estadoRes === "stock_bajo" &&
                    `Stock bajo · En o por debajo del mínimo de ${
                      esSabor
                        ? formatearBandejas(articulo.stockMinimo)
                        : `${formatearCantidad(articulo.stockMinimo)} ${unidadMostrar}`
                    }.`}
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
            El movimiento quedará identificado con su cantidad, empaque o bandeja, motivo y
            responsable en la sucursal seleccionada.
          </p>
        </div>
      </aside>
    </div>
  );
}
