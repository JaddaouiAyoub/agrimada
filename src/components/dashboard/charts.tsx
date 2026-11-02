"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCompact, formatMoney } from "@/lib/money";

// Couleurs par rôle (identiques dans tous les graphiques) :
// revenus = vert, dépenses = orange, résultat = bleu. Les textes restent en encre neutre.
const COLORS = {
  revenue: "var(--revenue)",
  expense: "var(--expense)",
  result: "var(--result)",
  grid: "var(--chart-grid)",
  axis: "var(--chart-axis)",
  other: "#b4b2a9",
};

const axisProps = {
  stroke: COLORS.axis,
  tick: { fill: COLORS.axis, fontSize: 12 },
  tickLine: false,
  axisLine: false,
} as const;

const tooltipProps = {
  cursor: { fill: "rgba(36, 83, 61, 0.06)" },
  contentStyle: {
    borderRadius: 8,
    border: "1px solid var(--border)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    fontSize: 13,
  },
  formatter: (value: unknown) => formatMoney(Number(value)),
};

export type ChartPoint = { label: string; revenue: number; expense: number; result: number; cumulative: number };

export function RevenueExpenseChart({ data }: { data: ChartPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={2}>
        <CartesianGrid vertical={false} stroke={COLORS.grid} />
        <XAxis dataKey="label" {...axisProps} minTickGap={12} />
        <YAxis {...axisProps} width={56} tickFormatter={(v: number) => formatCompact(v)} />
        <Tooltip {...tooltipProps} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 13 }} />
        <Bar dataKey="revenue" name="Revenus" fill={COLORS.revenue} radius={[4, 4, 0, 0]} maxBarSize={28} />
        <Bar dataKey="expense" name="Dépenses" fill={COLORS.expense} radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ResultChart({ data }: { data: ChartPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={COLORS.grid} />
        <XAxis dataKey="label" {...axisProps} minTickGap={12} />
        <YAxis {...axisProps} width={56} tickFormatter={(v: number) => formatCompact(v)} />
        <ReferenceLine y={0} stroke={COLORS.axis} />
        <Tooltip {...tooltipProps} cursor={{ stroke: COLORS.axis, strokeDasharray: "3 3" }} />
        <Line
          type="monotone"
          dataKey="cumulative"
          name="Résultat cumulé"
          stroke={COLORS.result}
          strokeWidth={2}
          dot={data.length <= 24 ? { r: 3, strokeWidth: 0, fill: COLORS.result } : false}
          activeDot={{ r: 5, stroke: "var(--card)", strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export type CategoryDatum = { name: string; value: number };

/** Barres horizontales triées, une seule teinte (la catégorie est lue sur l'axe). */
export function CategoryBarChart({ data, color }: { data: CategoryDatum[]; color: "revenue" | "expense" }) {
  const MAX = 7;
  const rows =
    data.length > MAX + 1
      ? [
          ...data.slice(0, MAX),
          { name: `Autres (${data.length - MAX})`, value: data.slice(MAX).reduce((s, d) => s + d.value, 0) },
        ]
      : data;
  const height = Math.max(120, rows.length * 36 + 16);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name"
          {...axisProps}
          width={150}
          tick={{ fill: "var(--foreground)", fontSize: 12 }}
          tickFormatter={(v: string) => (v.length > 22 ? `${v.slice(0, 21)}…` : v)}
        />
        <Tooltip {...tooltipProps} />
        <Bar dataKey="value" name="Montant" radius={[0, 4, 4, 0]} maxBarSize={22}>
          {rows.map((r) => (
            <Cell key={r.name} fill={r.name.startsWith("Autres (") ? COLORS.other : COLORS[color]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export type MemberDatum = { name: string; expense: number; revenue: number };

export function MemberChart({ data }: { data: MemberDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={2}>
        <CartesianGrid vertical={false} stroke={COLORS.grid} />
        <XAxis dataKey="name" {...axisProps} interval={0} tickFormatter={(v: string) => v.split(" ")[0] ?? v} />
        <YAxis {...axisProps} width={56} tickFormatter={(v: number) => formatCompact(v)} />
        <Tooltip {...tooltipProps} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 13 }} />
        <Bar dataKey="expense" name="Dépenses payées" fill={COLORS.expense} radius={[4, 4, 0, 0]} maxBarSize={32} />
        <Bar dataKey="revenue" name="Revenus encaissés" fill={COLORS.revenue} radius={[4, 4, 0, 0]} maxBarSize={32} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TypeSplitChart({ revenueCount, expenseCount }: { revenueCount: number; expenseCount: number }) {
  const data = [
    { name: "Revenus", value: revenueCount, color: COLORS.revenue },
    { name: "Dépenses", value: expenseCount, color: COLORS.expense },
  ];
  const total = revenueCount + expenseCount;
  return (
    <div className="flex items-center gap-6">
      <div className="relative size-36 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={46}
              outerRadius={68}
              paddingAngle={total > 0 && revenueCount > 0 && expenseCount > 0 ? 2 : 0}
              stroke="var(--card)"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipProps.contentStyle} formatter={(v: unknown) => `${Number(v)} opération(s)`} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="tabular text-xl font-semibold">{total.toLocaleString("fr-FR")}</span>
          <span className="text-xs text-muted-foreground">opérations</span>
        </div>
      </div>
      <ul className="space-y-2 text-sm">
        {data.map((d) => (
          <li key={d.name} className="flex items-center gap-2">
            <span className="size-2.5 rounded-full" style={{ backgroundColor: d.color }} aria-hidden />
            <span className="text-muted-foreground">{d.name}</span>
            <span className="tabular font-medium">
              {d.value.toLocaleString("fr-FR")}
              {total > 0 && <span className="ml-1 text-muted-foreground">({Math.round((d.value / total) * 100)} %)</span>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
