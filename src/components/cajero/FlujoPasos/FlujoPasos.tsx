import React from 'react';
import styles from './FlujoPasos.module.scss';

const PASOS = [
  { id: 1, label: 'Categoría' },
  { id: 2, label: 'Envase' },
  { id: 3, label: 'Cantidad' },
  { id: 4, label: 'Sabores' }
];

interface FlujoPasosProps {
  pasoActual: number; // Ej: 2 para "Envase"
}

export const FlujoPasos: React.FC<FlujoPasosProps> = ({ pasoActual }) => {
  return (
    <div className={styles.contenedor}>
      {PASOS.map((paso, index) => {
        const isCompleted = paso.id < pasoActual;
        const isCurrent = paso.id === pasoActual;

        return (
          <React.Fragment key={paso.id}>
            <div 
              className={`
                ${styles.paso} 
                ${isCompleted ? styles.completado : ''} 
                ${isCurrent ? styles.actual : ''}
              `}
            >
              <div className={styles.indicador}>
                {isCompleted ? '✓' : `0${paso.id}`}
              </div>
              <span className={styles.etiqueta}>{paso.label}</span>
            </div>
            
            {/* Renderizamos el separador ">" si no es el último elemento */}
            {index < PASOS.length - 1 && (
              <span className={styles.separador}>{'>'}</span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};