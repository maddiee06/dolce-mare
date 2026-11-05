import { PedidoRelacional } from "../../models/Pedido";

export interface NuevoPedidoItemInput {
  nombreProducto: string;
  id_producto?: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface CrearPedidoInput {
  id_sede: number;
  id_usuario_registra: number;
  id_tipo_entrega?: number;
  observaciones?: string;
  direccion_entrega?: string | null;
  total: number;
  items: NuevoPedidoItemInput[];
}

export interface DetalleCobroMixto {
  montoEfectivo: number;
  montoDigital: number;
  metodoDigital: "tarjeta" | "yape";
}

export interface IPedidoDAO {
  obtenerCuentasAbiertas(idSede: number): Promise<PedidoRelacional[]>;
  crearPedido(datos: CrearPedidoInput): Promise<PedidoRelacional>;
  cobrarPedido(
    idPedido: number,
    metodoPago: "efectivo" | "tarjeta" | "yape" | "mixto",
    idUsuario: number,
    idSede: number,
    detalleMixto?: DetalleCobroMixto
  ): Promise<{ id_venta: number }>;
}
