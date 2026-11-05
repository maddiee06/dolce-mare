import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "../../../../utils/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sedeCookie = cookieStore.get("id_sede")?.value;
    const idSede = sedeCookie ? parseInt(sedeCookie, 10) : 1;

    const { searchParams } = new URL(req.url);
    const fechaParam = searchParams.get("fecha"); // "YYYY-MM-DD" o null para hoy
    const estadoParam = searchParams.get("estado"); // "todos" | "pagado" | "anulado"
    const busqueda = searchParams.get("buscar") || "";
    const pagina = parseInt(searchParams.get("pagina") || "1", 10);
    const porPagina = parseInt(searchParams.get("por_pagina") || "20", 10);

    const supabase = createClient(cookieStore);

    // Fecha base: hoy si no viene parámetro
    const fechaBase = fechaParam
      ? new Date(fechaParam)
      : new Date();
    const diaInicio = new Date(fechaBase);
    diaInicio.setHours(0, 0, 0, 0);
    const diaFin = new Date(fechaBase);
    diaFin.setHours(23, 59, 59, 999);

    let query = supabase
      .from("ventas")
      .select(
        `
        id_venta,
        id_pedido,
        id_cliente,
        id_metodo_pago,
        id_estado_venta,
        fecha_venta,
        subtotal,
        igv,
        total,
        metodos_pago ( nombre ),
        estados_venta ( nombre ),
        pedidos ( observaciones, id_tipo_entrega, tipos_entrega ( nombre ) )
      `,
        { count: "exact" }
      )
      .gte("fecha_venta", diaInicio.toISOString())
      .lte("fecha_venta", diaFin.toISOString())
      .order("fecha_venta", { ascending: false });

    if (idSede > 0) {
      query = query.eq("id_sede", idSede);
    }

    if (estadoParam && estadoParam !== "todos") {
      // id_estado_venta: 1=Pagado, 2=Anulado
      const estadoMap: Record<string, number> = { pagado: 1, anulado: 2 };
      const idEstado = estadoMap[estadoParam.toLowerCase()];
      if (idEstado) query = query.eq("id_estado_venta", idEstado);
    }

    // Paginación
    const offset = (pagina - 1) * porPagina;
    query = query.range(offset, offset + porPagina - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Error al obtener historial: ${error.message}`);
    }

    // Filtro por búsqueda de texto (correlativo o cliente - lado servidor simple)
    let ventas = data || [];
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      ventas = ventas.filter(
        (v) =>
          String(v.id_venta).includes(q) ||
          String(
            (v.pedidos as { observaciones?: string } | null)?.observaciones || ""
          )
            .toLowerCase()
            .includes(q)
      );
    }

    return NextResponse.json({
      ok: true,
      ventas,
      total: count ?? ventas.length,
      pagina,
      por_pagina: porPagina,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    console.error("Error en /api/cajero/historial:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
