"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import type {
  ArticuloInventario,
  EstadoStock,
  GrupoInventario,
  TipoMovimiento,
} from "@/src/models/Inventario";
import { TablaEnvases } from "@/src/components/admin/inventario/TablaEnvases";
import { TablaHelados } from "@/src/components/admin/inventario/TablaHelados";
import { TablaCremoladas } from "@/src/components/admin/inventario/TablaCremoladas";
import { FiltrosInventario } from "@/src/components/admin/inventario/FiltrosInventario";
import { AjustarModel } from "@/src/components/admin/inventario/AjustarModel";
import { ModalEditarProducto } from "@/src/components/admin/inventario/ModalEditarProducto";
import { HistorialMovimientos } from "@/src/components/admin/inventario/HistorialMovimientos";

export default function InventarioPage() {
  // Estados de navegación y filtros
  const [tabActivo, setTabActivo] = useState("helados");
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState<"" | EstadoStock>("");

  // Estados de datos
  const [saboresData, setSaboresData] = useState<ArticuloInventario[]>([]);
  const [envasesData, setEnvasesData] = useState<ArticuloInventario[]>([]);
  const [cargando, setCargando] = useState(true);

  // Estados para el Modal de Ajuste de Stock
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] =
    useState<ArticuloInventario | null>(null);
  const [tiposMovimiento, setTiposMovimiento] = useState<TipoMovimiento[]>([]);

  // Estados para el Modal de Edición de Producto (Nombre, Precio, Categoría y Foto)
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [productoAEditar, setProductoAEditar] = useState<{
    id: number | string;
    nombre: string;
    precio: number;
    categoria: string;
    imagenUrl?: string;
    unidadMedida?: string;
  } | null>(null);

  // Cargar los tipos de movimiento al iniciar
  useEffect(() => {
    const cargarTiposMovimiento = async () => {
      try {
        const res = await fetch("/api/inventario/tipos-movimiento");
        if (res.ok) {
          const data = await res.json();
          setTiposMovimiento(data);
        }
      } catch (e) {
        console.error("Error al cargar tipos de movimiento", e);
      }
    };
    cargarTiposMovimiento();
  }, []);

  // Función para cargar inventario desde la API
  const cargarInventario = useCallback(async () => {
    setCargando(true);
    try {
      let params = "";
      if (busqueda) params += `&busqueda=${encodeURIComponent(busqueda)}`;
      if (estadoFiltro) params += `&estado=${estadoFiltro}`;

      const [resSabores, resEnvases] = await Promise.all([
        fetch(`/api/inventario?tipo=sabores${params}`),
        fetch(`/api/inventario?tipo=envases${params}`),
      ]);

      const parsearRespuesta = async (
        res: Response
      ): Promise<ArticuloInventario[]> => {
        if (!res.ok) return [];
        const raw = await res.json();
        if (raw && Array.isArray(raw.grupos)) {
          return raw.grupos.flatMap((g: GrupoInventario) => g.articulos);
        }
        if (Array.isArray(raw)) return raw;
        return raw.data || raw.items || raw.productos || [];
      };

      const [sabores, envases] = await Promise.all([
        parsearRespuesta(resSabores),
        parsearRespuesta(resEnvases),
      ]);

      setSaboresData(sabores);
      setEnvasesData(envases);
    } catch (error) {
      console.error("Error al cargar el inventario:", error);
    } finally {
      setCargando(false);
    }
  }, [busqueda, estadoFiltro]);

  // Carga inicial y ante cambios en búsqueda o estado (con debounce de 300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      cargarInventario();
    }, 300);

    return () => clearTimeout(timer);
  }, [cargarInventario]);

  // Filtros en memoria por pestaña y categoría (instantáneos, 0ms)
  const heladosFiltrados = useMemo(() => {
    return saboresData
      .filter((item) => item.categoria.toLowerCase().includes("helado"))
      .filter((item) =>
        categoria
          ? item.categoria.toLowerCase().includes(categoria.toLowerCase())
          : true
      );
  }, [saboresData, categoria]);

  const cremoladasFiltradas = useMemo(() => {
    return saboresData
      .filter((item) => item.categoria.toLowerCase().includes("cremolada"))
      .filter((item) =>
        categoria
          ? item.categoria.toLowerCase().includes(categoria.toLowerCase())
          : true
      );
  }, [saboresData, categoria]);

  const envasesFiltrados = useMemo(() => {
    return envasesData.filter((item) =>
      categoria
        ? item.categoria.toLowerCase().includes(categoria.toLowerCase())
        : true
    );
  }, [envasesData, categoria]);

  // Función para registrar el ajuste de stock
  const handleConfirmarAjuste = async (
    idTipoMovimiento: number,
    cantidad: number,
    motivo: string
  ) => {
    if (!productoSeleccionado) return;

    const respuesta = await fetch("/api/inventario/movimientos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idProducto: productoSeleccionado.idProducto,
        idTipoMovimiento,
        cantidad,
        motivo,
      }),
    });

    if (!respuesta.ok) {
      const errorData = await respuesta.json();
      throw new Error(errorData.error || "No se pudo registrar el movimiento");
    }

    // Actualizar silenciosamente el inventario sin recargar toda la página
    await cargarInventario();
  };

  // Abrir modal de edición para un producto específico (trayendo datos de BD)
  const handleAbrirEditar = (producto: ArticuloInventario) => {
    setProductoAEditar({
      id: producto.idProducto,
      nombre: producto.nombre,
      precio: producto.precioVenta ?? 0,
      categoria: producto.categoria,
      imagenUrl: producto.imagenUrl,
      unidadMedida: producto.unidadMedida,
    });
    setModalEditarAbierto(true);
  };

  // Guardar los cambios de nombre, precio, categoría y foto del producto
  const handleGuardarEdicion = async (datos: {
    nombre: string;
    precio: number;
    categoria: string;
    imagenUrl?: string;
  }) => {
    if (!productoAEditar) return;

    const respuesta = await fetch("/api/inventario/producto", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idProducto: productoAEditar.id,
        nombre: datos.nombre,
        precio: datos.precio,
        categoria: datos.categoria,
        imagenUrl: datos.imagenUrl,
      }),
    });

    if (!respuesta.ok) {
      const errorData = await respuesta.json().catch(() => ({}));
      throw new Error(errorData.error || "No se pudo actualizar el producto");
    }

    // Actualización reactiva optimista en memoria
    setSaboresData((prev) =>
      prev.map((item) =>
        item.idProducto === productoAEditar.id
          ? {
              ...item,
              nombre: datos.nombre,
              categoria: datos.categoria,
              precioVenta: datos.precio,
              imagenUrl: datos.imagenUrl,
            }
          : item
      )
    );
    setEnvasesData((prev) =>
      prev.map((item) =>
        item.idProducto === productoAEditar.id
          ? {
              ...item,
              nombre: datos.nombre,
              categoria: datos.categoria,
              precioVenta: datos.precio,
              imagenUrl: datos.imagenUrl,
            }
          : item
      )
    );

    // Sincronizar con base de datos
    await cargarInventario();
  };

  return (
    <div className="animateFadeIn">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primario">Inventario General</h1>
        <p className="mt-1 text-sm text-texto-mutado">
          Gestiona el stock actual, registra movimientos y actualiza la
          información de tus productos.
        </p>
      </div>

      {/* SECCIÓN 1: Resumen y Actividad Reciente */}
      <section className="mb-8" aria-label="Actividad reciente">
        <div className="flex items-center gap-2 mb-3">
          <span className="h-4 w-1 rounded-full bg-coral" />
          <span className="text-xs font-bold uppercase tracking-wider text-texto-secundario">
            Actividad Reciente
          </span>
        </div>
        <HistorialMovimientos />
      </section>

      {/* SECCIÓN 2: Catálogo y Control de Stock */}
      <section className="pt-6 border-t border-borde-tenue" aria-label="Catálogo de productos y stock">
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="h-4 w-1 rounded-full bg-primario" />
            <span className="text-xs font-bold uppercase tracking-wider text-texto-secundario">
              Existencias en Sede
            </span>
          </div>
          <h2 className="text-xl font-bold text-texto-primario tracking-tight">
            Catálogo y Control de Stock
          </h2>
          <p className="mt-0.5 text-xs text-texto-mutado">
            Selecciona una sección para consultar inventario disponible, ajustar cantidades o editar información del producto.
          </p>
        </div>

        {/* Navegación por Pestañas */}
        <div className="mb-6 flex w-fit gap-2 rounded-2xl border border-borde-suave bg-superficie p-2 shadow-sm">
        <button
          onClick={() => setTabActivo("helados")}
          className={`rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-200 ${
            tabActivo === "helados"
              ? "bg-seleccion text-primario"
              : "text-texto-mutado hover:bg-seleccion-suave hover:text-primario"
          }`}
        >
          Helados
        </button>
        <button
          onClick={() => setTabActivo("cremoladas")}
          className={`rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-200 ${
            tabActivo === "cremoladas"
              ? "bg-seleccion text-primario"
              : "text-texto-mutado hover:bg-seleccion-suave hover:text-primario"
          }`}
        >
          Cremoladas
        </button>
        <button
          onClick={() => setTabActivo("envases")}
          className={`rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-200 ${
            tabActivo === "envases"
              ? "bg-seleccion text-primario"
              : "text-texto-mutado hover:bg-seleccion-suave hover:text-primario"
          }`}
        >
          Envases y Complementos
        </button>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <FiltrosInventario
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        categoria={categoria}
        setCategoria={setCategoria}
        estado={estadoFiltro}
        setEstado={setEstadoFiltro}
      />

      <div>
        {cargando ? (
          <div className="flex h-32 items-center justify-center text-sm font-medium text-texto-mutado">
            Cargando inventario...
          </div>
        ) : (
          <>
            {tabActivo === "helados" && (
              <TablaHelados
                helados={heladosFiltrados}
                onAjustar={(producto) => {
                  setProductoSeleccionado(producto);
                  setModalAbierto(true);
                }}
                onEditar={handleAbrirEditar}
              />
            )}
            {tabActivo === "cremoladas" && (
              <TablaCremoladas
                cremoladas={cremoladasFiltradas}
                onAjustar={(producto) => {
                  setProductoSeleccionado(producto);
                  setModalAbierto(true);
                }}
                onEditar={handleAbrirEditar}
              />
            )}
            {tabActivo === "envases" && (
              <TablaEnvases
                envases={envasesFiltrados}
                onAjustar={(producto) => {
                  setProductoSeleccionado(producto);
                  setModalAbierto(true);
                }}
                onEditar={handleAbrirEditar}
              />
            )}
          </>
        )}
      </div>
      </section>

      {/* Modal de Ajuste de Stock */}
      <AjustarModel
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        producto={productoSeleccionado}
        tiposMovimiento={tiposMovimiento}
        onConfirm={handleConfirmarAjuste}
      />

      {/* Modal de Edición de Producto con Vista Previa de Card de Cajero */}
      <ModalEditarProducto
        isOpen={modalEditarAbierto}
        onClose={() => {
          setModalEditarAbierto(false);
          setProductoAEditar(null);
        }}
        producto={productoAEditar}
        onSave={handleGuardarEdicion}
      />
    </div>
  );
}
