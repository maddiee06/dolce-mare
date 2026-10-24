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

const ESTADOS: EstadoStock[] = ["disponible", "stock_bajo", "agotado"];

export class InventarioController {
  constructor(
    private readonly service: IInventarioService,
    private readonly idSedeCookie: number | null,
  ) {}

  /**
   * Arma el controller para la petición actual.
   * - Usa el cliente de servicio (solo servidor): los permisos los controla InventarioService.
   * - La sede activa sale de la cookie `id_sede` que guarda /api/sedes/seleccionar.
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

  /** Sede elegida en /seleccionsucursal (cookie id_sede). */
  private sedeActiva(): number {
    if (this.idSedeCookie === null) {
      throw new InventarioError(
        "No hay una sede seleccionada. Vuelve a elegir tu sucursal.",
        400,
      );
    }
    return this.idSedeCookie;
  }

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

  async tiposMovimiento(): Promise<NextResponse> {
    try {
      return NextResponse.json(await this.service.obtenerTiposMovimiento());
    } catch (e) {
      return this.responderError(e);
    }
  }

  /** Nombre y rol del usuario logueado (el formulario lo muestra como "Responsable"). */
  async contexto(): Promise<NextResponse> {
    try {
      return NextResponse.json(await this.service.obtenerResponsable());
    } catch (e) {
      return this.responderError(e);
    }
  }

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