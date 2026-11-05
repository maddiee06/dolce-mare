import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "../../../../../../utils/supabase/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idVenta = parseInt(id, 10);

    if (!idVenta || isNaN(idVenta)) {
      return NextResponse.json({ error: "ID de venta inválido." }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Cabecera de la venta
    const { data: venta, error: errVenta } = await supabase
      .from("ventas")
      .select(
        `
        id_venta,
        id_pedido,
        id_metodo_pago,
        id_estado_venta,
        fecha_venta,
        subtotal,
        igv,
        total,
        metodos_pago ( nombre ),
        estados_venta ( nombre ),
        pedidos (
          observaciones,
          direccion_entrega,
          id_tipo_entrega,
          tipos_entrega ( nombre )
        )
      `
      )
      .eq("id_venta", idVenta)
      .single();

    if (errVenta || !venta) {
      return NextResponse.json({ error: "Venta no encontrada." }, { status: 404 });
    }

    // Detalle de la venta
    const { data: detalle, error: errDetalle } = await supabase
      .from("detalle_venta")
      .select(
        `
        id_detalle_venta,
        id_producto,
        cantidad,
        precio_unitario,
        descuento,
        subtotal,
        productos ( id_producto, nombre, codigo )
      `
      )
      .eq("id_venta", idVenta);

    if (errDetalle) {
      console.error("Error al obtener detalle_venta:", errDetalle);
    }

    return NextResponse.json({
      ok: true,
      venta,
      detalle: detalle || [],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    console.error("Error en /api/cajero/historial/[id]:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
