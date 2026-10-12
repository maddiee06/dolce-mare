"use client";
import { useState, useEffect } from "react";
import React from "react";
import styles from "./NavCajero.module.scss";
import Image from "next/image";

interface NavCajeroProps {
  userName: string;
  userRole: string;
}

export function NavCajero({ userName, userRole }: NavCajeroProps) {
  const [time, setTime] = useState<string>("");
  const [date, setDate] = useState<string>("");

  // Estado para controlar el menú móvil
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();

      const timeString = now.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      const dateString = now
        .toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
        .replace(".", "");

      setTime(timeString);
      setDate(dateString);
    };

    updateDateTime();
    const timer = setInterval(updateDateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Función para abrir/cerrar el menú
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <div className={styles.navCajeroMobile}>
        <div className={styles.mobileTopBar}>
          <Image
            className={styles.logo}
            src="/logo_vertical.svg"
            alt="Logo Dolce Mare"
            width={140}
            height={60}
            priority
          />

          <div className={styles.timeContainer}>
            {time && date ? (
              <div className={styles.dateTime}>
                <span className={styles.time}>{time}</span>
                <span className={styles.date}>{date}</span>
              </div>
            ) : (
              <div className={styles.dateTime} style={{ visibility: "hidden" }}>
                <span className={styles.time}>00:00</span>
                <span className={styles.date}>00 aaa 0000</span>
              </div>
            )}

            <button className={styles.hamburgerBtn} onClick={toggleMobileMenu}>
              <Image
                src="/burger.svg"
                alt="Abrir menú"
                width={24}
                height={24}
              />
            </button>
          </div>
        </div>

        <div
          className={`${styles.mobileOverlay} ${isMobileMenuOpen ? styles.open : ""}`}
        >
          <button className={styles.closeBtn} onClick={toggleMobileMenu}>
            <Image src="/close.svg" alt="Cerrar menú" width={40} height={40} />
          </button>

          <ul className={styles.mobileLinks}>
            <li>
              <a href="#">Cuentas Guardadas</a>
            </li>
            <li>
              <a href="#">Historial de Ventas</a>
            </li>
            <li>
              <a href="#">Caja</a>
            </li>
            <li>
              <a href="#">Gestionar Inventario</a>
            </li>
          </ul>

          <div className={styles.mobileBottomInfo}>
            <div className={styles.profileInfo}>
              <img
                src="https://ui-avatars.com/api/?background=random&name=John+Doe"
                alt={`Avatar de ${userName}`}
                width={48}
                height={48}
              />
              <div>
                <p className={styles.name}>{userName || "Cajero"}</p>
                <p className={styles.role}>{userRole || "Ventas"}</p>
              </div>
              <Image
                className={styles.arrowDropdown}
                src="/chevron-down.svg"
                alt="Desplegar menú"
                width={24}
                height={24}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.navCajeroDesktop}>
        <nav className={styles.navCajero}>
          <div className={styles.logoContainer}>
            <div className={styles.logoText}>
              <Image
                className={styles.logo}
                src="/logo_vertical.svg"
                alt="Logo Dolce Mare"
                width={140}
                height={60}
                priority
              />
            </div>
          </div>

          <ul className={styles.menu}>
            <li>
              <a href="#">
                <span className={styles.icon}></span>
                Cuentas Guardadas
              </a>
            </li>
            <li>
              <a href="#">
                <span className={styles.icon}></span>
                Historial de Ventas
              </a>
            </li>
            <li>
              <a href="#">
                <span className={styles.icon}></span>
                Caja
              </a>
            </li>
            <li>
              <a href="#">
                <span className={styles.icon}></span>
                Gestionar Inventario
              </a>
            </li>
          </ul>

          <div className={styles.userInfoContainer}>
            {time && date ? (
              <div className={styles.dateTime}>
                <span className={styles.time}>{time}</span>
                <span className={styles.date}>{date}</span>
              </div>
            ) : (
              <div className={styles.dateTime} style={{ visibility: "hidden" }}>
                <span className={styles.time}>00:00</span>
                <span className={styles.date}>00 aaa 0000</span>
              </div>
            )}

            <div className={styles.divider}></div>

            <div className={styles.profile}>
              <div className={styles.avatarContainer}>
                <img
                  className={styles.avatarImage}
                  src="https://ui-avatars.com/api/?background=random&name=John+Doe"
                  alt={`Avatar de ${userName}`}
                  width={40}
                  height={40}
                />
              </div>
              <div className={styles.userData}>
                <span className={styles.userName}>{userName}</span>
                <span className={styles.userRole}>{userRole}</span>
              </div>
              <Image
                className={styles.arrowDropdown}
                src="/chevron-down.svg"
                alt="Desplegar menú"
                width={16}
                height={16}
              />
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}

export default NavCajero;
