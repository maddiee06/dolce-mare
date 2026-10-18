import { NextResponse } from "next/server";
import { obtenerSedesActivas } from "../../../controllers/SedeController";

export async function GET() {
  try {
    const sedes = await obtenerSedesActivas();
    return NextResponse.json({ sedes });
  } catch (error) {
    console.error("Error al obtener sedes:", error);
    return NextResponse.json(
      { error: "No se pudieron obtener las sedes." },
      { status: 500 },
    );
  }
}
