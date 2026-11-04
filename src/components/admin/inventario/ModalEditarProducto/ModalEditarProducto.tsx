"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  ChevronDown,
  Loader2,
  Store,
  ImagePlus,
  Trash2,
  Lightbulb,
  Tag,
  Edit3,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  ImageIcon,
} from "lucide-react";
import styles from "./ModalEditarProducto.module.scss";

export interface ProductoEditar {
  id: string | number;
  nombre: string;
  precio: number;
  categoria: string;
  imagenUrl?: string;
  unidadMedida?: string;
}

export interface ModalEditarProductoProps {
  isOpen: boolean;
  onClose: () => void;
  producto: ProductoEditar | null;
  onSave: (datos: {
    nombre: string;
    precio: number;
    categoria: string;
    imagenUrl?: string;
  }) => void | Promise<void>;
  categoriasDisponibles?: string[];
}

// 3 secciones principales de Dolce Mare y sus unidades oficiales
export const CATEGORIAS_DEFAULT = [
  "Helados",
  "Cremoladas",
  "Envases y Complementos",
  "Insumos",
  "Bebidas",
];

/**
 * Resuelve la unidad de medida según la sección de Dolce Mare:
 * - Helados: Porción
 * - Cremoladas: Vaso
 * - Envases y Complementos: Unidades
 */
export function obtenerUnidadPorSeccion(
  categoria: string = "",
  unidadOriginal?: string
): string {
  const c = categoria.toLowerCase();
  if (c.includes("cremolada")) return "Vaso";
  if (c.includes("helado") || c.includes("sabor")) return "Porción";
  if (
    c.includes("envase") ||
    c.includes("complemento") ||
    c.includes("insumo") ||
    c.includes("unidad")
  ) {
    return "Unidades";
  }
  return unidadOriginal || "Unidad";
}

function obtenerDescripcionSubtitulo(categoria: string): string {
  const c = categoria.toLowerCase();
  if (c.includes("cremolada")) return "Refrescante y natural con pulpa de fruta.";
  if (c.includes("helado")) return "Sabor artesanal tradicional preparado al día.";
  if (c.includes("envase") || c.includes("complemento")) return "Envase o complemento para servicio.";
  return "Producto del catálogo Dolce Mare.";
}

const LIMITE_MB = 2;
const MAX_BYTES = LIMITE_MB * 1024 * 1024; // 2 MB

/**
 * Redimensiona y optimiza automáticamente la foto a WebP (máx. 800×600 px)
 * garantizando nitidez y peso inferior a 60 KB para no saturar la base de datos.
 */
function optimizarImagenCliente(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxW = 800;
        const maxH = 600;
        let w = img.width;
        let h = img.height;

        if (w > maxW || h > maxH) {
          const ratio = Math.min(maxW / w, maxH / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, w, h);
        const resultadoWebP = canvas.toDataURL("image/webp", 0.88);
        resolve(resultadoWebP);
      };
      img.onerror = () => reject(new Error("No se pudo procesar la imagen."));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Error al leer el archivo."));
    reader.readAsDataURL(file);
  });
}

export const ModalEditarProducto: React.FC<ModalEditarProductoProps> = ({
  isOpen,
  onClose,
  producto,
  onSave,
  categoriasDisponibles = CATEGORIAS_DEFAULT,
}) => {
  const [nombre, setNombre] = useState<string>("");
  const [precio, setPrecio] = useState<string>("");
  const [categoria, setCategoria] = useState<string>("");
  const [imagenUrl, setImagenUrl] = useState<string>("");
  const [procesandoFoto, setProcesandoFoto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Precargar información del producto directo de la base de datos
  useEffect(() => {
    if (producto) {
      setNombre(producto.nombre || "");
      setPrecio(producto.precio !== undefined ? String(producto.precio) : "0.00");
      setCategoria(producto.categoria || "");
      setImagenUrl(producto.imagenUrl || "");
      setError(null);
    }
  }, [producto, isOpen]);

  // Accesibilidad: Cerrar al presionar Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !guardando) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, guardando, onClose]);

  if (!isOpen || !producto) return null;

  const listaCategorias = Array.from(
    new Set([producto.categoria, ...categoriasDisponibles].filter(Boolean))
  );

  const precioNumerico = parseFloat(precio) || 0;
  // Resuelve dinámicamente si es Porción (Helados), Vaso (Cremoladas) o Unidades (Envases)
  const unidadActual = obtenerUnidadPorSeccion(categoria, producto.unidadMedida);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !guardando) {
      onClose();
    }
  };

  const handleIncrementarPrecio = (delta: number) => {
    const actual = parseFloat(precio) || 0;
    const nuevo = Math.max(0, actual + delta);
    setPrecio(nuevo.toFixed(2));
  };

  // Manejador de selección y optimización del archivo local
  const handleSeleccionarArchivo = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Validar formato
    const tiposValidos = ["image/jpeg", "image/png", "image/webp"];
    if (!tiposValidos.includes(file.type)) {
      setError("Formato no compatible. Por favor sube una imagen en JPG, PNG o WebP.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // 2. Validar peso original máximo (2 MB)
    if (file.size > MAX_BYTES) {
      setError(
        `La imagen supera el peso máximo de ${LIMITE_MB} MB (${(file.size / (1024 * 1024)).toFixed(1)} MB). Por favor selecciona un archivo más ligero.`
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    try {
      setProcesandoFoto(true);
      setError(null);
      const dataUrlOptimizada = await optimizarImagenCliente(file);
      setImagenUrl(dataUrlOptimizada);
    } catch (err) {
      setError("No se pudo procesar la imagen seleccionada.");
    } finally {
      setProcesandoFoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleQuitarFoto = () => {
    setImagenUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nombreFinal = nombre.trim();
    const precioFinal = parseFloat(precio);

    if (!nombreFinal) {
      setError("El nombre del producto no puede estar vacío.");
      return;
    }

    if (isNaN(precioFinal) || precioFinal < 0) {
      setError("Introduce un precio válido mayor o igual a 0.");
      return;
    }

    if (!categoria.trim()) {
      setError("Por favor, selecciona una categoría.");
      return;
    }

    try {
      setGuardando(true);
      setError(null);
      await onSave({
        nombre: nombreFinal,
        precio: precioFinal,
        categoria: categoria.trim(),
        imagenUrl: imagenUrl.trim() || undefined,
      });
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al actualizar el producto."
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-editar-titulo"
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#0e172a]/70 overflow-y-auto ${styles.overlay}`}
      onClick={handleBackdropClick}
    >
      <div
        className={`w-full max-w-4xl bg-superficie rounded-3xl shadow-[var(--sombra-modal)] border border-borde-suave overflow-hidden my-auto ${styles.modalContenedor}`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* COLUMNA IZQUIERDA: CARD DEL CAJERO (VISTA PREVIA EN VIVO) */}
          <div className="lg:col-span-5 bg-[#fbf8f4] p-5 sm:p-7 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-borde-tenue">
            <div>
              {/* Etiqueta superior con icono Lucide */}
              <div className="flex items-center justify-between mb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primario-suave border border-borde-suave text-primario text-[11px] font-bold uppercase tracking-wider">
                  <Store className="h-3.5 w-3.5 text-primario" />
                  <span>Card del Cajero (POS)</span>
                </div>
                <span className="text-[11px] font-medium text-texto-mutado">
                  Vista Previa en Vivo
                </span>
              </div>

              {/* LA CARD EXACTA DEL CAJERO */}
              <div className={styles.cardPreview}>
                {/* Contenedor de Imagen con fondo crema cálido */}
                <div className={styles.cardImageContainer}>
                  {imagenUrl && imagenUrl.trim() ? (
                    <img
                      src={imagenUrl}
                      alt={nombre || producto.nombre}
                      onError={() => {
                        setImagenUrl("");
                      }}
                    />
                  ) : (
                    // Si no tiene foto, muestra el fondo limpio con el tono de la card
                    <div className="flex flex-col items-center justify-center gap-2 text-texto-mutado/50 select-none">
                      <ImagePlus className="h-10 w-10 stroke-[1.2]" />
                      <span className="text-xs font-medium text-texto-mutado/70">
                        Sin foto asignada
                      </span>
                    </div>
                  )}

                  {/* Badge de categoría en la card */}
                  <span className="absolute top-2.5 right-2.5 rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primario shadow-xs border border-borde-gris">
                    {categoria || "Dolce Mare"}
                  </span>
                </div>

                {/* Contenedor de Texto y Precio */}
                <div className="p-4 flex flex-col justify-between gap-3 bg-white">
                  <div>
                    <h3 className="text-[#2a4d8f] font-bold text-lg mb-1 leading-snug">
                      {nombre || "Nombre del Producto"}
                    </h3>
                    <p className="text-gray-500 text-sm leading-snug">
                      {obtenerDescripcionSubtitulo(categoria)}
                    </p>
                  </div>

                  {/* Footer con precio reactivo y unidad según sección (Porción / Vaso / Unidades) */}
                  <div className="flex items-baseline justify-between pt-2 border-t border-gray-100 mt-1">
                    <span className="text-xl font-extrabold text-[#2a4d8f]">
                      S/ {precioNumerico.toFixed(2)}
                    </span>
                    <span className="text-xs text-gray-500 font-semibold bg-[#f8f9fa] px-2 py-0.5 rounded-md border border-borde-tenue">
                      {unidadActual}
                    </span>
                  </div>
                </div>
              </div>

              {/* Especificaciones Técnicas Recomendadas debajo de la tarjeta */}
              <div className="mt-4 rounded-xl border border-borde-suave bg-white/90 p-3 text-[11px] space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-1.5 font-bold text-texto-secundario text-xs pb-1.5 border-b border-borde-tenue">
                  <CheckCircle2 className="h-3.5 w-3.5 text-exito" />
                  <span>Especificaciones de la foto</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-center pt-0.5">
                  <div className="bg-[#f8f9fa] rounded-lg py-1.5 px-1 border border-borde-tenue">
                    <span className="block text-[9px] text-texto-mutado uppercase font-bold tracking-wider">
                      Formato
                    </span>
                    <span className="font-bold text-texto-principal text-[11px]">
                      JPG, PNG, WebP
                    </span>
                  </div>
                  <div className="bg-[#f8f9fa] rounded-lg py-1.5 px-1 border border-borde-tenue">
                    <span className="block text-[9px] text-texto-mutado uppercase font-bold tracking-wider">
                      Resolución
                    </span>
                    <span className="font-bold text-texto-principal text-[11px]">
                      800 × 600 px
                    </span>
                  </div>
                  <div className="bg-[#f8f9fa] rounded-lg py-1.5 px-1 border border-borde-tenue">
                    <span className="block text-[9px] text-texto-mutado uppercase font-bold tracking-wider">
                      Peso máx.
                    </span>
                    <span className="font-bold text-texto-principal text-[11px]">
                      2 MB
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mensaje inferior explicativo con Lucide */}
            <div className="mt-5 flex items-start gap-2 text-[11px] text-texto-mutado leading-relaxed">
              <Lightbulb className="h-4 w-4 text-coral shrink-0 mt-0.5" />
              <span>
                <strong className="text-texto-secundario font-semibold">Punto de Venta:</strong> Así es exactamente como los cajeros verán este artículo en el panel táctil.
              </span>
            </div>
          </div>

          {/* COLUMNA DERECHA: FORMULARIO DE EDICIÓN                    */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between bg-white relative">
            {/* Input de archivo nativo (oculto) */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleSeleccionarArchivo}
              className="hidden"
            />

            {/* Botón Cerrar */}
            <button
              type="button"
              onClick={onClose}
              disabled={guardando}
              className="absolute top-5 right-5 rounded-full p-2 text-texto-mutado transition-colors hover:bg-superficie-hover hover:text-texto-primario focus:outline-none disabled:opacity-50"
              aria-label="Cerrar modal"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              {/* Título de la cabecera */}
              <div className="mb-5 pr-8">
                <h2
                  id="modal-editar-titulo"
                  className="text-2xl font-bold text-texto-primario tracking-tight"
                >
                  Editar Producto
                </h2>
                <p className="mt-0.5 text-xs text-texto-mutado">
                  Actualiza el nombre, precio, categoría y foto en la base de datos.
                </p>
              </div>

              {/* Formulario */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-xl border border-error-borde bg-error-fondo px-4 py-2.5 text-xs font-semibold text-error-texto flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-error-texto shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Campo 1: Nombre del Producto */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="nombre"
                      className="flex items-center gap-1.5 text-xs uppercase font-bold tracking-wider text-texto-secundario"
                    >
                      <Edit3 className="h-3.5 w-3.5 text-coral" />
                      <span>Nombre del Producto</span>
                    </label>
                    <span className="text-[11px] text-texto-mutado font-medium">
                      ID: #{producto.id}
                    </span>
                  </div>
                  <input
                    id="nombre"
                    type="text"
                    value={nombre}
                    disabled={guardando}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. Delicia de maracuyá, Coco con leche..."
                    className="w-full rounded-xl border border-borde-gris bg-superficie-gris px-4 py-2.5 text-sm font-semibold text-texto-principal transition-all duration-200 placeholder:text-texto-placeholder focus:border-primario focus:outline-none focus:ring-2 focus:ring-[var(--color-primario-focus)] disabled:cursor-not-allowed disabled:opacity-60"
                    required
                  />
                </div>

                {/* Campo 2: Categoría */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="categoria"
                      className="flex items-center gap-1.5 text-xs uppercase font-bold tracking-wider text-texto-secundario"
                    >
                      <Tag className="h-3.5 w-3.5 text-coral" />
                      <span>Categoría</span>
                    </label>
                    <span className="text-[11px] text-primario font-semibold">
                      Unidad: {unidadActual}
                    </span>
                  </div>
                  <div className="relative">
                    <select
                      id="categoria"
                      value={categoria}
                      disabled={guardando}
                      onChange={(e) => setCategoria(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-borde-gris bg-superficie-gris px-4 py-2.5 pr-10 text-sm font-semibold text-texto-principal transition-all duration-200 focus:border-primario focus:outline-none focus:ring-2 focus:ring-[var(--color-primario-focus)] disabled:cursor-not-allowed disabled:opacity-60"
                      required
                    >
                      <option value="" disabled>
                        Selecciona una categoría
                      </option>
                      {listaCategorias.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-texto-mutado">
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                {/* Campo 3: Precio de Venta */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="precio"
                      className="block text-xs uppercase font-bold tracking-wider text-texto-secundario"
                    >
                      Precio de Venta al Público (PEN)
                    </label>
                    <span className="text-[11px] text-texto-mutado font-medium">
                      Unidad: <strong className="text-texto-secundario">{unidadActual}</strong>
                    </span>
                  </div>

                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-base font-bold text-[#2a4d8f] select-none">
                      S/.
                    </span>
                    <input
                      id="precio"
                      type="number"
                      step="0.10"
                      min="0"
                      placeholder="0.00"
                      value={precio}
                      disabled={guardando}
                      onChange={(e) => setPrecio(e.target.value)}
                      className="w-full rounded-xl border border-borde-gris bg-superficie-gris py-2.5 pr-4 pl-12 text-base font-bold text-texto-principal transition-all duration-200 placeholder:text-texto-placeholder focus:border-primario focus:outline-none focus:ring-2 focus:ring-[var(--color-primario-focus)] disabled:cursor-not-allowed disabled:opacity-60"
                      required
                    />
                  </div>

                  {/* Micro-ajustes rápidos */}
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="text-[11px] text-texto-mutado font-medium">
                      Ajuste rápido:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleIncrementarPrecio(-1.0)}
                      className="px-2 py-0.5 rounded-lg bg-superficie-gris hover:bg-superficie-hover border border-borde-gris text-[11px] font-semibold text-texto-secundario transition-colors"
                    >
                      -S/ 1.00
                    </button>
                    <button
                      type="button"
                      onClick={() => handleIncrementarPrecio(-0.5)}
                      className="px-2 py-0.5 rounded-lg bg-superficie-gris hover:bg-superficie-hover border border-borde-gris text-[11px] font-semibold text-texto-secundario transition-colors"
                    >
                      -S/ 0.50
                    </button>
                    <button
                      type="button"
                      onClick={() => handleIncrementarPrecio(0.5)}
                      className="px-2 py-0.5 rounded-lg bg-superficie-gris hover:bg-superficie-hover border border-borde-gris text-[11px] font-semibold text-texto-secundario transition-colors"
                    >
                      +S/ 0.50
                    </button>
                    <button
                      type="button"
                      onClick={() => handleIncrementarPrecio(1.0)}
                      className="px-2 py-0.5 rounded-lg bg-superficie-gris hover:bg-superficie-hover border border-borde-gris text-[11px] font-semibold text-texto-secundario transition-colors"
                    >
                      +S/ 1.00
                    </button>
                  </div>
                </div>

                {/* Campo 4: Foto del Producto */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="flex items-center gap-1.5 text-xs uppercase font-bold tracking-wider text-texto-secundario">
                      <ImageIcon className="h-3.5 w-3.5 text-coral" />
                      <span>Foto del Producto</span>
                    </label>
                    {imagenUrl ? (
                      <span className="text-[11px] text-exito-texto font-semibold flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-exito" />
                        Foto cargada
                      </span>
                    ) : (
                      <span className="text-[11px] text-texto-mutado font-medium">
                        Opcional
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={procesandoFoto || guardando}
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-primario/30 bg-superficie-gris text-xs font-bold text-primario shadow-2xs hover:bg-primario-suave hover:border-primario transition-all active:scale-[0.99] disabled:opacity-60"
                    >
                      {procesandoFoto ? (
                        <Loader2 className="h-4 w-4 animate-spin text-coral" />
                      ) : (
                        <UploadCloud className="h-4 w-4 text-coral" />
                      )}
                      <span>
                        {procesandoFoto
                          ? "Optimizando imagen..."
                          : imagenUrl
                          ? "Cambiar foto del producto"
                          : "Subir foto del producto"}
                      </span>
                    </button>

                    {imagenUrl && (
                      <button
                        type="button"
                        onClick={handleQuitarFoto}
                        title="Quitar foto y dejar fondo limpio"
                        className="p-2.5 rounded-xl border border-borde-gris bg-superficie-gris text-texto-mutado hover:text-error-texto hover:border-error-borde hover:bg-error-fondo transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Footer de botones */}
                <div className="mt-6 pt-3 border-t border-borde-tenue flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={guardando}
                    className="rounded-xl border border-borde-gris bg-superficie px-5 py-2.5 text-sm font-semibold text-texto-principal shadow-2xs transition-all duration-200 hover:bg-superficie-hover hover:border-borde-suave hover:text-texto-primario focus:outline-none focus:ring-2 focus:ring-borde-suave active:scale-[0.98] disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={guardando || procesandoFoto}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-boton-primario px-6 py-2.5 text-sm font-bold text-texto-blanco shadow-sm transition-all duration-200 hover:bg-boton-primario-hover hover:-translate-y-0.5 hover:shadow active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[var(--color-primario-focus)] disabled:opacity-60 disabled:pointer-events-none disabled:transform-none"
                  >
                    {guardando && <Loader2 className="h-4 w-4 animate-spin" />}
                    <span>{guardando ? "Guardando..." : "Guardar Cambios"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalEditarProducto;
