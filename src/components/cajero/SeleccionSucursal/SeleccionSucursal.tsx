"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./SeleccionSucursal.module.scss";
import { Sede } from "../../../models/Sede";
import { ConfirmarSedeModal } from "../ConfirmarSedeModal";

const imagenPorIdSede: Record<number, string> = {
  1: "/SedeNvoChim.jpeg",
  2: "/SedeChim.jpg",
};

export default function SeleccionSucursal() {
  const router = useRouter();
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [sedeSeleccionada, setSedeSeleccionada] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);

  useEffect(() => {
    const cargarSedes = async () => {
      try {
        const res = await fetch("/api/sedes");
        const json = await res.json();

        if (!res.ok) {
          setError(json.error ?? "No se pudieron cargar las sedes.");
          return;
        }

        setSedes(json.sedes);
        if (json.sedes.length > 0) {
          setSedeSeleccionada(json.sedes[0].id_sede);
        }
      } catch {
        setError("No se pudo conectar con el servidor.");
      } finally {
        setCargando(false);
      }
    };

    cargarSedes();
  }, []);

  const sedeMarcada = sedes.find((s) => s.id_sede === sedeSeleccionada) ?? null;

  const handleContinuarClick = () => {
    if (sedeSeleccionada === null) return;
    setModalAbierto(true);
  };

  const handleCancelarModal = () => {
    setModalAbierto(false);
  };

  const handleConfirmarModal = async () => {
    if (sedeSeleccionada === null) return;

    setModalAbierto(false);
    setEnviando(true);
    setError("");
    try {
      const res = await fetch("/api/sedes/seleccionar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_sede: sedeSeleccionada }),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "No se pudo seleccionar la sede.");
        return;
      }

      router.push("/cajero");
      router.refresh();
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) {
    return <div className={styles.wrapper}>Cargando sedes...</div>;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.cardContainer}>
        <header className={styles.header}>
          <Image
            src="/logo.svg"
            alt="Dolce Mare"
            width={140}
            height={62}
            priority
          />
        </header>

        <div className={styles.titles}>
          <h2 className={styles.mainTitle}>Selecciona tu sucursal</h2>
          <p className={styles.subtitle}>Elige donde trabajarás hoy</p>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.gridSucursales}>
          {sedes.map((sede) => {
            const isSelected = sedeSeleccionada === sede.id_sede;

            return (
              <div
                key={sede.id_sede}
                className={`${styles.sucursalCard} ${isSelected ? styles.selected : ""}`}
                onClick={() => setSedeSeleccionada(sede.id_sede)}
              >
                <div className={styles.imageContainer}>
                  <div className={styles.imagePlaceholder}>
                    <img
                      src={imagenPorIdSede[sede.id_sede] ?? "/SedeGenerica.jpg"}
                      alt={`Sede ${sede.nombre}`}
                    />
                  </div>
                </div>

                <div className={styles.infoContainer}>
                  <div className={styles.checkIcon}>
                    {isSelected ? (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <div className={styles.emptyCircle} />
                    )}
                  </div>

                  <h3 className={styles.nombre}>{sede.nombre}</h3>
                  <p className={styles.direccion}>{sede.direccion}</p>

                  <button
                    className={`${styles.btnSeleccionar} ${isSelected ? styles.btnActive : ""}`}
                  >
                    {isSelected ? "Seleccionada" : "Seleccionar"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <button
          className={styles.btnContinuar}
          onClick={handleContinuarClick}
          disabled={enviando || sedeSeleccionada === null}
        >
          {enviando ? "Guardando..." : <>Continuar &rarr;</>}
        </button>
      </div>

      <ConfirmarSedeModal
        isOpen={modalAbierto}
        sedeNombre={sedeMarcada?.nombre ?? ""}
        onConfirm={handleConfirmarModal}
        onCancel={handleCancelarModal}
      />
    </div>
  );
}
