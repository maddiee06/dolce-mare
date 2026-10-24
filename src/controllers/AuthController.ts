import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "../utils/supabase/server";
import { UsuarioDAO } from "../dao/supabase/UsuarioDAO";
import { AuthService } from "../services/AuthService";

export class AuthController {
  private async crearService() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    return new AuthService(new UsuarioDAO(supabase));
  }

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

    if (!usuario || !password) {
      return NextResponse.json(
        { error: "Completa usuario y contraseña." },
        { status: 400 },
      );
    }

    const service = await this.crearService();
    const resultado = await service.login(usuario, password);

    if (!resultado.ok) {
      return NextResponse.json(
        { error: resultado.error },
        { status: resultado.status },
      );
    }


    return NextResponse.json({
      redirect: resultado.redirect,
      usuario: {
        nombres: resultado.usuario.nombres,
        apellidos: resultado.usuario.apellidos,
        rol: resultado.usuario.rol,
      },
    });
  }

  async obtenerPerfil(_request?: Request) {
    const service = await this.crearService();
    const usuario = await service.obtenerSesion();

    if (!usuario) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    return NextResponse.json({
      id: usuario.id,
      rol: usuario.rol,
      nombre: `${usuario.nombres} ${usuario.apellidos}`,
    });
  }

  async logout(_request?: Request) {
    const service = await this.crearService();
    await service.logout();
    return NextResponse.json({ ok: true });
  }
}
