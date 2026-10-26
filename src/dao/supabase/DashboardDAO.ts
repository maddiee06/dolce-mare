import { SupabaseClient } from "@supabase/supabase-js";
import { IDashboardDAO } from "../interfaces/IDashboardDAO";
import {
  ITotalRow,
  IVentaDiaRow,
  IDetalleSaborRow,
  IMetodoPagoRow,
  IVentaPersonalRow,
  IAlertaStockRow,
  IMermaRow,
} from "../../models/dtos/DashboardDTO";

/**
 * DAO del Dashboard (Implementación Supabase)
 * Ejecuta todas las consultas SQL sobre las tablas de ventas, pedidos,
 * detalle de venta, métodos de pago, usuarios, stock y mermas.
 */
export class DashboardDAO implements IDashboardDAO {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Consulta los montos de ventas pagadas (id_estado_venta = 1) en una sede
   * dentro de un rango de fechas ISO específico.
   */
  async getVentasRango(
    fechaInicio: string,
    fechaFin: string,
    idSede: number,
  ): Promise<ITotalRow[]> {
    const { data, error } = await this.supabase
      .from("ventas")
      .select("total")
      .eq("id_estado_venta", 1)
      .eq("id_sede", idSede)
      .gte("fecha_venta", fechaInicio)
      .lte("fecha_venta", fechaFin);

    if (error) throw new Error(`Error en DAO Ventas: ${error.message}`);
    return (data as ITotalRow[]) || [];
  }

  /**
   * Consulta los pedidos que continúan como cuentas abiertas (id_estado_pedido = 1)
   * pendientes de cobro para una sede.
   */
  async getCuentasAbiertas(idSede: number): Promise<ITotalRow[]> {
    const { data, error } = await this.supabase
      .from("pedidos")
      .select("total")
      .eq("id_estado_pedido", 1)
      .eq("id_sede", idSede);

    if (error) throw new Error(`Error en DAO Pedidos: ${error.message}`);
    return (data as ITotalRow[]) || [];
  }

  /**
   * Consulta las ventas pagadas de los últimos 7 días con su fecha y monto
   * para armar la gráfica de evolución semanal.
   */
  async getVentasUltimos7Dias(
    idSede: number,
    fechaInicio: string,
  ): Promise<IVentaDiaRow[]> {
    const { data, error } = await this.supabase
      .from("ventas")
      .select("fecha_venta, total")
      .eq("id_estado_venta", 1)
      .eq("id_sede", idSede)
      .gte("fecha_venta", fechaInicio);

    if (error) throw new Error(error.message);
    return (data as IVentaDiaRow[]) || [];
  }

  /**
   * Consulta las líneas de detalle de ventas de hoy, incluyendo el nombre del producto
   * y su categoría, para generar el ranking de Top Sabores.
   */
  async getDetallesVentaHoy(
    idSede: number,
    fechaInicio: string,
    fechaFin: string,
  ): Promise<IDetalleSaborRow[]> {
    const { data, error } = await this.supabase
      .from("detalle_venta")
      .select(
        `
        cantidad,
        productos ( nombre, categorias ( nombre ) ),
        ventas!inner ( id_sede, fecha_venta, id_estado_venta )
      `,
      )
      .eq("ventas.id_sede", idSede)
      .eq("ventas.id_estado_venta", 1)
      .gte("ventas.fecha_venta", fechaInicio)
      .lte("ventas.fecha_venta", fechaFin);

    if (error) throw new Error(error.message);
    return (data as unknown as IDetalleSaborRow[]) || [];
  }

  /**
   * Consulta las ventas de hoy asociadas a su respectivo método de pago (Efectivo, Yape, Plin, etc.).
   */
  async getMetodosPagoHoy(
    idSede: number,
    fechaInicio: string,
    fechaFin: string,
  ): Promise<IMetodoPagoRow[]> {
    const { data, error } = await this.supabase
      .from("ventas")
      .select(
        `
        total,
        metodos_pago ( nombre )
      `,
      )
      .eq("id_estado_venta", 1)
      .eq("id_sede", idSede)
      .gte("fecha_venta", fechaInicio)
      .lte("fecha_venta", fechaFin);

    if (error) throw new Error(error.message);
    return (data as unknown as IMetodoPagoRow[]) || [];
  }

  /**
   * Consulta las ventas de hoy asociadas al personal que las registró
   * para elaborar el ranking de ventas y ticket promedio por colaborador.
   */
  async getVentasPorPersonalHoy(
    idSede: number,
    fechaInicio: string,
    fechaFin: string,
  ): Promise<IVentaPersonalRow[]> {
    const { data, error } = await this.supabase
      .from("ventas")
      .select(
        `
        total,
        usuarios ( id_usuario, nombres, apellidos )
      `,
      )
      .eq("id_estado_venta", 1)
      .eq("id_sede", idSede)
      .gte("fecha_venta", fechaInicio)
      .lte("fecha_venta", fechaFin);

    if (error) throw new Error(error.message);
    return (data as unknown as IVentaPersonalRow[]) || [];
  }

  /**
   * Consulta el inventario de la sede y filtra los productos cuyo stock actual
   * es menor o igual al stock mínimo configurado (alertas de reposición).
   */
  async getAlertasStock(idSede: number): Promise<IAlertaStockRow[]> {
    const { data, error } = await this.supabase
      .from("producto_sede")
      .select(
        `
        stock_actual,
        stock_minimo,
        productos ( nombre )
      `,
      )
      .eq("id_sede", idSede);

    if (error) throw new Error(error.message);

    const rows = (data as unknown as IAlertaStockRow[]) || [];

    // Filtra únicamente los productos que requieren atención inmediata
    const alertas = rows.filter(
      (item) => item.stock_actual <= item.stock_minimo,
    );

    return alertas;
  }

  /**
   * Consulta las 5 mermas más recientes registradas en la sede (productos dañados o descartados).
   */
  async getMermasRecientes(idSede: number): Promise<IMermaRow[]> {
    const { data, error } = await this.supabase
      .from("mermas")
      .select(
        `
        cantidad,
        motivo,
        productos ( nombre )
      `,
      )
      .eq("id_sede", idSede)
      .order("fecha_registro", { ascending: false })
      .limit(5);

    if (error) throw new Error(error.message);
    return (data as unknown as IMermaRow[]) || [];
  }
}
