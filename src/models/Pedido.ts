export interface RelacionNombre {
  nombre: string;
}

export interface DetallePedidoItem {
  id_detalle_pedido?: number;
  id_pedido?: number;
  id_producto: number;
  cantidad: number | string;
  precio_unitario?: number | string;
  subtotal?: number | string;
  productos?:
    | RelacionNombre
    | RelacionNombre[]
    | { id_producto?: number; nombre: string }
    | null;
}

export interface PedidoRelacional {
  id_pedido: number;
  id_sede?: number;
  id_cliente?: number | null;
  id_estado_pedido?: number;
  id_tipo_entrega?: number;
  id_usuario_registra?: number;
  direccion_entrega?: string | null;
  fecha_pedido: string | null;
  fecha_entrega?: string | null;
  total: number | string | null;
  observaciones?: string | null;
  estados_pedido?: RelacionNombre | RelacionNombre[] | string | null;
  tipos_entrega?: RelacionNombre | RelacionNombre[] | string | null;
  entrega?: RelacionNombre | RelacionNombre[] | string | null;
  detalle_pedido?: DetallePedidoItem[] | null;
  cliente?: string | null;
  detalle?: string | null;
  tipo_entrega?: string | null;
  estado?: string | null;
}
