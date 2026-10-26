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

export class DashboardDAO implements IDashboardDAO {
  constructor(private supabase: SupabaseClient) {}

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

  async getCuentasAbiertas(idSede: number): Promise<ITotalRow[]> {
    const { data, error } = await this.supabase
      .from("pedidos")
      .select("total")
      .eq("id_estado_pedido", 1)
      .eq("id_sede", idSede);

    if (error) throw new Error(`Error en DAO Pedidos: ${error.message}`);
    return (data as ITotalRow[]) || [];
  }

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

    const alertas = rows.filter(
      (item) => item.stock_actual <= item.stock_minimo,
    );

    return alertas;
  }

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
