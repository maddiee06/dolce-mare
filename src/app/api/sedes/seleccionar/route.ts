import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { obtenerSedesActivas } from "../../../../controllers/SedeController";

export async function POST(request: NextRequest) {
  try {
    const { id_sede } = await request.json();

    if (!id_sede || typeof id_sede !== "number") {
      return NextResponse.json(
        { error: "id_sede es requerido y debe ser numérico." },
        { status: 400 },
      );
    }

    // Validar que la sede exista y esté activa antes de confiar en ella
    const sedesActivas = await obtenerSedesActivas();
    const sedeValida = sedesActivas.find((s) => s.id_sede === id_sede);

    if (!sedeValida) {
      return NextResponse.json(
        { error: "La sede seleccionada no es válida." },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    cookieStore.set("id_sede", String(id_sede), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error al seleccionar sede:", error);
    return NextResponse.json(
      { error: "No se pudo guardar la sede seleccionada." },
      { status: 500 },
    );
  }
}
