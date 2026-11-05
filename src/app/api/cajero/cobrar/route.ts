import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { createClient } from "../../../../utils/supabase/server";
import { PedidoDAO } from "../../../../dao/supabase/PedidoDAO";

const secretKey = process.env.SESSION_SECRET;
const secret = secretKey ? new TextEncoder().encode(secretKey) : null;

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sedeCookie = cookieStore.get("id_sede")?.value;
    const idSede = sedeCookie ? parseInt(sedeCookie, 10) : 1;

    let idUsuario = 1;
    const sessionToken = cookieStore.get("session")?.value;
    if (sessionToken && secret) {
      try {
        const { payload } = await jwtVerify(sessionToken, secret);
        if (payload.sub) {
          idUsuario = parseInt(String(payload.sub), 10) || 1;
        }
      } catch {
        // Fallback a usuario 1
      }
    }

    const body = await req.json();
    const { id_pedido, metodo_pago, detalle_mixto } = body;

    if (!id_pedido) {
      return NextResponse.json(
        { error: "id_pedido es requerido." },
        { status: 400 }
      );
    }

    const supabase = createClient(cookieStore);
    const pedidoDao = new PedidoDAO(supabase);

    const resultado = await pedidoDao.cobrarPedido(
      Number(id_pedido),
      metodo_pago || "efectivo",
      idUsuario,
      idSede,
      detalle_mixto
    );

    return NextResponse.json({ ok: true, id_venta: resultado.id_venta });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    console.error("Error al cobrar pedido:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
