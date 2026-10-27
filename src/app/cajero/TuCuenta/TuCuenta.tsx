"use client";

import React, { useState } from 'react';
import { CupSoda, MoreHorizontal, ReceiptText } from 'lucide-react';
import styles from './TuCuenta.module.scss';

// Definimos las interfaces para las props
interface SaborElegido {
  id: string;
  nombre: string;
  cantidad: number;
}

interface TuCuentaProps {
  mesa: string;
  codigoMesa: string;
  productoNombre: string;
  productoDetalle: string;
  precioUnitario: number;
  sabores: SaborElegido[];
  onCobrar?: () => void;
  onGuardarCuenta?: () => void;
}

export default function TuCuenta({
  mesa = "Mesa 04",
  codigoMesa = "B001-0149",
  productoNombre = "Vaso - 3 sabores",
  productoDetalle = "Gelato artesanal - 240 ml",
  precioUnitario = 24.00,
  sabores = [
    { id: '1', nombre: 'Pistacho', cantidad: 1 },
    { id: '2', nombre: 'Chocolate belga', cantidad: 1 },
    { id: '3', nombre: 'Vainilla de Madagascar', cantidad: 1 },
  ],
  onCobrar,
  onGuardarCuenta
}: TuCuentaProps) {

  const [cantidadProducto, setCantidadProducto] = useState(1);
  const [panelAbierto, setPanelAbierto] = useState(false);

  // Funciones para manejar la cantidad general del producto
  const handleAumentar = () => setCantidadProducto(prev => prev + 1);
  const handleDisminuir = () => setCantidadProducto(prev => (prev > 1 ? prev - 1 : 1));

  // Cálculos
  const subtotal = precioUnitario * cantidadProducto;
  const total = subtotal;

  return (
    <aside className={`${styles.tuCuentaContainer} ${panelAbierto ? styles.panelAbierto : ""}`}>
      <button
        type="button"
        className={styles.toggleMobileBtn}
        onClick={() => setPanelAbierto((abierto) => !abierto)}
        aria-label="Abrir o cerrar Tu cuenta"
      >
        <span className={styles.cuentasInfoMobile}>
          <span className={styles.cuentasBarraMobile}>Cuentas Abiertas</span>
          <strong className={styles.cuentasContadorMobile}>0</strong>
        </span>
        <span className={styles.triangulo}>▼</span>
      </button>

      <header className={styles.header}>
        <h2>Tu cuenta</h2>
        <button className={styles.moreOptionsBtn} aria-label="Más opciones">
          <MoreHorizontal size={20} />
        </button>
      </header>

      {/* Identificador de Mesa */}
      <div className={styles.mesaInfo}>
        <span className={styles.mesaNombre}>{mesa}</span>
        <span className={styles.mesaCodigo}>{codigoMesa}</span>
      </div>

      {/* Producto Principal */}
      <div className={styles.productoGeneral}>
        <div className={styles.productoIconWrapper}>
          <CupSoda size={24} className={styles.productoIcon} />
        </div>
        <div className={styles.productoTextos}>
          <h3>{productoNombre}</h3>
          <p>{productoDetalle}</p>
        </div>
      </div>

      {/* Precio y Controles de Cantidad */}
      <div className={styles.precioYCantidad}>
        <span className={styles.precioMain}>S/ {precioUnitario.toFixed(2)}</span>
        <div className={styles.cantidadControls}>
          <button onClick={handleDisminuir} className={styles.qtyBtn}>-</button>
          <span className={styles.qtyValue}>{cantidadProducto}</span>
          <button onClick={handleAumentar} className={styles.qtyBtn}>+</button>
        </div>
      </div>

      {/* Lista de Sabores Elegidos */}
      <div className={styles.saboresSeccion}>
        <h4 className={styles.saboresTitulo}>SABORES ELEGIDOS</h4>
        <ul className={styles.saboresLista}>
          {sabores.map((sabor) => (
            <li key={sabor.id} className={styles.saborItem}>
              <span>{sabor.nombre}</span>
              <span className={styles.saborCantidad}>x {sabor.cantidad}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Estado de la cuenta */}
      <div className={styles.estadoCuenta}>
        <ReceiptText size={15} className={styles.estadoIcon} />
        <span>Cuenta guardada - editando {mesa}</span>
      </div>

      {/* Resumen Totales */}
      <div className={styles.totalesContainer}>
        <div className={styles.totalesRow}>
          <span>Subtotal</span>
          <span>S/ {subtotal.toFixed(2)}</span>
        </div>
        <div className={`${styles.totalesRow} ${styles.totalFinalRow}`}>
          <span>Total</span>
          <span className={styles.totalFinalMonto}>S/ {total.toFixed(2)}</span>
        </div>
        <p className={styles.igvNota}>Precios en soles - IGV incluido</p>
      </div>

      {/* Botones de Acción */}
      <div className={styles.accionesContainer}>
        <button className={styles.btnCobrar} onClick={onCobrar}>
          Cobrar - S/ {total.toFixed(2)}
        </button>
        <button className={styles.btnGuardar} onClick={onGuardarCuenta}>
          Guardar cuenta
        </button>
      </div>
    </aside>
  );
}