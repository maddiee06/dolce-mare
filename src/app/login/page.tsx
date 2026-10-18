"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loginform } from "../../components/cajero/Loginform";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const handleLogin = async (data: { usuario: string; password: string }) => {
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "No se pudo iniciar sesión.");
        return;
      }

      router.push(json.redirect);
      router.refresh();
    } catch {
      setError("No se pudo conectar con el servidor.");
    }
  };

  return <Loginform onLogin={handleLogin} error={error} />;
}