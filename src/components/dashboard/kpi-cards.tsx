import { ArrowDownRight, ArrowUpRight, Hash, Scale, TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatMoney, formatPercent } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { OperationTotals } from "@/server/queries/operations";

type Kpi = {
  label: string;
  value: string;
  icon: LucideIcon;
  tone: "revenue" | "expense" | "neutral";
  hint?: string;
  delta?: { ratio: number; goodWhenUp: boolean } | null;
};

/** Variation relative ; null si la période précédente est nulle (non significatif). */
function delta(current: string, previous: string | undefined): number | null {
  if (previous === undefined) return null;
  const p = Number(previous);
  if (p === 0) return null;
  return (Number(current) - p) / Math.abs(p);
}

export function KpiCards({
  totals,
  previous,
  month,
  periodLabel,
  monthLabel,
}: {
  totals: OperationTotals;
  previous: OperationTotals | null;
  month: OperationTotals;
  periodLabel: string;
  monthLabel: string;
}) {
  const kpis: Kpi[] = [
    {
      label: "Revenus",
      value: formatMoney(totals.revenue),
      icon: ArrowUpRight,
      tone: "revenue",
      hint: periodLabel,
      delta: previous ? { ratio: delta(totals.revenue, previous.revenue) ?? NaN, goodWhenUp: true } : null,
    },
    {
      label: "Dépenses",
      value: formatMoney(totals.expense),
      icon: ArrowDownRight,
      tone: "expense",
      hint: periodLabel,
      delta: previous ? { ratio: delta(totals.expense, previous.expense) ?? NaN, goodWhenUp: false } : null,
    },
    {
      label: "Résultat financier",
      value: formatMoney(totals.result),
      icon: Scale,
      tone: "neutral",
      hint: "Revenus − dépenses (hors trésorerie)",
      delta: previous ? { ratio: delta(totals.result, previous.result) ?? NaN, goodWhenUp: true } : null,
    },
    { label: "Revenus du mois", value: formatMoney(month.revenue), icon: TrendingUp, tone: "revenue", hint: monthLabel },
    { label: "Dépenses du mois", value: formatMoney(month.expense), icon: TrendingDown, tone: "expense", hint: monthLabel },
    {
      label: "Opérations",
      value: totals.count.toLocaleString("fr-FR"),
      icon: Hash,
      tone: "neutral",
      hint: `${totals.revenueCount} revenu(s) · ${totals.expenseCount} dépense(s)`,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {kpis.map((kpi) => {
        const negativeResult = kpi.label === "Résultat financier" && totals.result.startsWith("-");
        const hasDelta = kpi.delta && Number.isFinite(kpi.delta.ratio);
        const good = hasDelta && kpi.delta ? (kpi.delta.ratio >= 0) === kpi.delta.goodWhenUp : false;
        return (
          <Card key={kpi.label} className="gap-3 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-lg",
                  kpi.tone === "revenue" && "bg-revenue-soft text-revenue",
                  kpi.tone === "expense" && "bg-expense-soft text-expense",
                  kpi.tone === "neutral" && "bg-secondary text-primary",
                )}
              >
                <kpi.icon className="size-4" aria-hidden />
              </span>
            </div>
            <p className={cn("text-2xl font-semibold tracking-tight", negativeResult && "text-expense")}>{kpi.value}</p>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              {hasDelta && kpi.delta && (
                <span className={cn("inline-flex items-center gap-0.5 font-medium", good ? "text-success" : "text-expense")}>
                  {kpi.delta.ratio >= 0 ? <ArrowUpRight className="size-3.5" aria-hidden /> : <ArrowDownRight className="size-3.5" aria-hidden />}
                  {formatPercent(kpi.delta.ratio)}
                  <span className="sr-only"> par rapport à la période précédente</span>
                </span>
              )}
              {kpi.delta && !hasDelta && <span>Pas de base de comparaison ·</span>}
              <span className="truncate">{kpi.hint}</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
