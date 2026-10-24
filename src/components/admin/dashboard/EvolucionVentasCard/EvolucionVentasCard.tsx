import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import styles from "./EvolucionVentasCard.module.scss";

// 1. Interfaces principales
export interface VentaDiaData {
  dia: string;
  total: number;
  esHoy: boolean;
}

interface EvolucionVentasCardProps {
  datos: VentaDiaData[];
  acumulado: string;
  rangoFechas: string;
}

// 2. Interfaces para Recharts (Soluciona el error de "any")
interface CustomDotProps {
  cx?: number;
  cy?: number;
  payload?: VentaDiaData;
}

interface CustomXAxisTickProps {
  x?: number;
  y?: number;
  payload?: { value: string };
}

// 3. Componentes de Recharts extraídos para mejorar el rendimiento (evita re-renders)
const CustomDot = (props: CustomDotProps) => {
  const { cx, cy, payload } = props;

  if (cx === undefined || cy === undefined || !payload) return null;

  if (payload.esHoy) {
    return (
      <g>
        {/* Círculo Coral */}
        <circle
          cx={cx}
          cy={cy}
          r={5}
          stroke="#fff"
          strokeWidth={2}
          fill="#f27a4d"
        />
        {/* Etiqueta debajo del punto */}
        <foreignObject
          x={cx - 40}
          y={cy + 15}
          width={80}
          height={30}
          style={{ overflow: "visible" }}
        >
          <div className="flex justify-center w-full">
            <span className={styles.customLabel}>
              S/{" "}
              {payload.total.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
        </foreignObject>
      </g>
    );
  }

  // Puntos normales (Azul oscuro)
  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      stroke="#fff"
      strokeWidth={2}
      fill="#1a365d"
    />
  );
};

const CustomXAxisTick = (props: CustomXAxisTickProps) => {
  const { x, y, payload } = props;

  if (x === undefined || y === undefined || !payload) return null;

  const isHoy = payload.value.includes("Hoy");
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor="middle"
        fill={isHoy ? "#1a365d" : "#9ca3af"}
        fontSize={12}
        fontWeight={isHoy ? 600 : 400}
      >
        {payload.value}
      </text>
    </g>
  );
};

// 4. Componente Principal
export const EvolucionVentasCard: React.FC<EvolucionVentasCardProps> = ({
  datos,
  acumulado,
  rangoFechas,
}) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm w-full h-full flex flex-col">
      {/* Cabecera */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className={`${styles.cardTitle} font-semibold text-lg`}>
            Evolución de ventas
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Últimos 7 días · {acumulado} acumulados
          </p>
        </div>

        {/* Selector de Fechas */}
        <select
          className={`${styles.dateSelector} text-sm font-medium py-2 px-3 rounded-lg outline-none cursor-pointer appearance-none pr-8 relative bg-no-repeat bg-[right_0.5rem_center] bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%231a365d%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')]`}
        >
          <option>{rangoFechas}</option>
          <option>Mes anterior</option>
        </select>
      </div>

      {/* Contenedor del Gráfico */}
      <div className="flex-1 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%" minHeight={300}>
          <LineChart
            data={datos}
            margin={{ top: 10, right: 60, left: -20, bottom: 20 }}
          >
            {/* Grilla horizontal */}
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f3f4f6"
            />

            <XAxis
              dataKey="dia"
              axisLine={false}
              tickLine={false}
              tick={<CustomXAxisTick />}
              padding={{ left: 20, right: 20 }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              tickFormatter={(value: number) => value.toLocaleString()}
            />

            <Tooltip
              formatter={(value: unknown) => [
                `S/ ${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
                "Total",
              ]}
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            />

            {/* La línea principal */}
            <Line
              type="monotone"
              dataKey="total"
              stroke="#1a365d"
              strokeWidth={3}
              dot={<CustomDot />}
              activeDot={{
                r: 6,
                fill: "#1a365d",
                stroke: "#fff",
                strokeWidth: 2,
              }}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
