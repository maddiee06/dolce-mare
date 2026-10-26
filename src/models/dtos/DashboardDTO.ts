export interface ITotalRow {
  total: number;
}

export interface IVentaDiaRow {
  fecha_venta: string;
  total: number;
}

export interface IDetalleSaborRow {
  cantidad: number;
  productos: {
    nombre: string;
    categorias: { nombre: string } | null;
  } | null;
}

export interface IMetodoPagoRow {
  total: number;
  metodos_pago: { nombre: string } | null;
}

export interface IVentaPersonalRow {
  total: number;
  usuarios: {
    id_usuario: number;
    nombres: string;
    apellidos: string;
  } | null;
}

export interface IAlertaStockRow {
  stock_actual: number;
  stock_minimo: number;
  productos: { nombre: string } | null;
}

export interface IMermaRow {
  cantidad: number;
  motivo: string;
  productos: { nombre: string } | null;
}
