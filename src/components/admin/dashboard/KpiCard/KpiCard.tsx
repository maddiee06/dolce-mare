"use client";
import React from "react";
import styles from "./KpiCard.module.scss";

export interface KpiCardProps {
  title: string;
  value: string;
  subtitle: string;
  subtitleColor?: string;
  delay?: number;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  subtitleColor = "text-texto-mutado",
  delay,
}) => {
  return (
    <div
      style={delay !== undefined ? { animationDelay: `${delay}ms` } : undefined}
      className={`${styles.kpiCard} bg-superficie p-6 rounded-2xl flex flex-col h-full border border-borde-gris shadow-sm`}
    >
      <h3 className="text-texto-mutado text-sm font-medium mb-2">{title}</h3>
      <span className="text-texto-oscuro text-3xl font-bold">{value}</span>
      <p className={`text-xs font-medium mt-auto pt-2 ${subtitleColor}`}>
        {subtitle}
      </p>
    </div>
  );
};
