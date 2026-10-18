"use client";
import React, { useState } from "react";
import Image from "next/image";
import styles from "./Loginform.module.scss";

export type LoginData = {
  usuario: string;
  password: string;
};

export type LoginformProps = {
  onLogin?: (data: LoginData) => void | Promise<void>;
  error?: string;
};

const Loginform: React.FC<LoginformProps> = ({ onLogin, error }) => {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    try {
      await onLogin?.({ usuario: usuario.trim(), password });
    } finally {
      setPending(false);
    }
  };

  return (
    <main className={styles.login}>
      {/* Lado izquierdo */}
      <section className={styles.hero}>
        <Image
          src="/imagen_login.svg"
          alt="Helado de pistacho servido en un cono"
          fill
          priority
          sizes="50vw"
        />
        <div className={styles.heroText}>
          <h2 className={styles.heroTitle}>El sabor de la tradición</h2>
          <p className={styles.heroSubtitle}>Sistema de Punto de Venta</p>
        </div>
      </section>

      {/* Lado derecho */}
      <section className={styles.panel}>
        <div className={styles.panelContent}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <header className={styles.header}>
              <Image
                src="/logo.svg"
                alt="Dolce Mare"
                width={140}
                height={80}
                priority
              />
              <h1 className={styles.title}>Bienvenido de vuelta</h1>
              <p className={styles.subtitle}>Ingresa a tu espacio de trabajo</p>
            </header>

            <div className={styles.group}>
              <label htmlFor="usuario" className={styles.label}>
                Usuario
              </label>
              <div className={styles.field}>
                <Image src="/user.svg" alt="" width={18} height={18} />
                <input
                  id="usuario"
                  name="usuario"
                  type="text"
                  placeholder="ej. bradley"
                  autoComplete="username"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={styles.group}>
              <label htmlFor="password" className={styles.label}>
                Contraseña
              </label>
              <div className={styles.field}>
                <Image src="/lock.svg" alt="" width={18} height={18} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className={styles.toggle}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                >
                  <Image
                    src={showPassword ? "/eye.svg" : "/eye_locked.svg"}
                    alt=""
                    width={18}
                    height={18}
                  />
                </button>
              </div>
            </div>

            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}

            <button type="submit" className={styles.submit} disabled={pending}>
              {pending ? "Ingresando..." : "Iniciar Sesión"}
            </button>
          </form>

          <p className={styles.notice}>
            Acceso exclusivo para el personal de Dolce Mare
          </p>
        </div>
      </section>
    </main>
  );
};

export default Loginform;
