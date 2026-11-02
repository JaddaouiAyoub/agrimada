import type { OperationTypeValue } from "@/lib/constants";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { OperationTotals } from "@/server/queries/operations";

/** Totaux correspondant aux filtres actifs (calculés en SQL sur l'ensemble des résultats). */
export function TotalsBar({ totals, type }: { totals: OperationTotals; type?: OperationTypeValue }) {
  const items: { label: string; value: string; className?: string }[] = [
    { label: "Opérations", value: totals.count.toLocaleString("fr-FR") },
  ];
  if (!type || type === "REVENUE") items.push({ label: "Total revenus", value: formatMoney(totals.revenue), className: "text-revenue" });
  if (!type || type === "EXPENSE") items.push({ label: "Total dépenses", value: formatMoney(totals.expense), className: "text-expense" });
  if (!type) {
    const negative = totals.result.startsWith("-");
    items.push({
      label: "Résultat",
      value: formatMoney(totals.result),
      className: negative ? "text-expense" : "text-foreground",
    });
  }

  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="bg-card px-4 py-3">
          <dt className="text-xs text-muted-foreground">{item.label}</dt>
          <dd className={cn("tabular mt-0.5 text-lg font-semibold", item.className)}>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
