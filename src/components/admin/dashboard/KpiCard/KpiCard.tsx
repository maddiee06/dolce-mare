"use client";
import React from "react";
import styles from "./KpiCard.module.scss";

export interface KpiCardProps {
  title: string;
  value: string;
  subtitle: string;
  subtitleColor?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  subtitleColor = "text-gray-500",
}) => {
  return (
    <div
      className={`${styles.kpiCard} bg-white p-6 rounded-2xl flex flex-col h-full border border-gray-200 shadow-sm`}
    >
      <h3 className="text-gray-500 text-sm font-medium mb-2">{title}</h3>
      <span className="text-gray-900 text-3xl font-bold">{value}</span>
      <p className={`text-xs font-medium mt-auto pt-2 ${subtitleColor}`}>
        {subtitle}
      </p>
    </div>
  );
};
