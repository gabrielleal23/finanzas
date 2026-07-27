"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { MonthPoint } from "@/lib/reports";
import { formatCop, monthLabel } from "@/lib/utils";

export function NetWorthChart({ data }: { data: MonthPoint[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-slate-500">Aún no hay snapshots mensuales para graficar.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="month"
          tickFormatter={(m) => monthLabel(m)}
          tick={{ fontSize: 12 }}
        />
        <YAxis
          tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`}
          tick={{ fontSize: 12 }}
          width={50}
        />
        <Tooltip
          formatter={(value) => formatCop(Number(value))}
          labelFormatter={(m) => monthLabel(m as string)}
        />
        <Line type="monotone" dataKey="valueCop" stroke="#059669" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
