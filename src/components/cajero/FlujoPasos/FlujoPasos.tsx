import React from 'react';
import { LayoutGrid, ListOrdered, CupSoda, IceCreamCone } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import styles from './FlujoPasos.module.scss';

interface Paso {
  id: number;
  label: string;
  Icono: LucideIcon;
}

const PASOS: Paso[] = [
  { id: 1, label: 'Categoría', Icono: LayoutGrid },
  { id: 2, label: 'Cantidad', Icono: ListOrdered },
  { id: 3, label: 'Envase', Icono: CupSoda },
  { id: 4, label: 'Sabores', Icono: IceCreamCone },
];

interface FlujoPasosProps {
  pasoActual: number; // Ej: 2 para "Cantidad"
}

export const FlujoPasos: React.FC<FlujoPasosProps> = ({ pasoActual }) => {
  return (
    <nav aria-label="Progreso del pedido">
      <ol className={styles.contenedor}>
        {PASOS.map(({ id, label, Icono }, index) => {
          const isCompleted = id < pasoActual;
          const isCurrent = id === pasoActual;

          const clasePaso = [
            styles.paso,
            isCompleted && styles.completado,
            isCurrent && styles.actual,
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <React.Fragment key={id}>
              <li className={clasePaso} aria-current={isCurrent ? 'step' : undefined}>
                <span className={styles.indicador} aria-hidden="true">
                  <Icono size={16} strokeWidth={2} />
                </span>
                <span className={styles.etiqueta}>{label}</span>
              </li>

              {index < PASOS.length - 1 && (
                <li className={styles.separador} aria-hidden="true">
                  <span>{'>'}</span>
                </li>
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};