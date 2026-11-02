import type { Metadata } from "next";
import { Tags } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CategoryLabel, OperationTypeBadge } from "@/components/shared/badges";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { UrlFilters } from "@/components/shared/url-filters";
import { CategoryActions, CreateCategoryButton } from "@/components/categories/category-components";
import { requireAdminPage } from "@/lib/auth/session";
import { OPERATION_TYPES, OPERATION_TYPE_LABELS } from "@/lib/constants";
import { formatDateTime } from "@/lib/dates";
import { first, parsePage, parsePageSize, parseSearch, pickEnum, type SearchParams } from "@/lib/validations/filters";
import { listCategories } from "@/server/queries/admin";
import { getSettings } from "@/server/settings";

export const metadata: Metadata = { title: "Catégories" };

export default async function CategoriesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const [, sp, settings] = await Promise.all([requireAdminPage(), searchParams, getSettings()]);
  const statusParam = pickEnum(first(sp, "status"), ["active", "inactive"] as const);
  const type = pickEnum(first(sp, "type"), OPERATION_TYPES);
  const result = await listCategories({
    q: parseSearch(sp),
    type,
    active: statusParam === undefined ? undefined : statusParam === "active",
    page: parsePage(sp),
    pageSize: parsePageSize(sp, 50),
  });
  const values = { q: first(sp, "q"), type: first(sp, "type"), status: first(sp, "status") };
  const preserved = { pageSize: first(sp, "pageSize") };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Catégories"
        description="Catégories de dépenses et de revenus. Préférez la désactivation à la suppression pour préserver l'historique."
        actions={<CreateCategoryButton defaultType={type ?? "EXPENSE"} />}
      />
      <UrlFilters
        basePath="/categories"
        values={values}
        preserved={preserved}
        fields={[
          { kind: "search", name: "q", label: "Recherche", placeholder: "Nom…", className: "w-full sm:w-64" },
          {
            kind: "select",
            name: "type",
            label: "Type",
            allLabel: "Tous les types",
            options: OPERATION_TYPES.map((t) => ({ value: t, label: OPERATION_TYPE_LABELS[t] })),
          },
          {
            kind: "select",
            name: "status",
            label: "Statut",
            allLabel: "Tous",
            options: [
              { value: "active", label: "Actives" },
              { value: "inactive", label: "Inactives" },
            ],
          },
        ]}
      />
      <Card className="overflow-hidden">
        {result.items.length === 0 ? (
          <EmptyState
            icon={Tags}
            title="Aucune catégorie"
            description="Créez une catégorie ou lancez l'initialisation (npm run db:seed)."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Nom</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="hidden lg:table-cell">Description</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="hidden md:table-cell">Créée le</TableHead>
                <TableHead className="text-right">Opérations</TableHead>
                <TableHead className="w-10">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((c, index) => {
                const prev = result.items[index - 1];
                const next = result.items[index + 1];
                return (
                  <TableRow key={c.id} className={c.isActive ? undefined : "opacity-70"}>
                    <TableCell className="max-w-64 font-medium">
                      <CategoryLabel name={c.name} color={c.color} icon={c.icon} />
                    </TableCell>
                    <TableCell>
                      <OperationTypeBadge type={c.type} />
                    </TableCell>
                    <TableCell className="hidden max-w-72 truncate text-muted-foreground lg:table-cell">
                      {c.description ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={c.isActive ? "revenue" : "muted"}>{c.isActive ? "Active" : "Inactive"}</Badge>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {formatDateTime(c.createdAt, settings.timezone)}
                    </TableCell>
                    <TableCell className="tabular text-right">{c.operationsCount}</TableCell>
                    <TableCell>
                      <CategoryActions
                        category={c}
                        isFirst={!prev || prev.type !== c.type}
                        isLast={!next || next.type !== c.type}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
        <Pagination
          basePath="/categories"
          params={{ ...values, ...preserved }}
          page={result.page}
          totalPages={result.totalPages}
          total={result.total}
          pageSize={result.pageSize}
          itemLabel="catégorie"
        />
      </Card>
    </div>
  );
}
