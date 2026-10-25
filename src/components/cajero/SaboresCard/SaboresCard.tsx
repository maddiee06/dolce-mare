import React from 'react';
import Image from 'next/image';
import styles from './SaboresCard.module.scss';

interface SaboresCardProps {
  titulo: string;
  descripcion: string;
  precio: number;
  capacidadMl: string;
  imagen: string;
  disabled?: boolean;
  onSelect?: () => void;
}

export const SaboresCard: React.FC<SaboresCardProps> = ({
  titulo,
  descripcion,
  precio,
  capacidadMl,
  imagen,
  disabled = false,
  onSelect,
}) => {
  return (
    <div 
      className={`${styles.card} ${disabled ? styles.disabled : ''}`} 
      onClick={!disabled ? onSelect : undefined}
    >
      <div className={styles.imagenContenedor}>
        <Image
          src={imagen}
          alt={titulo}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 300px"
        />
        {disabled && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center p-2 text-center">
            <span className="text-xs font-semibold bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
              No disponible para este envase
            </span>
          </div>
        )}
      </div>

      <div className={styles.contenido}>
        <div>
          <h3 className={styles.titulo}>{titulo}</h3>
          <p className={styles.descripcion}>{descripcion}</p>
        </div>

        <div className={styles.precioContainer}>
          <span className={styles.precio}>S/ {precio.toFixed(2)}</span>
          <span className={styles.nota}>{capacidadMl}</span>
        </div>
      </div>
    </div>
  );
};