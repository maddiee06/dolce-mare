"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { createClient } from "../../utils/supabase/server";

export type LoginState = { error?: string };

const secret = new TextEncoder().encode(process.env.SESSION_SECRET);
const ERROR_GENERICO = "Usuario o contraseña incorrectos.";

export async function login(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const usuario = String(formData.get("usuario") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const rol = String(formData.get("rol") ?? "");

  if (!usuario || !password) {
    return { error: "Completa usuario y contraseña." };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: user } = await supabase
    .from("usuarios")
    .select("id, usuario, contrasena_hash, rol")
    .eq("usuario", usuario)
    .maybeSingle();

  if (!user) return { error: ERROR_GENERICO };

  const ok = await bcrypt.compare(password, user.contrasena_hash);
  if (!ok) return { error: ERROR_GENERICO };

  // Si no tienes columna "rol", borra este bloque
  if (user.rol !== rol) {
    return { error: `Este usuario no tiene acceso como ${rol}.` };
  }

  const token = await new SignJWT({ sub: String(user.id), rol: user.rol })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("8h")
    .sign(secret);

  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  redirect(rol === "admin" ? "/admin" : "/cajero");
}