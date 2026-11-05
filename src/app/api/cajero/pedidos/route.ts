import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { createClient } from "../../../../utils/supabase/server";
import { PedidoDAO } from "../../../../dao/supabase/PedidoDAO";

const secretKey = process.env.SESSION_SECRET;
const secret = secretKey ? new TextEncoder().encode(secretKey) : null;

async function obtenerContextoSesion() {
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
      // Ignorar error de verificación y fallback a usuario 1
    }
  }

  return { idSede, idUsuario, cookieStore };
}

export async function GET() {
  try {
    const { idSede, cookieStore } = await obtenerContextoSesion();
    const supabase = createClient(cookieStore);
    const pedidoDao = new PedidoDAO(supabase);

    const pedidos = await pedidoDao.obtenerCuentasAbiertas(idSede);

    return NextResponse.json({ ok: true, pedidos });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    console.error("Error al obtener pedidos:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { idSede, idUsuario, cookieStore } = await obtenerContextoSesion();
    const body = await req.json();

    const { total, items, observaciones, id_tipo_entrega, direccion_entrega } =
      body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "El pedido debe contener al menos un producto." },
        { status: 400 }
      );
    }

    const supabase = createClient(cookieStore);
    const pedidoDao = new PedidoDAO(supabase);

    const nuevoPedido = await pedidoDao.crearPedido({
      id_sede: idSede,
      id_usuario_registra: idUsuario,
      id_tipo_entrega: id_tipo_entrega || 1,
      observaciones: observaciones || "Mesa",
      direccion_entrega: direccion_entrega || null,
      total: Number(total || 0),
      items,
    });

    return NextResponse.json({ ok: true, pedido: nuevoPedido }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    console.error("Error al crear pedido:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
