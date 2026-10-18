"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import styles from './SeleccionSucursal.module.scss';

interface Sucursal {
  id: string;
  nombre: string;
  direccion: string;
  imagenUrl: string;
}

const sucursalesData: Sucursal[] = [
  {
    id: 'nuevo-chimbote',
    nombre: 'Nuevo Chimbote',
    direccion: 'Buenos Aires,\nNuevo Chimbote',
    imagenUrl: '/SedeNvoChim.jpeg', 
  },
  {
    id: 'chimbote',
    nombre: 'Chimbote',
    direccion: 'Malecón Frau 661,\nChimbote',
    imagenUrl: '/SedeChim.jpg', 
  }
];

export default function SeleccionSucursal() {
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState<string>('nuevo-chimbote');

  const handleContinuar = () => {
    console.log('Sucursal seleccionada:', sucursalSeleccionada);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.cardContainer}>
        
        {}
        <header className={styles.header}>
          <Image src="/logo.svg" alt="Dolce Mare" width={180} height={80} priority />
        </header>

        <div className={styles.titles}>
          <h2 className={styles.mainTitle}>Selecciona tu sucursal</h2>
         <p className={styles.subtitle}>Elige donde trabajarás hoy</p> 
        </div>

        {/* Contenedor de Sucursales */}
        <div className={styles.gridSucursales}>
          {sucursalesData.map((sucursal) => {
            const isSelected = sucursalSeleccionada === sucursal.id;
            
            return (
              <div 
                key={sucursal.id} 
                className={`${styles.sucursalCard} ${isSelected ? styles.selected : ''}`}
                onClick={() => setSucursalSeleccionada(sucursal.id)}
              >
                <div className={styles.imageContainer}>
                  <div className={styles.imagePlaceholder}>
                     {/* 3. Cambiamos la ruta fija por la variable dinámica sucursal.imagenUrl */}
                     <img src={sucursal.imagenUrl} alt={`Sede ${sucursal.nombre}`} />
                  </div>
                </div>
                
                <div className={styles.infoContainer}>
                  <div className={styles.checkIcon}>
                    {isSelected ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <div className={styles.emptyCircle} />
                    )}
                  </div>
                  
                  <h3 className={styles.nombre}>{sucursal.nombre}</h3>
                  <p className={styles.direccion}>{sucursal.direccion}</p>
                  
                  <button className={`${styles.btnSeleccionar} ${isSelected ? styles.btnActive : ''}`}>
                    {isSelected ? 'Seleccionada' : 'Seleccionar'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Botón Continuar */}
        <button className={styles.btnContinuar} onClick={handleContinuar}>
          Continuar &rarr;
        </button>

      </div>
    </div>
  );
}