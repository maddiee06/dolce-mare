export interface Venta {
  id_venta: number;
  id_sede: number;
  id_pedido?: number;
  id_cliente?: number;
  id_usuario: number;
  id_estado_venta: number;
  id_metodo_pago: number;
  fecha_venta: Date | string;
  subtotal: number;
  igv: number;
  total: number;
  eliminado_en?: Date | string;
  creado_en: Date | string;
}
