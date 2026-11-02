import Link from "next/link";
import { SignedAmount } from "@/components/shared/badges";
import { OPERATION_TYPE_PATHS } from "@/lib/constants";
import { formatDate } from "@/lib/dates";
import type { OperationListItem } from "@/server/queries/operations";

export function RecentList({
  items,
  dateFormat,
  emptyLabel,
}: {
  items: OperationListItem[];
  dateFormat: string;
  emptyLabel: string;
}) {
  if (items.length === 0) return <p className="py-6 text-center text-sm text-muted-foreground">{emptyLabel}</p>;
  return (
    <ul className="divide-y">
      {items.map((op) => (
        <li key={op.id}>
          <Link
            href={`${OPERATION_TYPE_PATHS[op.type]}/${op.id}`}
            className="-mx-2 flex items-center justify-between gap-3 rounded-md px-2 py-2.5 hover:bg-muted/60"
          >
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">{op.title}</span>
              <span className="block truncate text-xs text-muted-foreground">
                {formatDate(op.date, dateFormat)} · {op.category.name} · {op.member.name}
              </span>
            </span>
            <SignedAmount type={op.type} amount={op.amount} className="text-sm" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
