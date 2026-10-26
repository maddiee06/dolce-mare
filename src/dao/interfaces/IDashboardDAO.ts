import {
  ITotalRow,
  IVentaDiaRow,
  IDetalleSaborRow,
  IMetodoPagoRow,
  IVentaPersonalRow,
  IAlertaStockRow,
  IMermaRow,
} from "../../models/dtos/DashboardDTO";

export interface IDashboardDAO {
  // Resumen General
  getVentasRango(
    fechaInicio: string,
    fechaFin: string,
    idSede: number,
  ): Promise<ITotalRow[]>;
  getCuentasAbiertas(idSede: number): Promise<ITotalRow[]>;

  // Evolución de Ventas
  getVentasUltimos7Dias(
    idSede: number,
    fechaInicio: string,
  ): Promise<IVentaDiaRow[]>;

  // Sabores y Métodos de Pago
  getDetallesVentaHoy(
    idSede: number,
    fechaInicio: string,
    fechaFin: string,
  ): Promise<IDetalleSaborRow[]>;
  getMetodosPagoHoy(
    idSede: number,
    fechaInicio: string,
    fechaFin: string,
  ): Promise<IMetodoPagoRow[]>;

  // Ranking de Personal
  getVentasPorPersonalHoy(
    idSede: number,
    fechaInicio: string,
    fechaFin: string,
  ): Promise<IVentaPersonalRow[]>;

  // Alertas Operativas
  getAlertasStock(idSede: number): Promise<IAlertaStockRow[]>;
  getMermasRecientes(idSede: number): Promise<IMermaRow[]>;
}
