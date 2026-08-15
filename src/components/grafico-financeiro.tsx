"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { money } from "@/lib/format";

// Duas cores validadas para leitura por quem enxerga cores de forma diferente.
const ENTROU = "#2a78d6";
const SAIU = "#eb6834";

const TINTA_FRACA = "#898781";
const GRADE = "#e1e0d9";

type Ponto = { mes: string; entrou: number; saiu: number };

/** Quanto entrou e quanto saiu, mes a mes. */
export function GraficoFinanceiro({ dados }: { dados: Ponto[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={dados} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid stroke={GRADE} vertical={false} />
          <XAxis
            dataKey="mes"
            tickLine={false}
            axisLine={{ stroke: GRADE }}
            tick={{ fill: TINTA_FRACA, fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={70}
            tick={{ fill: TINTA_FRACA, fontSize: 12 }}
            tickFormatter={(v: number) =>
              v >= 1000 ? `${Math.round(v / 1000)} mil` : String(v)
            }
          />
          <Tooltip
            cursor={{ fill: "rgba(11,11,11,0.04)" }}
            formatter={(valor, nome) => [money(Number(valor)), nome]}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid rgba(11,11,11,0.10)",
              fontSize: 13,
            }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 13, color: "#52514e" }}
          />
          <Bar
            dataKey="entrou"
            name="Entrou"
            fill={ENTROU}
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />
          <Bar
            dataKey="saiu"
            name="Saiu"
            fill={SAIU}
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
