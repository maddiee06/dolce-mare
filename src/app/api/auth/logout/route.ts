import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function POST() {
  try {
    const cookieStore = await cookies();

    cookieStore.delete("session");
    cookieStore.delete("id_sede");
    cookieStore.delete("id_rol");

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          },
        },
      },
    );

    await supabase.auth.signOut();

    return NextResponse.json({
      success: true,
      message: "Sesión cerrada completamente",
    });
  } catch (error) {
    console.error("Error al limpiar las cookies de sesión:", error);
    return NextResponse.json(
      { error: "No se pudo cerrar la sesión" },
      { status: 500 },
    );
  }
}
