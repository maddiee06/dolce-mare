import type { SupabaseClient } from "@supabase/supabase-js";
import type { IInventarioDAO } from "../../dao/interfaces/IInventarioDAO";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.SESSION_SECRET);
import {
  InventarioError,
  type AfectaStock,
  type ContextoUsuario,
  type FilaStock,
  type MovimientoKardex,
  type NuevoMovimiento,
  type ResultadoMovimiento,
  type TipoMovimiento,
} from "../../models/Inventario";
import { normalizar } from "../../utils/estadoStock";

interface FilaStockRaw {
  id_producto_sede: number;
  id_producto: number;
  stock_actual: number | string;
  stock_minimo: number | string;
  disponible: boolean;
  productos: {
    nombre: string;
    unidad_medida: string;
    categorias: { nombre: string };
  };
}

interface FilaKardexRaw {
  id_movimiento: number;
  cantidad: number | string;
  stock_anterior: number | string;
  stock_resultante: number | string;
  motivo: string | null;
  fecha_movimiento: string;
  tipos_movimiento_inventario: { nombre: string; afecta_stock: AfectaStock };
  usuarios: { nombres: string; apellidos: string } | null;
}

const SELECT_STOCK = `
  id_producto_sede, id_producto, stock_actual, stock_minimo, disponible,
  productos!inner (
    nombre, unidad_medida, estado, eliminado_en,
    categorias!inner ( nombre )
  )
`;

const redondear = (n: number) => Math.round(n * 100) / 100;

export class InventarioDAO implements IInventarioDAO {
  constructor(private readonly supabase: SupabaseClient) {}

  private fallo(accion: string, error: { message: string }): InventarioError {
    console.error(`[InventarioDAO] No se pudo ${accion}:`, error.message);
    return new InventarioError(`No se pudo ${accion}`, 500);
  }

  private mapearStock(f: FilaStockRaw): FilaStock {
    return {
      idProductoSede: f.id_producto_sede,
      idProducto: f.id_producto,
      nombre: f.productos.nombre,
      unidadMedida: f.productos.unidad_medida,
      categoria: f.productos.categorias.nombre,
      stockActual: Number(f.stock_actual),
      stockMinimo: Number(f.stock_minimo),
      disponible: f.disponible,
    };
  }

  async obtenerContextoUsuario(): Promise<ContextoUsuario | null> {
    const token = (await cookies()).get("session")?.value;
    if (!token) return null;

    let idUsuario: number;
    try {
      const { payload } = await jwtVerify(token, secret, {
        algorithms: ["HS256"],
      });
      idUsuario = Number(payload.sub);
    } catch {
      return null; // token inválido o expirado
    }
    if (!Number.isInteger(idUsuario) || idUsuario <= 0) return null;

    const { data, error } = await this.supabase
      .from("usuarios")
      .select(
        "id_usuario, nombres, apellidos, estado, eliminado_en, roles ( nombre )",
      )
      .eq("id_usuario", idUsuario)
      .maybeSingle();

    if (error) throw this.fallo("identificar al usuario", error);
    if (!data || !data.estado || data.eliminado_en) return null;

    const roles = data.roles as unknown;
    const rol =
      (Array.isArray(roles)
        ? roles[0]?.nombre
        : (roles as { nombre: string } | null)?.nombre) ?? "";

    return {
      idUsuario: data.id_usuario,
      nombre: `${data.nombres} ${data.apellidos}`.trim(),
      rol,
      esAdmin: normalizar(rol).includes("admin"),
    };
  }

  async sedeEstaActiva(idSede: number): Promise<boolean> {
    const { data, error } = await this.supabase
      .from("sedes")
      .select("id_sede")
      .eq("id_sede", idSede)
      .eq("estado", true)
      .maybeSingle();

    if (error) throw this.fallo("verificar la sede", error);
    return !!data;
  }

  async obtenerStockPorSede(idSede: number): Promise<FilaStock[]> {
    const { data, error } = await this.supabase
      .from("producto_sede")
      .select(SELECT_STOCK)
      .eq("id_sede", idSede)
      .eq("productos.estado", true)
      .is("productos.eliminado_en", null);

    if (error) throw this.fallo("obtener el inventario", error);
    return ((data ?? []) as unknown as FilaStockRaw[]).map((f) =>
      this.mapearStock(f),
    );
  }

  async obtenerStockProducto(
    idSede: number,
    idProducto: number,
  ): Promise<FilaStock | null> {
    const { data, error } = await this.supabase
      .from("producto_sede")
      .select(SELECT_STOCK)
      .eq("id_sede", idSede)
      .eq("id_producto", idProducto)
      .maybeSingle();

    if (error) throw this.fallo("obtener el artículo", error);
    return data ? this.mapearStock(data as unknown as FilaStockRaw) : null;
  }

  async obtenerTiposMovimiento(): Promise<TipoMovimiento[]> {
    const { data, error } = await this.supabase
      .from("tipos_movimiento_inventario")
      .select("id_tipo_movimiento, nombre, afecta_stock")
      .order("nombre");

    if (error) throw this.fallo("obtener los tipos de movimiento", error);
    return (data ?? []).map((t) => ({
      idTipoMovimiento: t.id_tipo_movimiento,
      nombre: t.nombre,
      afectaStock: t.afecta_stock as AfectaStock,
    }));
  }

  async obtenerKardex(
    idSede: number,
    idProducto: number,
    desdeISO: string,
    hastaISO: string,
  ): Promise<MovimientoKardex[]> {
    const { data, error } = await this.supabase
      .from("movimientos_inventario")
      .select(
        `id_movimiento, cantidad, stock_anterior, stock_resultante, motivo, fecha_movimiento,
         tipos_movimiento_inventario ( nombre, afecta_stock ),
         usuarios ( nombres, apellidos )`,
      )
      .eq("id_sede", idSede)
      .eq("id_producto", idProducto)
      .gte("fecha_movimiento", desdeISO)
      .lte("fecha_movimiento", hastaISO)
      .order("fecha_movimiento", { ascending: true })
      .order("id_movimiento", { ascending: true })
      .limit(1000);

    if (error) throw this.fallo("obtener el kardex", error);
    return ((data ?? []) as unknown as FilaKardexRaw[]).map((m) => ({
      idMovimiento: m.id_movimiento,
      fecha: m.fecha_movimiento,
      tipo: m.tipos_movimiento_inventario.nombre,
      afectaStock: m.tipos_movimiento_inventario.afecta_stock,
      cantidad: Number(m.cantidad),
      stockAnterior: Number(m.stock_anterior),
      stockResultante: Number(m.stock_resultante),
      motivo: m.motivo,
      usuario: m.usuarios
        ? `${m.usuarios.nombres} ${m.usuarios.apellidos}`
        : "—",
    }));
  }

  async registrarMovimiento(
    mov: NuevoMovimiento,
  ): Promise<ResultadoMovimiento> {
    const { data, error } = await this.supabase.rpc("registrar_movimiento", {
      p_id_sede: mov.idSede,
      p_id_producto: mov.idProducto,
      p_id_tipo_movimiento: mov.idTipoMovimiento,
      p_id_usuario: mov.idUsuario,
      p_cantidad: mov.cantidad,
      p_motivo: mov.motivo ?? null,
      p_es_merma: mov.esMerma ?? false,
    });

    if (error) {
      if (error.message.includes("Stock insuficiente")) {
        throw new InventarioError(error.message, 422);
      }
      throw this.fallo("registrar el movimiento", error);
    }

    return data as ResultadoMovimiento;
  }

  async obtenerSaldoAntesDe(
    idSede: number,
    idProducto: number,
    isoFecha: string,
  ): Promise<number | null> {
    const { data, error } = await this.supabase
      .from("movimientos_inventario")
      .select("stock_resultante")
      .eq("id_sede", idSede)
      .eq("id_producto", idProducto)
      .lt("fecha_movimiento", isoFecha)
      .order("fecha_movimiento", { ascending: false })
      .order("id_movimiento", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw this.fallo("obtener el saldo inicial", error);
    return data ? Number(data.stock_resultante) : null;
  }

  async obtenerSaldoDespuesDe(
    idSede: number,
    idProducto: number,
    isoFecha: string,
  ): Promise<number | null> {
    const { data, error } = await this.supabase
      .from("movimientos_inventario")
      .select("stock_anterior")
      .eq("id_sede", idSede)
      .eq("id_producto", idProducto)
      .gt("fecha_movimiento", isoFecha)
      .order("fecha_movimiento", { ascending: true })
      .order("id_movimiento", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) throw this.fallo("obtener el saldo del periodo", error);
    return data ? Number(data.stock_anterior) : null;
  }
}
