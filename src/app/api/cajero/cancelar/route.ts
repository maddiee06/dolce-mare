import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { createClient } from "../../../../utils/supabase/server";

const secretKey = process.env.SESSION_SECRET;
const secret = secretKey ? new TextEncoder().encode(secretKey) : null;

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();

    let idUsuario = 1;
    const sessionToken = cookieStore.get("session")?.value;
    if (sessionToken && secret) {
      try {
        const { payload } = await jwtVerify(sessionToken, secret);
        if (payload.sub) idUsuario = parseInt(String(payload.sub), 10) || 1;
      } catch { /* fallback */ }
    }

    const body = await req.json();
    const { id_pedido, motivo } = body;

    if (!id_pedido) {
      return NextResponse.json({ error: "id_pedido es requerido." }, { status: 400 });
    }

    const motivoTexto = motivo?.trim() || "Cancelado por el cajero";
    const supabase = createClient(cookieStore);

    // Verificar que el pedido existe y está abierto (1=Abierto, 2=En preparación)
    const { data: pedido, error: errPedido } = await supabase
      .from("pedidos")
      .select("id_pedido, id_estado_pedido, observaciones")
      .eq("id_pedido", Number(id_pedido))
      .in("id_estado_pedido", [1, 2])
      .single();

    if (errPedido || !pedido) {
      return NextResponse.json(
        { error: "Pedido no encontrado o ya cerrado." },
        { status: 404 }
      );
    }

    // Actualizar a Cancelado (id_estado_pedido = 4)
    const obsActualizada = `${pedido.observaciones || ""} | CANCELADO: ${motivoTexto} (por usuario #${idUsuario})`.trim();

    const { error: errUpdate } = await supabase
      .from("pedidos")
      .update({
        id_estado_pedido: 4, // 4: Cancelado
        observaciones: obsActualizada,
      })
      .eq("id_pedido", Number(id_pedido));

    if (errUpdate) {
      throw new Error(`Error al cancelar pedido: ${errUpdate.message}`);
    }

    return NextResponse.json({ ok: true, id_pedido, motivo: motivoTexto });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    console.error("Error al cancelar pedido:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
