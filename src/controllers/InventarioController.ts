import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { InventarioDAO } from "../dao/supabase/InventarioDAO";
import { InventarioService } from "../services/InventarioService";
import type { IInventarioService } from "../services/interfaces/IInventarioService";
import { createAdminClient } from "../utils/supabase/admin";
import {
  InventarioError,
  type EstadoStock,
  type RegistrarMovimientoInput,
} from "../models/Inventario";

// Estados válidos de stock admitidos por el filtro
const ESTADOS: EstadoStock[] = ["disponible", "stock_bajo", "agotado"];

/**
 * Controlador de Inventario
 * Atiende las peticiones a la API (/api/inventario/...) para:
 * listar stock agrupado, consultar tipos de movimiento, ver el Kardex
 * y registrar ajustes de stock o mermas.
 */
export class InventarioController {
  constructor(
    private readonly service: IInventarioService,
    private readonly idSedeCookie: number | null,
  ) {}

  /**
   * Crea una instancia del controlador para la petición actual.
   * Utiliza el cliente de servicio administrativo para asegurar permisos y
   * obtiene la sede activa directamente desde la cookie 'id_sede'.
   */
  static async crear(): Promise<InventarioController> {
    const cookieStore = await cookies();
    const supabase = createAdminClient();

    const valor = Number(cookieStore.get("id_sede")?.value);
    const idSede = Number.isInteger(valor) && valor > 0 ? valor : null;

    return new InventarioController(
      new InventarioService(new InventarioDAO(supabase)),
      idSede,
    );
  }

  /**
   * Valida que exista una sede activa seleccionada en la sesión.
   * Si no hay sede, lanza un error para obligar a elegir sucursal.
   */
  private sedeActiva(): number {
    if (this.idSedeCookie === null) {
      throw new InventarioError(
        "No hay una sede seleccionada. Vuelve a elegir tu sucursal.",
        400,
      );
    }
    return this.idSedeCookie;
  }

  /**
   * Valida que un valor recibido sea un número entero positivo.
   */
  private entero(valor: unknown, campo: string): number {
    const n = Number(valor);
    if (
      valor === null ||
      valor === undefined ||
      valor === "" ||
      !Number.isInteger(n) ||
      n <= 0
    ) {
      throw new InventarioError(
        `${campo} es obligatorio y debe ser un entero positivo`,
        400,
      );
    }
    return n;
  }

  /**
   * Maneja y centraliza la respuesta de error devolviendo el código HTTP adecuado.
   */
  private responderError(e: unknown): NextResponse {
    if (e instanceof InventarioError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error("[InventarioController]", e);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }

  /**
   * GET /api/inventario
   * Lista el inventario de la sede activa según el tipo ('sabores' o 'envases'),
   * permitiendo filtrar opcionalmente por texto o estado de stock.
   */
  async listar(req: NextRequest): Promise<NextResponse> {
    try {
      const idSede = this.sedeActiva();
      const p = req.nextUrl.searchParams;

      const tipo = p.get("tipo");
      if (tipo !== "envases" && tipo !== "sabores") {
        throw new InventarioError("tipo debe ser 'envases' o 'sabores'", 400);
      }

      const estado = ESTADOS.find((e) => e === p.get("estado"));

      const data = await this.service.obtenerInventario(idSede, tipo, {
        busqueda: p.get("busqueda") ?? undefined,
        estado,
      });
      return NextResponse.json(data);
    } catch (e) {
      return this.responderError(e);
    }
  }

  /**
   * GET /api/inventario/tipos-movimiento
   * Devuelve los tipos de movimiento manuales configurados (Entrada, Ajuste, Merma, etc.).
   */
  async tiposMovimiento(): Promise<NextResponse> {
    try {
      return NextResponse.json(await this.service.obtenerTiposMovimiento());
    } catch (e) {
      return this.responderError(e);
    }
  }

  /**
   * GET /api/inventario/contexto
   * Obtiene los datos del usuario logueado que figura como 'Responsable' en los formularios.
   */
  async contexto(): Promise<NextResponse> {
    try {
      return NextResponse.json(await this.service.obtenerResponsable());
    } catch (e) {
      return this.responderError(e);
    }
  }

  /**
   * GET /api/inventario/kardex
   * Devuelve el historial detallado de movimientos de un producto con sus fechas y saldos.
   */
  async kardex(req: NextRequest): Promise<NextResponse> {
    try {
      const idSede = this.sedeActiva();
      const p = req.nextUrl.searchParams;
      const idProducto = this.entero(p.get("idProducto"), "idProducto");

      return NextResponse.json(
        await this.service.obtenerKardex(
          idSede,
          idProducto,
          p.get("desde") ?? undefined,
          p.get("hasta") ?? undefined,
        ),
      );
    } catch (e) {
      return this.responderError(e);
    }
  }

  /**
   * POST /api/inventario/registrar
   * Registra un movimiento de stock (aumento, descuento o merma) en la base de datos.
   */
  async registrar(req: NextRequest): Promise<NextResponse> {
    try {
      const idSede = this.sedeActiva();

      const body = await req.json().catch(() => null);
      if (!body || typeof body !== "object") {
        throw new InventarioError("Cuerpo de la petición inválido", 400);
      }

      const input: RegistrarMovimientoInput = {
        idProducto: this.entero(body.idProducto, "idProducto"),
        idTipoMovimiento: this.entero(body.idTipoMovimiento, "idTipoMovimiento"),
        cantidad: Number(body.cantidad),
        motivo: typeof body.motivo === "string" ? body.motivo : undefined,
      };

      const resultado = await this.service.registrarMovimiento(idSede, input);
      return NextResponse.json(resultado, { status: 201 });
    } catch (e) {
      return this.responderError(e);
    }
  }
}
