"use client";
import { useState, useEffect } from "react";
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

export default function InventarioPage() {
  // Estados de navegación y filtros
  const [tabActivo, setTabActivo] = useState("helados");
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState<"" | EstadoStock>("");

  // Estados de datos
  const [heladosData, setHeladosData] = useState<ArticuloInventario[]>([]);
  const [cremoladasData, setCremoladasData] = useState<ArticuloInventario[]>(
    [],
  );
  const [envasesData, setEnvasesData] = useState<ArticuloInventario[]>([]);
  const [cargando, setCargando] = useState(true);

  // Estados para el Modal de Ajuste
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] =
    useState<ArticuloInventario | null>(null);
  const [tiposMovimiento, setTiposMovimiento] = useState<TipoMovimiento[]>([]);

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

  // Función para registrar el ajuste de stock
  const handleConfirmarAjuste = async (
    idTipoMovimiento: number,
    cantidad: number,
    motivo: string,
  ) => {
    if (!productoSeleccionado) return;

    const respuesta = await fetch("/api/inventario/registrar", {
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

    // Recargar la página para ver el inventario actualizado
    window.location.reload();
  };

  useEffect(() => {
    const fetchDesdeTuAPI = async () => {
      setCargando(true);
      try {
        const tipoQuery = tabActivo === "envases" ? "envases" : "sabores";

        let url = `/api/inventario?tipo=${tipoQuery}`;
        if (busqueda) url += `&busqueda=${encodeURIComponent(busqueda)}`;
        if (estadoFiltro) url += `&estado=${estadoFiltro}`;

        const respuesta = await fetch(url);

        if (!respuesta.ok) {
          throw new Error(`Error HTTP: ${respuesta.status}`);
        }

        const rawData = await respuesta.json();
        console.log("Respuesta de la API:", rawData);

        let data: ArticuloInventario[] = [];
        if (rawData && Array.isArray(rawData.grupos)) {
          data = rawData.grupos.flatMap(
            (grupo: GrupoInventario) => grupo.articulos,
          );
        } else if (Array.isArray(rawData)) {
          data = rawData;
        } else {
          data = rawData.data || rawData.items || rawData.productos || [];
        }

        if (!Array.isArray(data) || data.length === 0) {
          console.warn(
            "No hay artículos para mostrar o la estructura falló.",
            rawData,
          );
          setHeladosData([]);
          setCremoladasData([]);
          setEnvasesData([]);
          return;
        }

        // Filtro del dropdown de categoría de la UI
        const dataFiltrada = data.filter((item) =>
          categoria
            ? item.categoria.toLowerCase().includes(categoria.toLowerCase())
            : true,
        );

        // Distribución por pestañas
        if (tabActivo === "helados") {
          setHeladosData(
            dataFiltrada.filter((item) =>
              item.categoria.toLowerCase().includes("helado"),
            ),
          );
        } else if (tabActivo === "cremoladas") {
          setCremoladasData(
            dataFiltrada.filter((item) =>
              item.categoria.toLowerCase().includes("cremolada"),
            ),
          );
        } else if (tabActivo === "envases") {
          setEnvasesData(dataFiltrada);
        }
      } catch (error) {
        console.error("Error al cargar el inventario:", error);
      } finally {
        setCargando(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchDesdeTuAPI();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [tabActivo, busqueda, estadoFiltro, categoria]);

  return (
    <div className="animateFadeIn">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#2a4d8f]">
          Inventario General
        </h1>
        <p className="mt-1 text-sm text-[#8a8580]">
          Gestiona el stock actual, registra movimientos y revisa el Kardex.
        </p>
      </div>

      {/* Navegación por Pestañas */}
      <div className="mb-8 flex w-fit gap-2 rounded-2xl border border-[#2a4d8f]/15 bg-white p-2 shadow-sm">
        <button
          onClick={() => setTabActivo("helados")}
          className={`rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-200 ${
            tabActivo === "helados"
              ? "bg-[#fbe8dd] text-[#2a4d8f]"
              : "text-[#8a8580] hover:bg-[#fbe8dd]/40 hover:text-[#2a4d8f]"
          }`}
        >
          Helados
        </button>
        <button
          onClick={() => setTabActivo("cremoladas")}
          className={`rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-200 ${
            tabActivo === "cremoladas"
              ? "bg-[#fbe8dd] text-[#2a4d8f]"
              : "text-[#8a8580] hover:bg-[#fbe8dd]/40 hover:text-[#2a4d8f]"
          }`}
        >
          Cremoladas
        </button>
        <button
          onClick={() => setTabActivo("envases")}
          className={`rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-200 ${
            tabActivo === "envases"
              ? "bg-[#fbe8dd] text-[#2a4d8f]"
              : "text-[#8a8580] hover:bg-[#fbe8dd]/40 hover:text-[#2a4d8f]"
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

      <div key={tabActivo} className="animateFadeIn">
        {cargando ? (
          <div className="flex h-32 items-center justify-center text-sm font-medium text-[#8a8580]">
            Cargando inventario...
          </div>
        ) : (
          <>
            {tabActivo === "helados" && (
              <TablaHelados
                helados={heladosData}
                onAjustar={(producto) => {
                  setProductoSeleccionado(producto);
                  setModalAbierto(true);
                }}
              />
            )}
            {tabActivo === "cremoladas" && (
              <TablaCremoladas
                cremoladas={cremoladasData}
                onAjustar={(producto) => {
                  setProductoSeleccionado(producto);
                  setModalAbierto(true);
                }}
              />
            )}
            {tabActivo === "envases" && (
              <TablaEnvases
                envases={envasesData}
                onAjustar={(producto) => {
                  setProductoSeleccionado(producto);
                  setModalAbierto(true);
                }}
              />
            )}
          </>
        )}
      </div>

      {/* Modal de Ajuste */}
      <AjustarModel
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        producto={productoSeleccionado}
        tiposMovimiento={tiposMovimiento}
        onConfirm={handleConfirmarAjuste}
      />
    </div>
  );
}
