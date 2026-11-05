"use client";

import React, { useState, useMemo, useEffect, useCallback, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import SeleccionCategoria from "../../components/cajero/SeleccionCategoria";
import { CuentasAbiertas, obtenerProductosTexto } from "../../components/cajero/CuentasAbiertas";
import { PedidoRelacional } from "../../models/Pedido";
import { FlujoPasos } from "../../components/cajero/FlujoPasos";
import { EnvaseCard } from "../../components/cajero/ProductosCard";
import { SaboresCard } from "../../components/cajero/SaboresCard";
import { ModalPago, CuentaCobrarInfo } from "./ModalPago";
import { DetalleCobroMixto } from "../../dao/interfaces/IPedidoDAO";
import { PlusCircle, Save, CheckCircle2, Truck, MapPin, ChevronUp, X as XIcon } from "lucide-react";

// ─── Datos de envases ─────────────────────────────────────────────
const envasesHelado = [
  { id: 1, titulo: "Vaso", slug: "vaso", descripcion: "Cómodo para disfrutar sin prisa.", nota: "240 ml · Envase incluido", imagen: "/envase/envasecremolada.jpg" },
  { id: 2, titulo: "Cono", slug: "cono", descripcion: "Crujiente hasta el último bocado.", nota: "Cono artesanal · Sin costo extra", imagen: "/envase/conohelado.jpg" },
  { id: 3, titulo: "Medio Litro", slug: "medio-litro", descripcion: "Para compartir tus sabores favoritos.", nota: "500 ml · Envase térmico incluido", imagen: "/envase/envasemedioL.jpg" },
  { id: 4, titulo: "Litro", slug: "litro", descripcion: "La cantidad ideal para toda la familia.", nota: "1000 ml · Envase térmico incluido", imagen: "/envase/envaseLitro.jpg" },
];

const envasesCremolada = [
  { id: 1, titulo: "Pequeño", slug: "pequeno", descripcion: "Cómodo para disfrutar sin prisa.", nota: "240 ml · Envase incluido", imagen: "/envase/envasecremolada.jpg" },
  { id: 2, titulo: "1/2 Litro", slug: "medio-litro", descripcion: "Cómodo para disfrutar sin prisa.", nota: "500 ml · Envase incluido", imagen: "/envase/envasemedioL.jpg" },
  { id: 3, titulo: "1 Litro", slug: "litro", descripcion: "Cómodo para disfrutar sin prisa.", nota: "1000 ml · Envase incluido", imagen: "/envase/envaseLitro.jpg" },
];

// ─── Opciones de precio/cantidad helado ────────────────────────────
function obtenerOpcionesHelado(envase: string) {
  if (envase === "vaso" || envase === "cono") {
    return [
      { id: 1, titulo: "1 Bola Clásico", descripcion: "1 sabor tradicional", precio: 9.00, capacidadMl: "Vaso/Cono", imagen: "/saboresHelado/1Sabor.jpg", maxSabores: 1 },
      { id: 2, titulo: "1 Bola Premium", descripcion: "1 sabor especial", precio: 12.00, capacidadMl: "Vaso/Cono", imagen: "/saboresHelado/1BolaPremium.jpg", maxSabores: 1 },
      { id: 3, titulo: "2 Bolas Clásico", descripcion: "Elige 2 sabores", precio: 15.00, capacidadMl: "Vaso/Cono", imagen: "/saboresHelado/2BolasClasicas.jpg", maxSabores: 2 },
      { id: 4, titulo: "2 Bolas Premium", descripcion: "Elige 2 sabores", precio: 17.00, capacidadMl: "Vaso/Cono", imagen: "/saboresHelado/2Sabores.jpg", maxSabores: 2 },
    ];
  }
  if (envase === "medio-litro") {
    return [
      { id: 5, titulo: "1/2 Litro Clásico", descripcion: "Sabores tradicionales", precio: 30.00, capacidadMl: "500 ml", imagen: "/saboresHelado/+3BolasClasicos.jpg", maxSabores: 2 },
      { id: 6, titulo: "1/2 Litro Premium", descripcion: "Sabores especiales", precio: 34.00, capacidadMl: "500 ml", imagen: "/saboresHelado/+3BolasPremium.jpg", maxSabores: 2 },
    ];
  }
  if (envase === "litro") {
    return [
      { id: 7, titulo: "1 Litro Clásico", descripcion: "Sabores tradicionales", precio: 58.00, capacidadMl: "1000 ml", imagen: "/saboresHelado/+3BolasClasicos.jpg", maxSabores: 2 },
      { id: 8, titulo: "1 Litro Premium", descripcion: "Sabores especiales", precio: 64.00, capacidadMl: "1000 ml", imagen: "/saboresHelado/+3BolasPremium.jpg", maxSabores: 2 },
    ];
  }
  return [];
}

// ─── Opciones de precio/cantidad cremolada ─────────────────────────
function obtenerOpcionesCremolada(envase: string) {
  if (envase === "pequeno") {
    return [
      { id: 1, titulo: "Clásico", descripcion: "Refrescante y natural", precio: 6.00, capacidadMl: "Pequeño", imagen: "/saboresCremolada/1SaborC.jpg", maxSabores: 1 },
      { id: 2, titulo: "Especial", descripcion: "Sabores exclusivos", precio: 8.00, capacidadMl: "Pequeño", imagen: "/saboresCremolada/CEspecialPequeña.jpg", maxSabores: 1 },
    ];
  }
  if (envase === "medio-litro") {
    return [
      { id: 3, titulo: "Clásico", descripcion: "Refrescante y natural", precio: 13.00, capacidadMl: "500 ml", imagen: "/saboresCremolada/CClasicaMediano.jpg", maxSabores: 2 },
      { id: 4, titulo: "Especial", descripcion: "Sabores exclusivos", precio: 18.00, capacidadMl: "500 ml", imagen: "/saboresCremolada/CEspecialMediano.jpg", maxSabores: 2 },
    ];
  }
  if (envase === "litro") {
    return [
      { id: 5, titulo: "Clásico", descripcion: "Refrescante y natural", precio: 24.00, capacidadMl: "1000 ml", imagen: "/saboresCremolada/CClasicaMediano.jpg", maxSabores: 2 },
      { id: 6, titulo: "Especial", descripcion: "Sabores exclusivos", precio: 30.00, capacidadMl: "1000 ml", imagen: "/saboresCremolada/CEspecialMediano.jpg", maxSabores: 2 },
    ];
  }
  return [];
}

// ─── Listas de sabores Dolce Mare ─────────────────────────────────
const SABORES_HELADO_PREMIUM = [
  "Pistaccio", "Ferrero", "Frambuesa Dubái", "Chocoteja", "Merengado de Chirimoya"
];

const SABORES_HELADO_CLASICO = [
  "Amarena", "Yogurt Griego + Arandanos", "MentaChips", "Stracciatella", "Cookies&Cream",
  "Maracuyá", "Frutos Rojos", "Chocolate", "Guayaba", "Piña Colada", "Guanabana con Stevia",
  "Uva Fragola", "CherryChic", "ChocoBrownie", "Queso Helado", "Arroz con Leche",
  "Gianduia", "Bayleis", "Ron con Pasas", "LucumaChips", "Algarrobina", "Higo",
  "Limon HierbaLuisa", "Sandía"
];

const SABORES_CREMOLADA_CLASICO = [
  "Fresa", "Limón", "Maracuyá", "Maracumango", "Tamarindo", "Piña",
  "Fresa con leche", "Lúcuma con leche", "Coco con leche", "Maní con leche"
];

const SABORES_CREMOLADA_ESPECIAL = [
  "Oreo", "Pie de limón", "Delicia de maracuyá"
];

type Categoria = "helados" | "cremoladas" | "postres" | "bebidas";

export interface PedidoItem {
  idTemp?: string;
  categoria: string;
  envase: string;
  opcion: string;
  precio: number;
  sabores: string[];
  conosExtra: number;
}

function CajeroContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ─── Estado del flujo ─────────────────────────────────────────────
  const [paso, setPaso] = useState(1);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<Categoria | null>(null);
  const [envaseSeleccionado, setEnvaseSeleccionado] = useState<string | null>(null);
  const [envaseTitulo, setEnvaseTitulo] = useState<string>("");
  const [opcionSeleccionada, setOpcionSeleccionada] = useState<{ titulo: string; precio: number; maxSabores: number } | null>(null);
  const [saboresSeleccionados, setSaboresSeleccionados] = useState<string[]>([]);
  const [cantidadCono, setCantidadCono] = useState(0);

  // ─── Carrito del pedido actual ────────────────────────────────────
  const [itemsPedido, setItemsPedido] = useState<PedidoItem[]>([]);
  const [referenciaCliente, setReferenciaCliente] = useState<string>("Mesa");
  const [tipoEntregaSeleccionado, setTipoEntregaSeleccionado] = useState<number>(1); // 1: Mesa, 2: Para llevar, 3: Delivery

  // ─── Lógica Especial de Delivery ──────────────────────────────────
  const [direccionDelivery, setDireccionDelivery] = useState<string>("");
  const [costoDelivery, setCostoDelivery] = useState<number>(5.00);
  const [modalidadDelivery, setModalidadDelivery] = useState<"cliente" | "directo_motorizado" | "tienda">("cliente");

  // ─── Cuentas Abiertas en BD ───────────────────────────────────────
  const [cuentasAbiertas, setCuentasAbiertas] = useState<PedidoRelacional[]>([]);
  const [cargandoCuentas, setCargandoCuentas] = useState(true);
  const [errorCuentas, setErrorCuentas] = useState<string | null>(null);
  const [guardandoPedido, setGuardandoPedido] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // ─── Bottom-sheet móvil (panel lateral en mobile) ─────────────────
  const [bottomSheetAbierto, setBottomSheetAbierto] = useState(false);

  // ─── Modal de Cobro ───────────────────────────────────────────────
  const [modalPagoAbierto, setModalPagoAbierto] = useState(false);
  const [cuentaACobrar, setCuentaACobrar] = useState<CuentaCobrarInfo | null>(null);

  // ─── Cargar pedidos abiertos desde Supabase vía API ───────────────
  const cargarCuentasAbiertas = useCallback(async () => {
    setCargandoCuentas(true);
    setErrorCuentas(null);
    try {
      const res = await fetch("/api/cajero/pedidos");
      const data = await res.json();
      if (res.ok && data.pedidos) {
        setCuentasAbiertas(data.pedidos);
      } else {
        setErrorCuentas(data.error || "No se pudieron obtener las cuentas.");
      }
    } catch (err: unknown) {
      console.error("Error al cargar cuentas:", err);
      setErrorCuentas("Error de conexión al cargar cuentas abiertas.");
    } finally {
      setCargandoCuentas(false);
    }
  }, []);

  useEffect(() => {
    cargarCuentasAbiertas();
  }, [cargarCuentasAbiertas]);

  // ─── Detectar si se agregó un producto desde Postres o Bebidas ─────
  useEffect(() => {
    const itemNombre = searchParams.get("agregar");
    const itemPrecio = searchParams.get("precio");
    const itemCat = searchParams.get("categoria") || "otros";

    if (itemNombre && itemPrecio) {
      const nuevoItem: PedidoItem = {
        idTemp: Math.random().toString(36).substring(2, 9),
        categoria: itemCat,
        envase: "Unidad",
        opcion: itemNombre,
        precio: parseFloat(itemPrecio) || 0,
        sabores: [itemNombre],
        conosExtra: 0,
      };

      setItemsPedido((prev) => [...prev, nuevoItem]);
      router.replace("/cajero");
    }
  }, [searchParams, router]);

  // Total acumulado de productos
  const totalProductos = useMemo(() => {
    const totalItems = itemsPedido.reduce((sum, item) => sum + item.precio + item.conosExtra * 1, 0);
    if (opcionSeleccionada) {
      return totalItems + opcionSeleccionada.precio + cantidadCono * 1;
    }
    return totalItems;
  }, [itemsPedido, opcionSeleccionada, cantidadCono]);

  // Recargo de delivery según modalidad
  const recargoDelivery = useMemo(() => {
    if (tipoEntregaSeleccionado === 3 && modalidadDelivery === "cliente") {
      return Number(costoDelivery || 0);
    }
    return 0;
  }, [tipoEntregaSeleccionado, modalidadDelivery, costoDelivery]);

  const totalCuentaNueva = useMemo(() => {
    return totalProductos + recargoDelivery;
  }, [totalProductos, recargoDelivery]);

  // ─── Manejo de Categorías (PUNTO 1: Rutas de Postres y Bebidas) ────
  const handleSeleccionarCategoria = (categoria: Categoria) => {
    if (categoria === "postres") {
      router.push("/cajero/postres");
      return;
    }
    if (categoria === "bebidas") {
      router.push("/cajero/bebidas");
      return;
    }

    setCategoriaSeleccionada(categoria);
    setEnvaseSeleccionado(null);
    setEnvaseTitulo("");
    setOpcionSeleccionada(null);
    setSaboresSeleccionados([]);
    setCantidadCono(0);
    setPaso(2);
  };

  const handleSeleccionarEnvase = (slug: string, titulo: string) => {
    setEnvaseSeleccionado(slug);
    setEnvaseTitulo(titulo);
    setOpcionSeleccionada(null);
    setSaboresSeleccionados([]);
    setPaso(3);
  };

  const handleSeleccionarOpcion = (opcion: { titulo: string; precio: number; maxSabores: number }) => {
    setOpcionSeleccionada(opcion);
    setSaboresSeleccionados([]);
    setPaso(4);
  };

  const handleToggleSabor = (sabor: string) => {
    setSaboresSeleccionados((prev) => {
      if (prev.includes(sabor)) {
        return prev.filter((s) => s !== sabor);
      }
      const max = opcionSeleccionada?.maxSabores ?? 2;
      if (prev.length >= max) return prev;
      return [...prev, sabor];
    });
  };

  // Construir ítem actual en configuración
  const construirItemActual = (): PedidoItem | null => {
    if (!categoriaSeleccionada || !envaseSeleccionado || !opcionSeleccionada) return null;
    const max = opcionSeleccionada.maxSabores ?? 2;
    if (saboresSeleccionados.length < max) return null;

    return {
      idTemp: Math.random().toString(36).substring(2, 9),
      categoria: categoriaSeleccionada,
      envase: envaseTitulo,
      opcion: opcionSeleccionada.titulo,
      precio: opcionSeleccionada.precio,
      sabores: [...saboresSeleccionados],
      conosExtra: cantidadCono,
    };
  };

  const limpiarItemEnConfiguracion = () => {
    setCategoriaSeleccionada(null);
    setEnvaseSeleccionado(null);
    setEnvaseTitulo("");
    setOpcionSeleccionada(null);
    setSaboresSeleccionados([]);
    setCantidadCono(0);
  };

  const handleAgregarAlPedido = () => {
    const item = construirItemActual();
    if (!item) return;

    setItemsPedido((prev) => [...prev, item]);
    limpiarItemEnConfiguracion();
    setPaso(1);
  };

  const handleEliminarItem = (index: number) => {
    setItemsPedido((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVolver = () => {
    if (paso === 4) {
      setOpcionSeleccionada(null);
      setSaboresSeleccionados([]);
      setPaso(3);
    } else if (paso === 3) {
      setEnvaseSeleccionado(null);
      setEnvaseTitulo("");
      setOpcionSeleccionada(null);
      setPaso(2);
    } else if (paso === 2) {
      limpiarItemEnConfiguracion();
      setPaso(1);
    }
  };

  const handleCancelarCuenta = () => {
    limpiarItemEnConfiguracion();
    setItemsPedido([]);
    setPaso(1);
  };

  // ─── Guardar pedido en Supabase (PUNTO 4 y 6) ─────────────────────
  const handleGuardarCuenta = async (incluirActualConfigurado = false) => {
    let itemsParaGuardar = [...itemsPedido];

    if (incluirActualConfigurado) {
      const itemActual = construirItemActual();
      if (itemActual) {
        itemsParaGuardar.push(itemActual);
      }
    }

    if (itemsParaGuardar.length === 0) {
      alert("Agrega al menos un ítem a la orden antes de guardar la cuenta.");
      return;
    }

    setGuardandoPedido(true);
    try {
      const lineasDetalle: {
        nombreProducto: string;
        cantidad: number;
        precio_unitario: number;
        subtotal: number;
      }[] = [];

      let totalCalculado = 0;

      itemsParaGuardar.forEach((item) => {
        const cantSabores = item.sabores.length || 1;
        const precioPorSabor = item.precio / cantSabores;

        item.sabores.forEach((sabor) => {
          lineasDetalle.push({
            nombreProducto: sabor,
            cantidad: 1,
            precio_unitario: precioPorSabor,
            subtotal: precioPorSabor,
          });
        });

        totalCalculado += item.precio;

        if (item.conosExtra > 0) {
          lineasDetalle.push({
            nombreProducto: "Conos",
            cantidad: item.conosExtra,
            precio_unitario: 1.00,
            subtotal: item.conosExtra * 1.00,
          });
          totalCalculado += item.conosExtra * 1.00;
        }
      });

      // Lógica especial de Delivery: añadir línea de servicio si es cobrado al cliente
      let obsFinal = referenciaCliente || "Mesa";
      if (tipoEntregaSeleccionado === 3) {
        const modTexto =
          modalidadDelivery === "cliente"
            ? "Cobrado al cliente"
            : modalidadDelivery === "directo_motorizado"
            ? "Pago contra entrega al repartidor"
            : "Asumido por la tienda (Gratis)";

        obsFinal = `${referenciaCliente || "Delivery"} | Envío: S/ ${Number(costoDelivery).toFixed(2)} (${modTexto})`;
        if (direccionDelivery) {
          obsFinal += ` | Dir: ${direccionDelivery}`;
        }

        if (modalidadDelivery === "cliente" && costoDelivery > 0) {
          lineasDetalle.push({
            nombreProducto: "Servicio de Delivery",
            cantidad: 1,
            precio_unitario: Number(costoDelivery),
            subtotal: Number(costoDelivery),
          });
          totalCalculado += Number(costoDelivery);
        }
      }

      const res = await fetch("/api/cajero/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          total: totalCalculado,
          observaciones: obsFinal,
          id_tipo_entrega: tipoEntregaSeleccionado,
          direccion_entrega: tipoEntregaSeleccionado === 3 ? direccionDelivery || null : null,
          items: lineasDetalle,
        }),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        setMensajeExito(`Cuenta guardada exitosamente (#${data.pedido?.id_pedido || ""})`);
        setTimeout(() => setMensajeExito(null), 4000);

        // Resetear todo al paso 1
        limpiarItemEnConfiguracion();
        setItemsPedido([]);
        setDireccionDelivery("");
        setPaso(1);

        // Actualizar lista de cuentas abiertas inmediatamente
        await cargarCuentasAbiertas();
      } else {
        alert(data.error || "No se pudo guardar la cuenta.");
      }
    } catch (err) {
      console.error("Error al guardar cuenta:", err);
      alert("Ocurrió un error al intentar registrar el pedido.");
    } finally {
      setGuardandoPedido(false);
    }
  };

  // ─── Acción de Cancelar pedido ────────────────────────────────────
  const handleCancelarPedido = async (idPedido: number, motivo: string) => {
    try {
      const res = await fetch("/api/cajero/cancelar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_pedido: idPedido, motivo }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Error al cancelar");
      setMensajeExito(`Pedido #${idPedido} cancelado.`);
      setTimeout(() => setMensajeExito(null), 3500);
      await cargarCuentasAbiertas();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al cancelar pedido");
    }
  };

  // ─── Acción de Cobrar pedido de Cuentas Abiertas (PUNTO 4 y 5) ─────
  const handleAbrirCobro = (pedido: PedidoRelacional) => {
    setCuentaACobrar({
      id_pedido: pedido.id_pedido,
      cliente: pedido.observaciones || pedido.cliente || "Mesa",
      total: Number(pedido.total || 0),
      detalle: obtenerProductosTexto(pedido),
    });
    setModalPagoAbierto(true);
  };

  const handleCompletarPago = async (
    idPedido: number,
    metodo: "efectivo" | "tarjeta" | "yape" | "mixto",
    detalleMixto?: DetalleCobroMixto
  ) => {
    const res = await fetch("/api/cajero/cobrar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_pedido: idPedido,
        metodo_pago: metodo,
        detalle_mixto: detalleMixto,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      throw new Error(data.error || "Error al completar la venta");
    }

    setMensajeExito(`¡Venta #${data.id_venta} completada con éxito!`);
    setTimeout(() => setMensajeExito(null), 4000);

    // Refrescar lista de pedidos abiertos
    await cargarCuentasAbiertas();
  };

  // ─── Datos dinámicos para los pasos ───────────────────────────────
  const envasesActuales = categoriaSeleccionada === "helados" ? envasesHelado : envasesCremolada;
  const opcionesActuales = envaseSeleccionado
    ? categoriaSeleccionada === "helados"
      ? obtenerOpcionesHelado(envaseSeleccionado)
      : obtenerOpcionesCremolada(envaseSeleccionado)
    : [];

  const esPremiumOEspecial =
    opcionSeleccionada?.titulo.toLowerCase().includes("premium") ||
    opcionSeleccionada?.titulo.toLowerCase().includes("especial");

  let saboresDisponibles: string[] = [];
  if (categoriaSeleccionada === "helados") {
    saboresDisponibles = esPremiumOEspecial ? SABORES_HELADO_PREMIUM : SABORES_HELADO_CLASICO;
  } else if (categoriaSeleccionada === "cremoladas") {
    saboresDisponibles = esPremiumOEspecial ? SABORES_CREMOLADA_ESPECIAL : SABORES_CREMOLADA_CLASICO;
  }

  const maxSabores = opcionSeleccionada?.maxSabores ?? 2;
  const categoriaTitulo = categoriaSeleccionada === "helados" ? "Helados" : "Cremoladas";
  const itemActualListo = Boolean(opcionSeleccionada && saboresSeleccionados.length === maxSabores);

  return (
    <div className="flex flex-col lg:flex-row w-full h-full min-h-[calc(100vh-65px)] bg-[#FAF8F5] overflow-y-auto lg:overflow-hidden relative">
      {/* Notificación flotante de éxito */}
      {mensajeExito && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 bg-[#d1fae5] border border-[#a7f3d0] text-[#065f46] px-5 py-3 rounded-2xl shadow-lg animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 size={20} className="text-[#065f46]" />
          <span className="font-bold text-sm">{mensajeExito}</span>
        </div>
      )}

      {/* ─── FAB móvil: abre el bottom-sheet de Cuentas Abiertas ─────── */}
      <button
        onClick={() => setBottomSheetAbierto(true)}
        className="lg:hidden fixed bottom-5 right-5 z-40 flex items-center gap-2 bg-[#2a4d8f] text-white px-4 py-3 rounded-2xl shadow-xl font-bold text-sm"
      >
        <ChevronUp size={18} />
        <span>
          Cuentas
          {cuentasAbiertas.length > 0 && (
            <span className="ml-1.5 bg-[#e8956b] text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full">
              {cuentasAbiertas.length}
            </span>
          )}
        </span>
      </button>

      {/* ─── BOTTOM SHEET MÓVIL: Cuentas Abiertas / Cuenta Nueva ──────── */}
      {bottomSheetAbierto && (
        <div className="lg:hidden fixed inset-0 z-40 flex flex-col justify-end">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setBottomSheetAbierto(false)}
          />
          {/* Panel */}
          <div className="relative bg-white rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>
            {/* Botón cerrar */}
            <button
              onClick={() => setBottomSheetAbierto(false)}
              className="absolute top-3 right-4 p-1.5 rounded-xl hover:bg-gray-100 cursor-pointer"
            >
              <XIcon size={18} className="text-[#8a8580]" />
            </button>
            {/* Contenido */}
            <div className="overflow-y-auto flex-1">
              {paso === 1 && itemsPedido.length === 0 ? (
                <CuentasAbiertas
                  pedidos={cuentasAbiertas}
                  cargando={cargandoCuentas}
                  error={errorCuentas}
                  onCobrar={(p) => { setBottomSheetAbierto(false); handleAbrirCobro(p); }}
                  onRecargar={cargarCuentasAbiertas}
                  onCancelar={handleCancelarPedido}
                />
              ) : (
                <CuentaNueva
                  paso={paso}
                  categoriaSeleccionada={categoriaSeleccionada}
                  envaseTitulo={envaseTitulo}
                  opcionSeleccionada={opcionSeleccionada}
                  saboresSeleccionados={saboresSeleccionados}
                  cantidadCono={cantidadCono}
                  itemsPedido={itemsPedido}
                  totalCuentaNueva={totalCuentaNueva}
                  referenciaCliente={referenciaCliente}
                  setReferenciaCliente={setReferenciaCliente}
                  tipoEntregaSeleccionado={tipoEntregaSeleccionado}
                  setTipoEntregaSeleccionado={setTipoEntregaSeleccionado}
                  direccionDelivery={direccionDelivery}
                  setDireccionDelivery={setDireccionDelivery}
                  costoDelivery={costoDelivery}
                  setCostoDelivery={setCostoDelivery}
                  modalidadDelivery={modalidadDelivery}
                  setModalidadDelivery={setModalidadDelivery}
                  onEliminarItem={handleEliminarItem}
                  onGuardarCuenta={() => { handleGuardarCuenta(itemActualListo); setBottomSheetAbierto(false); }}
                  onCancelar={() => { handleCancelarCuenta(); setBottomSheetAbierto(false); }}
                  guardando={guardandoPedido}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── FLUJO PRINCIPAL DE PASOS (A la IZQUIERDA / CENTRO) ─────────── */}
      <section className="flex-1 flex justify-center p-4 md:p-8 overflow-y-auto pb-24 lg:pb-8">
        {paso === 1 && (
          <div className="w-full max-w-[900px]">
            <SeleccionCategoria onSelectCategoria={handleSeleccionarCategoria} />
          </div>
        )}

        {paso === 2 && categoriaSeleccionada && (
          <div className="w-full max-w-[900px] flex flex-col gap-6">
            <div>
              <button
                onClick={handleVolver}
                className="text-[#2a4d8f] text-sm font-semibold mb-4 flex items-center gap-2 hover:underline w-fit cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Volver a categorías
              </button>
              <h1 className="text-[32px] font-bold text-[#2d2a26] mb-1">Elige tu envase</h1>
              <p className="text-[#8a8580] text-sm md:text-base">
                {categoriaTitulo} artesanales · La misma cremosidad, a tu manera.
              </p>
            </div>

            <div className="py-2"><FlujoPasos pasoActual={2} /></div>

            <h2 className="text-2xl font-bold text-[#2d2a26] mt-2">{categoriaTitulo.toUpperCase()}</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {envasesActuales.map((envase) => (
                <EnvaseCard
                  key={envase.id}
                  titulo={envase.titulo}
                  descripcion={envase.descripcion}
                  nota={envase.nota}
                  imagen={envase.imagen}
                  onSelect={() => handleSeleccionarEnvase(envase.slug, envase.titulo)}
                />
              ))}
            </div>

            {categoriaSeleccionada === "helados" && (
              <div className="bg-white rounded-2xl p-5 border border-transparent hover:border-[#fbe8dd] transition-colors shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
                <div className="flex items-center gap-4">
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image src="/conohelado.jpg" alt="Cono extra" fill className="object-cover" />
                  </div>
                  <div>
                    <h3 className="text-[#2a4d8f] font-bold text-lg">Cono adicional</h3>
                    <p className="text-[#8a8580] text-sm">
                      Agrega otro cono artesanal a tu pedido por <span className="text-[#2d2a26] font-medium">+ S/ 1.00</span>.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3 shrink-0">
                  <span className="bg-[#fbe8dd] text-[#e8956b] font-bold text-sm px-3 py-1 rounded-full">
                    + S/ {(cantidadCono * 1).toFixed(2)}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center bg-gray-50 rounded-full border border-gray-200 p-1">
                      <button
                        onClick={() => setCantidadCono((c) => Math.max(0, c - 1))}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-medium text-[#2d2a26]">{cantidadCono}</span>
                      <button
                        onClick={() => setCantidadCono((c) => c + 1)}
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-[#fbe8dd] text-[#e8956b] hover:bg-[#e8956b] hover:text-white transition-colors cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="h-9 w-full shrink-0" aria-hidden="true" />
          </div>
        )}

        {paso === 3 && envaseSeleccionado && (
          <div className="w-full max-w-[900px] flex flex-col gap-6">
            <div>
              <button
                onClick={handleVolver}
                className="text-[#2a4d8f] text-sm font-semibold mb-4 flex items-center gap-2 hover:underline w-fit cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Cambiar envase
              </button>
              <h1 className="text-[32px] font-bold text-[#2d2a26] mb-1">Elige tu tamaño / opción</h1>
              <p className="text-[#8a8580] text-sm md:text-base capitalize">
                {categoriaTitulo} en {envaseSeleccionado.replace("-", " ")} · {categoriaSeleccionada === "helados" ? "Clásico o Premium" : "Clásica o Especial"}.
              </p>
            </div>

            <div className="py-2"><FlujoPasos pasoActual={3} /></div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {opcionesActuales.map((opcion) => (
                <SaboresCard
                  key={opcion.id}
                  titulo={opcion.titulo}
                  descripcion={opcion.descripcion}
                  precio={opcion.precio}
                  capacidadMl={opcion.capacidadMl}
                  imagen={opcion.imagen}
                  onSelect={() => handleSeleccionarOpcion({ titulo: opcion.titulo, precio: opcion.precio, maxSabores: opcion.maxSabores })}
                />
              ))}
            </div>
            <div className="h-9 w-full shrink-0" aria-hidden="true" />
          </div>
        )}

        {paso === 4 && opcionSeleccionada && (
          <div className="w-full max-w-[900px] flex flex-col gap-6">
            <div>
              <button
                onClick={handleVolver}
                className="text-[#2a4d8f] text-sm font-semibold mb-4 flex items-center gap-2 hover:underline w-fit cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Cambiar opción
              </button>
              <h1 className="text-[32px] font-bold text-[#2d2a26] mb-1">Elige tus sabores</h1>
              <p className="text-[#8a8580] text-sm md:text-base">
                {opcionSeleccionada.titulo} · Selecciona {maxSabores} {maxSabores === 1 ? "sabor" : "sabores"}.
              </p>
            </div>

            <div className="py-2"><FlujoPasos pasoActual={4} /></div>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#8a8580]">Sabores seleccionados:</span>
              <span className={`font-bold ${saboresSeleccionados.length === maxSabores ? "text-green-600" : "text-[#e8956b]"}`}>
                {saboresSeleccionados.length} / {maxSabores}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {saboresDisponibles.map((sabor) => {
                const isSelected = saboresSeleccionados.includes(sabor);
                const isDisabled = !isSelected && saboresSeleccionados.length >= maxSabores;

                return (
                  <button
                    key={sabor}
                    onClick={() => handleToggleSabor(sabor)}
                    disabled={isDisabled}
                    className={`
                      p-4 rounded-xl border-2 text-sm font-semibold transition-all cursor-pointer
                      ${isSelected
                        ? "border-[#e8956b] bg-[#fbe8dd] text-[#e8956b] shadow-md"
                        : isDisabled
                          ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
                          : "border-gray-200 bg-white text-[#2d2a26] hover:border-[#e8956b] hover:bg-[#fef7f2]"
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span>{sabor}</span>
                      {isSelected && <span className="text-[#e8956b] text-lg font-bold">✓</span>}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* BOTONES CLAROS PARA AGREGAR O GUARDAR CUENTA */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={handleAgregarAlPedido}
                disabled={saboresSeleccionados.length < maxSabores}
                className={`
                  w-full sm:w-auto px-6 py-3 rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer
                  ${saboresSeleccionados.length === maxSabores
                    ? "bg-[#2a4d8f] text-white hover:bg-[#203a6d] shadow-sm"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }
                `}
              >
                <PlusCircle size={18} />
                <span>+ Agregar otro ítem al pedido</span>
              </button>

              <button
                onClick={() => handleGuardarCuenta(true)}
                disabled={saboresSeleccionados.length < maxSabores || guardandoPedido}
                className={`
                  w-full sm:w-auto px-8 py-3 rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md
                  ${saboresSeleccionados.length === maxSabores && !guardandoPedido
                    ? "bg-[#e8956b] text-white hover:bg-[#d88258]"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                  }
                `}
              >
                <Save size={18} />
                <span>{guardandoPedido ? "Guardando cuenta..." : "Guardar cuenta"}</span>
              </button>
            </div>
            <div className="h-9 w-full shrink-0" aria-hidden="true" />
          </div>
        )}
      </section>

      {/* ─── PANEL LATERAL DERECHO: Cuentas Abiertas / Cuenta Nueva (A LA DERECHA) ─── */}
      <aside className="w-full lg:w-[380px] xl:w-[420px] shrink-0 border-t lg:border-t-0 lg:border-l border-gray-200 bg-white h-full overflow-y-auto">
        {paso === 1 && itemsPedido.length === 0 ? (
          <CuentasAbiertas
            pedidos={cuentasAbiertas}
            cargando={cargandoCuentas}
            error={errorCuentas}
            onCobrar={handleAbrirCobro}
            onRecargar={cargarCuentasAbiertas}
          />
        ) : (
          <CuentaNueva
            paso={paso}
            categoriaSeleccionada={categoriaSeleccionada}
            envaseTitulo={envaseTitulo}
            opcionSeleccionada={opcionSeleccionada}
            saboresSeleccionados={saboresSeleccionados}
            cantidadCono={cantidadCono}
            itemsPedido={itemsPedido}
            totalCuentaNueva={totalCuentaNueva}
            referenciaCliente={referenciaCliente}
            setReferenciaCliente={setReferenciaCliente}
            tipoEntregaSeleccionado={tipoEntregaSeleccionado}
            setTipoEntregaSeleccionado={setTipoEntregaSeleccionado}
            direccionDelivery={direccionDelivery}
            setDireccionDelivery={setDireccionDelivery}
            costoDelivery={costoDelivery}
            setCostoDelivery={setCostoDelivery}
            modalidadDelivery={modalidadDelivery}
            setModalidadDelivery={setModalidadDelivery}
            onEliminarItem={handleEliminarItem}
            onGuardarCuenta={() => handleGuardarCuenta(itemActualListo)}
            onCancelar={handleCancelarCuenta}
            guardando={guardandoPedido}
          />
        )}
      </aside>

      {/* ─── MODAL DE PAGO (PUNTO 5: Soporta Cobro Mixto) ──────────── */}
      <ModalPago
        isOpen={modalPagoAbierto}
        cuenta={cuentaACobrar}
        onClose={() => {
          setModalPagoAbierto(false);
          setCuentaACobrar(null);
        }}
        onCompletarPago={handleCompletarPago}
      />
    </div>
  );
}

// ─── Componente Sidebar: Cuenta Nueva en Configuración ──────────────
function CuentaNueva({
  paso,
  categoriaSeleccionada,
  envaseTitulo,
  opcionSeleccionada,
  saboresSeleccionados,
  cantidadCono,
  itemsPedido,
  totalCuentaNueva,
  referenciaCliente,
  setReferenciaCliente,
  tipoEntregaSeleccionado,
  setTipoEntregaSeleccionado,
  direccionDelivery,
  setDireccionDelivery,
  costoDelivery,
  setCostoDelivery,
  modalidadDelivery,
  setModalidadDelivery,
  onEliminarItem,
  onGuardarCuenta,
  onCancelar,
  guardando,
}: {
  paso: number;
  categoriaSeleccionada: Categoria | null;
  envaseTitulo: string;
  opcionSeleccionada: { titulo: string; precio: number } | null;
  saboresSeleccionados: string[];
  cantidadCono: number;
  itemsPedido: PedidoItem[];
  totalCuentaNueva: number;
  referenciaCliente: string;
  setReferenciaCliente: (val: string) => void;
  tipoEntregaSeleccionado: number;
  setTipoEntregaSeleccionado: (val: number) => void;
  direccionDelivery: string;
  setDireccionDelivery: (val: string) => void;
  costoDelivery: number;
  setCostoDelivery: (val: number) => void;
  modalidadDelivery: "cliente" | "directo_motorizado" | "tienda";
  setModalidadDelivery: (val: "cliente" | "directo_motorizado" | "tienda") => void;
  onEliminarItem: (index: number) => void;
  onGuardarCuenta: () => void;
  onCancelar: () => void;
  guardando: boolean;
}) {
  const hayItems = itemsPedido.length > 0;
  const hayItemEnProceso = Boolean(opcionSeleccionada);

  return (
    <div className="flex flex-col h-full p-4 md:p-5 gap-3.5">
      {/* Encabezado */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
          <h2 className="text-base font-bold text-[#2a4d8f]">Cuenta en Curso</h2>
        </div>
        <button
          onClick={onCancelar}
          className="text-xs font-semibold text-[#8a8580] hover:text-red-500 transition-colors cursor-pointer"
        >
          ✕ Cancelar
        </button>
      </div>

      {/* Selector de Referencia y Tipo de Entrega */}
      <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-gray-100 flex flex-col gap-2.5">
        <div>
          <label className="text-[11px] font-bold text-[#8a8580] uppercase tracking-wider block mb-1">
            Referencia / Mesa
          </label>
          <input
            type="text"
            value={referenciaCliente}
            onChange={(e) => setReferenciaCliente(e.target.value)}
            placeholder="Ej. Mesa 3, Para llevar, Juan..."
            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-[#2d2a26] focus:outline-none focus:border-[#e8956b]"
          />
        </div>

        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setTipoEntregaSeleccionado(1)}
            className={`flex-1 py-1 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              tipoEntregaSeleccionado === 1
                ? "bg-[#2a4d8f] text-white shadow-xs"
                : "bg-white border border-gray-200 text-[#8a8580] hover:bg-gray-50"
            }`}
          >
            Mesa
          </button>
          <button
            type="button"
            onClick={() => setTipoEntregaSeleccionado(2)}
            className={`flex-1 py-1 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              tipoEntregaSeleccionado === 2
                ? "bg-[#2a4d8f] text-white shadow-xs"
                : "bg-white border border-gray-200 text-[#8a8580] hover:bg-gray-50"
            }`}
          >
            Llevar
          </button>
          <button
            type="button"
            onClick={() => setTipoEntregaSeleccionado(3)}
            className={`flex-1 py-1 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              tipoEntregaSeleccionado === 3
                ? "bg-[#2a4d8f] text-white shadow-xs"
                : "bg-white border border-gray-200 text-[#8a8580] hover:bg-gray-50"
            }`}
          >
            Delivery
          </button>
        </div>

        {/* LÓGICA ESPECIAL PARA DELIVERY (PUNTO 6) */}
        {tipoEntregaSeleccionado === 3 && (
          <div className="mt-1 pt-2 border-t border-gray-200 flex flex-col gap-2 bg-white p-2.5 rounded-xl border border-blue-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#2a4d8f]">
              <Truck size={15} />
              <span>Detalles del Envío</span>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-[#8a8580] block mb-0.5">
                Dirección de entrega
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={direccionDelivery}
                  onChange={(e) => setDireccionDelivery(e.target.value)}
                  placeholder="Calle, número, urbanización o referencia"
                  className="w-full pl-6 pr-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#e8956b]"
                />
                <MapPin size={12} className="absolute left-1.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="flex justify-between items-center gap-2">
              <label className="text-[10px] font-semibold text-[#8a8580]">
                Costo Delivery (S/):
              </label>
              <input
                type="number"
                step="0.50"
                min="0"
                value={costoDelivery}
                onChange={(e) => setCostoDelivery(parseFloat(e.target.value) || 0)}
                className="w-20 text-right font-bold text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-[#e8956b]"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold text-[#8a8580] block mb-1">
                ¿Cómo se asume el envío?
              </label>
              <div className="flex flex-col gap-1 text-[11px]">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="modalidadDelivery"
                    checked={modalidadDelivery === "cliente"}
                    onChange={() => setModalidadDelivery("cliente")}
                    className="accent-[#2a4d8f]"
                  />
                  <span>Cobrado al cliente (+S/ {costoDelivery.toFixed(2)})</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="modalidadDelivery"
                    checked={modalidadDelivery === "directo_motorizado"}
                    onChange={() => setModalidadDelivery("directo_motorizado")}
                    className="accent-[#2a4d8f]"
                  />
                  <span>Pago directo al repartidor</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="modalidadDelivery"
                    checked={modalidadDelivery === "tienda"}
                    onChange={() => setModalidadDelivery("tienda")}
                    className="accent-[#2a4d8f]"
                  />
                  <span>Asumido por tienda (Gratis)</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tarjeta de Importe Total */}
      <div className="bg-[#f7f4ef] rounded-2xl p-3.5 border border-[#eee9e2]">
        <div className="flex justify-between items-baseline">
          <p className="text-[#8a8580] text-xs font-medium">Total a cobrar</p>
          {tipoEntregaSeleccionado === 3 && modalidadDelivery === "cliente" && costoDelivery > 0 && (
            <span className="text-[10px] text-green-700 font-bold bg-green-50 px-1.5 py-0.5 rounded">
              Incluye envío S/ {costoDelivery.toFixed(2)}
            </span>
          )}
        </div>
        <p className="text-[#2d2a26] text-3xl font-extrabold mt-0.5">
          S/ {totalCuentaNueva.toFixed(2)}
        </p>
      </div>

      {/* Lista de Ítems ya confirmados */}
      {hayItems && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold text-[#8a8580] uppercase tracking-wider">
            Ítems en esta orden ({itemsPedido.length})
          </p>
          <div className="flex flex-col gap-2 max-h-[140px] overflow-y-auto pr-1">
            {itemsPedido.map((item, index) => (
              <div
                key={item.idTemp || index}
                className="bg-white border border-gray-100 rounded-xl p-2.5 flex flex-col gap-0.5 shadow-xs relative group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-[#2d2a26]">{item.opcion}</p>
                    <p className="text-[11px] text-[#8a8580] capitalize">
                      {item.categoria} · {item.envase}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#2a4d8f]">
                      S/ {(item.precio + item.conosExtra * 1).toFixed(2)}
                    </span>
                    <button
                      onClick={() => onEliminarItem(index)}
                      className="text-gray-300 hover:text-red-500 text-xs cursor-pointer p-0.5"
                      title="Eliminar ítem"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                {item.sabores.length > 0 && (
                  <p className="text-[11px] text-[#8a8580] line-clamp-1">
                    🍦 {item.sabores.join(", ")}
                    {item.conosExtra > 0 && ` · +${item.conosExtra} cono(s)`}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ítem en configuración actual */}
      {hayItemEnProceso && (
        <div className="flex flex-col gap-2 flex-1">
          <p className="text-xs font-bold text-[#8a8580] uppercase tracking-wider">
            {hayItems ? "Configurando siguiente ítem" : "Configurando ítem"}
          </p>

          {categoriaSeleccionada && (
            <div className="flex items-center gap-2 bg-[#fef7f2] rounded-xl p-2 border border-[#fbe8dd]">
              <span className="w-6 h-6 bg-[#fbe8dd] rounded-full flex items-center justify-center text-xs">🍨</span>
              <div className="flex-1">
                <p className="text-[10px] text-[#8a8580]">Categoría</p>
                <p className="text-xs font-bold text-[#2d2a26] capitalize">{categoriaSeleccionada}</p>
              </div>
            </div>
          )}

          {envaseTitulo && (
            <div className="flex items-center gap-2 bg-[#fef7f2] rounded-xl p-2 border border-[#fbe8dd]">
              <span className="w-6 h-6 bg-[#fbe8dd] rounded-full flex items-center justify-center text-xs">📦</span>
              <div className="flex-1">
                <p className="text-[10px] text-[#8a8580]">Envase</p>
                <p className="text-xs font-bold text-[#2d2a26]">{envaseTitulo}</p>
              </div>
            </div>
          )}

          {opcionSeleccionada && (
            <div className="flex items-center gap-2 bg-[#fef7f2] rounded-xl p-2 border border-[#fbe8dd]">
              <span className="w-6 h-6 bg-[#fbe8dd] rounded-full flex items-center justify-center text-xs">💰</span>
              <div className="flex-1">
                <p className="text-[10px] text-[#8a8580]">Opción</p>
                <p className="text-xs font-bold text-[#2d2a26]">{opcionSeleccionada.titulo}</p>
              </div>
              <span className="text-xs font-bold text-[#e8956b]">S/ {opcionSeleccionada.precio.toFixed(2)}</span>
            </div>
          )}

          {cantidadCono > 0 && (
            <div className="flex items-center gap-2 bg-[#fef7f2] rounded-xl p-2 border border-[#fbe8dd]">
              <span className="w-6 h-6 bg-[#fbe8dd] rounded-full flex items-center justify-center text-xs">🍦</span>
              <div className="flex-1">
                <p className="text-[10px] text-[#8a8580]">Conos adicionales</p>
                <p className="text-xs font-bold text-[#2d2a26]">{cantidadCono} cono(s)</p>
              </div>
              <span className="text-xs font-bold text-[#e8956b]">+ S/ {(cantidadCono * 1).toFixed(2)}</span>
            </div>
          )}

          {saboresSeleccionados.length > 0 && (
            <div className="flex items-center gap-2 bg-[#fef7f2] rounded-xl p-2 border border-[#fbe8dd]">
              <span className="w-6 h-6 bg-[#fbe8dd] rounded-full flex items-center justify-center text-xs">🎨</span>
              <div className="flex-1">
                <p className="text-[10px] text-[#8a8580]">Sabores</p>
                <p className="text-xs font-bold text-[#2d2a26]">{saboresSeleccionados.join(", ")}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Botón inferior Guardar Cuenta */}
      <div className="mt-auto pt-2 border-t border-gray-100 flex flex-col gap-2">
        <button
          onClick={onGuardarCuenta}
          disabled={(!hayItems && !opcionSeleccionada) || guardando}
          className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
            (hayItems || opcionSeleccionada) && !guardando
              ? "bg-[#e8956b] hover:bg-[#d88258] text-white"
              : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
          }`}
        >
          <Save size={18} />
          <span>
            {guardando
              ? "Guardando cuenta..."
              : `Guardar cuenta (${hayItems ? itemsPedido.length : 1} ${
                  (hayItems ? itemsPedido.length : 1) === 1 ? "ítem" : "ítems"
                })`}
          </span>
        </button>
      </div>
    </div>
  );
}

export default function CajeroPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#8a8580]">Cargando vista de cajero...</div>}>
      <CajeroContent />
    </Suspense>
  );
}
