import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { updateSession } from "@/src/utils/supabase/middleware";

/**
 * Middleware Global de Seguridad y Rutas
 * Se ejecuta antes de procesar cada solicitud en el servidor para:
 * 1. Renovar las cookies de Supabase si es necesario.
 * 2. Proteger las rutas privadas (/admin, /cajero, /seleccionsucursal).
 * 3. Verificar que el usuario tenga una sucursal seleccionada (id_sede).
 * 4. Redirigir usuarios ya autenticados que intenten volver al formulario de login.
 */
export async function middleware(request: NextRequest) {
  // Sincroniza y renueva la sesión de Supabase en las cabeceras de respuesta
  const supabaseResponse = updateSession(request);

  const idSede = request.cookies.get("id_sede")?.value;
  const sessionToken = request.cookies.get("session")?.value;

  let rolUsuario = null;

  // Verificación del token JWT si existe en la cookie de sesión
  if (sessionToken) {
    try {
      const secretKey = process.env.SESSION_SECRET;
      if (secretKey) {
        const secret = new TextEncoder().encode(secretKey);
        const { payload } = await jwtVerify(sessionToken, secret);
        rolUsuario = payload.rol ? String(payload.rol).toLowerCase() : null;
      }
    } catch {
      console.error("Token JWT inválido o expirado en middleware");
    }
  }

  const pathname = request.nextUrl.pathname;
  const isProtectedRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/cajero") ||
    pathname.startsWith("/seleccionsucursal");

  // Regla 1: Si intenta ingresar a una ruta protegida sin sesión, redirige al login
  if (isProtectedRoute && !sessionToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Regla 2: Si tiene sesión iniciada pero aún no elige sede, redirige al selector de sucursal
  if (
    (pathname.startsWith("/admin") || pathname.startsWith("/cajero")) &&
    sessionToken &&
    !idSede
  ) {
    return NextResponse.redirect(new URL("/seleccionsucursal", request.url));
  }

  // Regla 3: Si ya tiene sesión activa e intenta volver al login, redirige según su rol y sede
  if (pathname === "/login" && sessionToken) {
    if (!idSede) {
      return NextResponse.redirect(new URL("/seleccionsucursal", request.url));
    } else {
      if (rolUsuario === "administrador" || rolUsuario === "admin") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      } else if (rolUsuario === "cajero") {
        return NextResponse.redirect(new URL("/cajero", request.url));
      } else {
        return NextResponse.redirect(
          new URL("/seleccionsucursal", request.url),
        );
      }
    }
  }

  return supabaseResponse;
}

/**
 * Configuración de rutas interceptadas por el middleware.
 * Se excluyen archivos estáticos, imágenes, favicon y rutas API para no generar sobrecarga.
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
