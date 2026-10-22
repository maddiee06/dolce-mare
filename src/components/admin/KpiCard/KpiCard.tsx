import React from "react";

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
  subtitleColor = "text-gray-400",
}) => {
  return (
    <div className="bg-[#1e1e24] p-5 rounded-2xl flex flex-col gap-2 border border-gray-800">
      <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
      <span className="text-white text-3xl font-bold">{value}</span>
      <p className={`text-xs font-medium mt-1 ${subtitleColor}`}>{subtitle}</p>
    </div>
  );
};
