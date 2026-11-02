import { createElement } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getCategoryIcon } from "@/lib/category-icons";
import {
  OPERATION_TYPE_LABELS,
  USER_STATUS_LABELS,
  type OperationTypeValue,
  type UserStatusValue,
} from "@/lib/constants";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

export function OperationTypeBadge({ type }: { type: OperationTypeValue }) {
  return (
    <Badge variant={type === "REVENUE" ? "revenue" : "expense"}>
      {type === "REVENUE" ? <ArrowUpRight aria-hidden /> : <ArrowDownRight aria-hidden />}
      {OPERATION_TYPE_LABELS[type]}
    </Badge>
  );
}

export function CategoryLabel({
  name,
  color,
  icon,
  inactive,
}: {
  name: string;
  color: string | null;
  icon: string | null;
  inactive?: boolean;
}) {
  const iconElement = createElement(getCategoryIcon(icon), { className: "size-3" });
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      <span
        className="flex size-5 shrink-0 items-center justify-center rounded"
        style={{ backgroundColor: color ? `${color}22` : "var(--muted)", color: color ?? "var(--muted-foreground)" }}
        aria-hidden
      >
        {iconElement}
      </span>
      <span className="truncate">{name}</span>
      {inactive && <Badge variant="muted">inactive</Badge>}
    </span>
  );
}

export function UserStatusBadge({ status }: { status: UserStatusValue }) {
  const variant = status === "ACTIVE" ? "revenue" : status === "PENDING" ? "warning" : "muted";
  return <Badge variant={variant}>{USER_STATUS_LABELS[status]}</Badge>;
}

/** Montant signé selon le type : + pour un revenu, − pour une dépense. */
export function SignedAmount({
  type,
  amount,
  className,
}: {
  type: OperationTypeValue;
  amount: string;
  className?: string;
}) {
  return (
    <span className={cn("tabular font-medium whitespace-nowrap", type === "REVENUE" ? "text-revenue" : "text-expense", className)}>
      {type === "REVENUE" ? "+" : "−"}
      {formatMoney(amount)}
    </span>
  );
}
