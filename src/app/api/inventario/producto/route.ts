import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/src/utils/supabase/admin";

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.idProducto) {
      return NextResponse.json(
        { error: "idProducto es requerido." },
        { status: 400 }
      );
    }

    const { idProducto, nombre, precio, categoria, imagenUrl } = body;
    const supabase = createAdminClient();

    // 1. Si se especificó una categoría, buscar o verificar su id_categoria
    let idCategoria: number | undefined;
    if (categoria && typeof categoria === "string") {
      const { data: catData } = await supabase
        .from("categorias")
        .select("id_categoria")
        .ilike("nombre", categoria.trim())
        .maybeSingle();

      if (catData) {
        idCategoria = catData.id_categoria;
      }
    }

    // 2. Construir campos a actualizar en la tabla productos
    const payload: Record<string, unknown> = {
      actualizado_en: new Date().toISOString(),
    };

    if (typeof nombre === "string" && nombre.trim().length > 0) {
      payload.nombre = nombre.trim();
    }

    if (precio !== undefined && !isNaN(Number(precio))) {
      payload.precio_venta = Number(precio);
    }

    if (idCategoria !== undefined) {
      payload.id_categoria = idCategoria;
    }

    if (imagenUrl !== undefined) {
      payload.imagen_url =
        typeof imagenUrl === "string" && imagenUrl.trim().length > 0
          ? imagenUrl.trim()
          : null;
    }

    const { data, error } = await supabase
      .from("productos")
      .update(payload)
      .eq("id_producto", Number(idProducto))
      .select()
      .single();

    if (error) {
      console.error("[API Inventario Producto] Error al actualizar:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("[API Inventario Producto]", err);
    return NextResponse.json(
      { error: "Error interno al actualizar el producto." },
      { status: 500 }
    );
  }
}
