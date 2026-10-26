import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { createClient } from "../utils/supabase/server";
import { UsuarioDAO } from "../dao/supabase/UsuarioDAO";
import { AuthService } from "../services/AuthService";

// Clave secreta para firmar y verificar tokens JWT de sesión
const secret = new TextEncoder().encode(process.env.SESSION_SECRET);

/**
 * Controlador de Autenticación
 * Se encarga del inicio de sesión, generación de tokens JWT en cookies seguras
 * y la lectura de los datos del perfil activo.
 */
export class AuthController {
  /**
   * Procesa la solicitud de login del usuario.
   * 1. Extrae y valida que vengan las credenciales (usuario y contraseña).
   * 2. Consulta a AuthService para verificar contra la base de datos.
   * 3. Si es correcto, genera un token JWT firmado válido por 8 horas.
   * 4. Guarda las cookies de sesión en el navegador y devuelve la ruta de redirección.
   */
  async login(request: Request) {
    let body: { usuario?: unknown; password?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Solicitud inválida." },
        { status: 400 },
      );
    }

    const usuario = typeof body.usuario === "string" ? body.usuario.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    // Validación básica: ninguno de los campos puede estar vacío
    if (!usuario || !password) {
      return NextResponse.json(
        { error: "Completa usuario y contraseña." },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const service = new AuthService(new UsuarioDAO(supabase));

    // Verificación de credenciales en base de datos
    const resultado = await service.login(usuario, password);

    if (!resultado.ok) {
      return NextResponse.json(
        { error: resultado.error },
        { status: resultado.status },
      );
    }

    // Creación del token JWT con los datos clave del usuario
    const token = await new SignJWT({
      sub: String(resultado.usuario.id_usuario),
      rol: resultado.usuario.id_rol,
      nombre: `${resultado.usuario.nombres} ${resultado.usuario.apellidos}`,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("8h")
      .sign(secret);

    // Cookie de sesión principal (httpOnly para proteger contra ataques XSS)
    cookieStore.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 horas
    });

    // Cookie de rol para lectura rápida en frontend
    cookieStore.set("id_rol", String(resultado.usuario.id_rol), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return NextResponse.json({
      redirect: resultado.redirect,
      usuario: {
        nombres: resultado.usuario.nombres,
        apellidos: resultado.usuario.apellidos,
        rol: resultado.usuario.id_rol,
      },
    });
  }

  /**
   * Obtiene la información del usuario autenticado leyendo y verificando
   * el token JWT almacenado en la cookie 'session'.
   */
  async obtenerPerfil(_request?: Request) {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    try {
      const { payload } = await jwtVerify(sessionToken, secret);
      return NextResponse.json({
        id: payload.sub,
        rol: payload.rol,
        nombre: payload.nombre,
      });
    } catch {
      return NextResponse.json(
        { error: "Sesión inválida o expirada" },
        { status: 401 },
      );
    }
  }
}
