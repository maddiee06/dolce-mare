import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import { NavCajero } from "../../components/cajero/NavCajero";
import { RolNombre } from "../../models/Usuario";

export const instant = false;

const secretKey = process.env.SESSION_SECRET;
if (!secretKey) {
  throw new Error("Falta definir SESSION_SECRET en las variables de entorno");
}
const secret = new TextEncoder().encode(secretKey);

export default async function CajeroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;

  if (!sessionToken) {
    redirect("/login");
  }

  let userName = "";
  let userRole: RolNombre = "Cajero";

  try {
    const { payload } = await jwtVerify(sessionToken, secret);
    userName = String(payload.nombre || "");
    userRole = (payload.rol as RolNombre) || "Cajero";
  } catch (error) {
    console.error(
      "Token de sesión inválido o expirado en CajeroLayout:",
      error,
    );
    redirect("/login");
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-50">
      <NavCajero
        userName={userName}
        userRole={userRole}
        isCajaAbierta={true}
        pendingCount={0}
      />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
