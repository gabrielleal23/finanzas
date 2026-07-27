"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import type { KindBreakdown } from "@/lib/reports";
import { KIND_LABELS } from "@/lib/reports";
import { formatCop } from "@/lib/utils";

const COLORS = ["#059669", "#0ea5e9", "#f59e0b", "#8b5cf6"];

export function AssetBreakdownChart({ data }: { data: KindBreakdown[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-slate-500">Sin datos todavía.</p>;
  }

  const chartData = data.map((d) => ({ name: KIND_LABELS[d.kind], value: d.valueCop }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
        >
          {chartData.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => formatCop(Number(value))} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
