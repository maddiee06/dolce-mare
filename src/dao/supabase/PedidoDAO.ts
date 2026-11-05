import { SupabaseClient } from "@supabase/supabase-js";
import {
  IPedidoDAO,
  CrearPedidoInput,
  DetalleCobroMixto,
} from "../interfaces/IPedidoDAO";
import { PedidoRelacional } from "../../models/Pedido";

export class PedidoDAO implements IPedidoDAO {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Obtiene todos los pedidos abiertos o en preparación para una sede dada,
   * incluyendo sus relaciones con estados, tipos de entrega y detalle de productos.
   */
  async obtenerCuentasAbiertas(idSede: number): Promise<PedidoRelacional[]> {
    let query = this.supabase
      .from("pedidos")
      .select(
        `
        id_pedido,
        id_sede,
        id_cliente,
        id_estado_pedido,
        id_tipo_entrega,
        id_usuario_registra,
        direccion_entrega,
        fecha_pedido,
        fecha_entrega,
        total,
        observaciones,
        estados_pedido ( nombre ),
        tipos_entrega ( nombre ),
        detalle_pedido (
          id_detalle_pedido,
          id_pedido,
          id_producto,
          cantidad,
          precio_unitario,
          subtotal,
          productos ( id_producto, nombre )
        )
      `
      )
      .in("id_estado_pedido", [1, 2]) // 1: Abierto, 2: En preparación
      .order("fecha_pedido", { ascending: false });

    if (idSede > 0) {
      query = query.eq("id_sede", idSede);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error al obtener cuentas abiertas: ${error.message}`);
    }

    return (data as unknown as PedidoRelacional[]) || [];
  }

  /**
   * Inserta un nuevo pedido en la tabla 'pedidos' y sus líneas en 'detalle_pedido'.
   */
  async crearPedido(datos: CrearPedidoInput): Promise<PedidoRelacional> {
    // 1. Resolver productos para obtener sus IDs si no vienen provistos
    const nombresBuscar = datos.items
      .filter((i) => !i.id_producto && i.nombreProducto)
      .map((i) => i.nombreProducto);

    const mapaProductos = new Map<string, number>();

    if (nombresBuscar.length > 0) {
      const { data: productosData } = await this.supabase
        .from("productos")
        .select("id_producto, nombre");

      if (productosData) {
        productosData.forEach((p) => {
          mapaProductos.set(p.nombre.toLowerCase().trim(), p.id_producto);
        });
      }
    }

    // 2. Insertar pedido principal
    const { data: pedidoData, error: pedidoError } = await this.supabase
      .from("pedidos")
      .insert({
        id_sede: datos.id_sede,
        id_usuario_registra: datos.id_usuario_registra,
        id_estado_pedido: 1, // Abierto
        id_tipo_entrega: datos.id_tipo_entrega || 1,
        total: Number(datos.total.toFixed(2)),
        observaciones: datos.observaciones || "Mesa",
        direccion_entrega: datos.direccion_entrega || null,
      })
      .select()
      .single();

    if (pedidoError || !pedidoData) {
      throw new Error(`Error al crear pedido: ${pedidoError?.message}`);
    }

    const idPedido = pedidoData.id_pedido;

    // 3. Preparar filas de detalle_pedido
    const filasDetalle = datos.items.map((item) => {
      let idProducto = item.id_producto;
      if (!idProducto && item.nombreProducto) {
        idProducto =
          mapaProductos.get(item.nombreProducto.toLowerCase().trim()) || 1;
      }

      return {
        id_pedido: idPedido,
        id_producto: idProducto || 1,
        cantidad: item.cantidad,
        precio_unitario: Number(item.precio_unitario.toFixed(2)),
        subtotal: Number(item.subtotal.toFixed(2)),
      };
    });

    if (filasDetalle.length > 0) {
      const { error: detalleError } = await this.supabase
        .from("detalle_pedido")
        .insert(filasDetalle);

      if (detalleError) {
        console.error("Error al insertar detalle_pedido:", detalleError);
      }
    }

    // 4. Retornar el pedido completo con relaciones
    const { data: pedidoCompleto } = await this.supabase
      .from("pedidos")
      .select(
        `
        id_pedido,
        id_sede,
        id_cliente,
        id_estado_pedido,
        id_tipo_entrega,
        id_usuario_registra,
        direccion_entrega,
        fecha_pedido,
        fecha_entrega,
        total,
        observaciones,
        estados_pedido ( nombre ),
        tipos_entrega ( nombre ),
        detalle_pedido (
          id_detalle_pedido,
          id_pedido,
          id_producto,
          cantidad,
          precio_unitario,
          subtotal,
          productos ( id_producto, nombre )
        )
      `
      )
      .eq("id_pedido", idPedido)
      .single();

    return (pedidoCompleto as unknown as PedidoRelacional) || pedidoData;
  }

  /**
   * Finaliza el cobro de un pedido (soporta Efectivo, Tarjeta, Yape y Cobro Mixto):
   * 1. Actualiza el estado del pedido a Completado (id_estado_pedido = 3).
   * 2. Registra la venta en 'ventas' (id_estado_venta = 1 Pagado).
   * 3. Registra el detalle de la venta en 'detalle_venta'.
   * 4. Si hay caja abierta, registra el movimiento de efectivo ingresado a caja.
   */
  async cobrarPedido(
    idPedido: number,
    metodoPago: "efectivo" | "tarjeta" | "yape" | "mixto",
    idUsuario: number,
    idSede: number,
    detalleMixto?: DetalleCobroMixto
  ): Promise<{ id_venta: number }> {
    // 1. Obtener pedido actual y su detalle
    const { data: pedido, error: errPedido } = await this.supabase
      .from("pedidos")
      .select(
        `
        id_pedido,
        id_sede,
        id_cliente,
        total,
        observaciones,
        detalle_pedido (
          id_producto,
          cantidad,
          precio_unitario,
          subtotal
        )
      `
      )
      .eq("id_pedido", idPedido)
      .single();

    if (errPedido || !pedido) {
      throw new Error(`Pedido no encontrado: ${errPedido?.message}`);
    }

    const mapaMetodo: Record<string, number> = {
      efectivo: 1,
      tarjeta: 2,
      yape: 3,
      mixto: 5,
    };
    const idMetodoPago = mapaMetodo[metodoPago] || 1;

    const total = Number(pedido.total || 0);
    const subtotal = total / 1.18;
    const igv = total - subtotal;
    const sedeVenta = idSede > 0 ? idSede : pedido.id_sede || 1;

    // 2. Insertar en tabla ventas
    const { data: ventaData, error: errVenta } = await this.supabase
      .from("ventas")
      .insert({
        id_sede: sedeVenta,
        id_pedido: idPedido,
        id_cliente: pedido.id_cliente || null,
        id_usuario: idUsuario > 0 ? idUsuario : 1,
        id_estado_venta: 1, // 1: Pagado
        id_metodo_pago: idMetodoPago,
        fecha_venta: new Date().toISOString(),
        subtotal: parseFloat(subtotal.toFixed(2)),
        igv: parseFloat(igv.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
      })
      .select()
      .single();

    if (errVenta || !ventaData) {
      throw new Error(`Error al registrar venta: ${errVenta?.message}`);
    }

    // 3. Insertar líneas en detalle_venta
    type DetallePedidoRow = {
      id_producto: number;
      cantidad: number;
      precio_unitario: number;
      subtotal: number;
    };
    const lineas = (pedido.detalle_pedido as DetallePedidoRow[]) || [];
    if (lineas.length > 0) {
      const detalleVentaRows = lineas.map((linea) => ({
        id_venta: ventaData.id_venta,
        id_producto: linea.id_producto,
        cantidad: linea.cantidad,
        precio_unitario: linea.precio_unitario,
        descuento: 0,
        subtotal: linea.subtotal,
      }));

      await this.supabase.from("detalle_venta").insert(detalleVentaRows);
    }

    // 4. Si hay caja abierta en la sede, registrar movimiento de caja por la porción en efectivo
    const montoEfectivo =
      metodoPago === "efectivo"
        ? total
        : metodoPago === "mixto" && detalleMixto
        ? Number(detalleMixto.montoEfectivo || 0)
        : 0;

    if (montoEfectivo > 0) {
      const { data: cajaAbierta } = await this.supabase
        .from("cajas")
        .select("id_caja")
        .eq("id_sede", sedeVenta)
        .eq("id_estado_caja", 1) // 1: Abierta
        .order("fecha_apertura", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cajaAbierta?.id_caja) {
        await this.supabase.from("movimientos_caja").insert({
          id_caja: cajaAbierta.id_caja,
          id_tipo_mov_caja: 1, // 1: Ingreso
          id_venta: ventaData.id_venta,
          id_usuario: idUsuario > 0 ? idUsuario : 1,
          monto: parseFloat(montoEfectivo.toFixed(2)),
          descripcion:
            metodoPago === "mixto"
              ? `Venta #${ventaData.id_venta} - Cobro Mixto (Efectivo: S/ ${montoEfectivo.toFixed(2)})`
              : `Venta #${ventaData.id_venta} - Pago en Efectivo`,
        });
      }
    }

    // 5. Actualizar pedido a Completado (id_estado_pedido = 3)
    let obsActualizada = pedido.observaciones || "";
    if (metodoPago === "mixto" && detalleMixto) {
      obsActualizada += ` | Cobro Mixto: S/ ${detalleMixto.montoEfectivo.toFixed(2)} Efectivo + S/ ${detalleMixto.montoDigital.toFixed(2)} ${detalleMixto.metodoDigital}`;
    }

    await this.supabase
      .from("pedidos")
      .update({
        id_estado_pedido: 3, // 3: Completado
        observaciones: obsActualizada,
      })
      .eq("id_pedido", idPedido);

    return { id_venta: ventaData.id_venta };
  }
}
