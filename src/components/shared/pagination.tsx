import Link from "next/link";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageSizeSelect } from "@/components/shared/page-size-select";
import { buildQuery } from "@/lib/utils";

type PaginationProps = {
  basePath: string;
  params: Record<string, string | undefined>;
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  showPageSize?: boolean;
  itemLabel?: string;
};

/** Pagination serveur : liens conservant les filtres de l'URL. */
export function Pagination({
  basePath,
  params,
  page,
  totalPages,
  total,
  pageSize,
  showPageSize = true,
  itemLabel = "résultat",
}: PaginationProps) {
  const href = (p: number) => `${basePath}${buildQuery({ ...params, page: p > 1 ? p : undefined })}`;
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const nav = (target: number, label: string, icon: React.ReactNode, disabled: boolean) =>
    disabled ? (
      <Button variant="outline" size="icon-sm" disabled aria-label={label}>
        {icon}
      </Button>
    ) : (
      <Button variant="outline" size="icon-sm" asChild>
        <Link href={href(target)} aria-label={label} scroll={false}>
          {icon}
        </Link>
      </Button>
    );

  return (
    <div className="flex flex-col gap-3 border-t px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-muted-foreground">
        {total === 0
          ? `Aucun ${itemLabel}`
          : `${start.toLocaleString("fr-FR")}–${end.toLocaleString("fr-FR")} sur ${total.toLocaleString("fr-FR")} ${itemLabel}${total > 1 ? "s" : ""}`}
      </p>
      <div className="flex items-center gap-3">
        {showPageSize && <PageSizeSelect basePath={basePath} params={params} value={pageSize} />}
        <nav className="flex items-center gap-1" aria-label="Pagination">
          {nav(1, "Première page", <ChevronsLeft />, page <= 1)}
          {nav(page - 1, "Page précédente", <ChevronLeft />, page <= 1)}
          <span className="px-2 tabular text-muted-foreground">
            {page} / {totalPages}
          </span>
          {nav(page + 1, "Page suivante", <ChevronRight />, page >= totalPages)}
          {nav(totalPages, "Dernière page", <ChevronsRight />, page >= totalPages)}
        </nav>
      </div>
    </div>
  );
}
