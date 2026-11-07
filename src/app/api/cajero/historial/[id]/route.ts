import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/src/utils/supabase/server";

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
      .select(`
        id_venta,
        codigo_ticket,
        tipo_comprobante,
        fecha_emision,
        estado,
        subtotal,
        igv,
        total,
        descuento,
        metodos_pago:id_metodo_pago (
          nombre
        ),
        usuarios:id_usuario (
          nombres,
          apellidos
        )
      `)
      .eq("id_venta", idVenta)
      .single();

    if (errVenta || !venta) {
      return NextResponse.json({ error: "Venta no encontrada." }, { status: 404 });
    }

    // Detalle de la venta
    const { data: detalles, error: errDetalles } = await supabase
      .from("detalle_ventas")
      .select(`
        id_detalle,
        id_producto,
        cantidad,
        precio_unitario,
        subtotal,
        notas,
        productos:id_producto (
          nombre,
          unidad_medida
        )
      `)
      .eq("id_venta", idVenta);

    if (errDetalles) {
      return NextResponse.json({ error: "Error al cargar los productos de la venta." }, { status: 500 });
    }

    return NextResponse.json({
      venta,
      detalles: detalles ?? [],
    });
  } catch (error) {
    console.error("Error en GET /api/cajero/historial/[id]:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
