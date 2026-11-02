import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { buildQuery, cn } from "@/lib/utils";

/** En-tête de colonne triable : bascule desc → asc, réinitialise la page. */
export function SortLink({
  label,
  field,
  sort,
  basePath,
  params,
  className,
}: {
  label: string;
  field: "date" | "amount";
  sort: string;
  basePath: string;
  params: Record<string, string | undefined>;
  className?: string;
}) {
  const active = sort.startsWith(`${field}_`);
  const direction = active ? sort.split("_")[1] : undefined;
  const next = active && direction === "desc" ? `${field}_asc` : `${field}_desc`;
  const Icon = !active ? ArrowUpDown : direction === "desc" ? ArrowDown : ArrowUp;
  return (
    <Link
      href={`${basePath}${buildQuery({ ...params, sort: next === "date_desc" ? undefined : next, page: undefined })}`}
      className={cn("inline-flex items-center gap-1 hover:text-foreground", active && "text-foreground", className)}
      aria-label={`Trier par ${label.toLowerCase()}`}
      scroll={false}
    >
      {label}
      <Icon className="size-3.5" aria-hidden />
    </Link>
  );
}
