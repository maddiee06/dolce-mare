export interface Producto {
  id_producto: number;
  id_categoria: number;
  codigo?: string;
  nombre: string;
  descripcion?: string;
  unidad_medida: string;
  precio_venta: number;
  imagen_url?: string;
  afecto_igv: boolean;
  estado: boolean;
  eliminado_en?: Date | string;
  creado_en: Date | string;
  actualizado_en: Date | string;
}
