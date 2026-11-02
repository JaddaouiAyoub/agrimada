import type { Metadata } from "next";
import { History } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { UrlFilters } from "@/components/shared/url-filters";
import { requireAdminPage } from "@/lib/auth/session";
import { describeAuditAction, describeChanges } from "@/lib/audit-labels";
import { formatDateTime } from "@/lib/dates";
import { first, parsePage, parsePageSize, pickEnum, pickId, type SearchParams } from "@/lib/validations/filters";
import { getReferenceNames, listAuditLogs } from "@/server/queries/admin";
import { getMemberOptions } from "@/server/queries/operations";
import { getSettings } from "@/server/settings";

export const metadata: Metadata = { title: "Journal d'activité" };

const ENTITY_TYPES = ["Operation", "User", "Category", "FarmSettings"] as const;
const ENTITY_LABELS: Record<(typeof ENTITY_TYPES)[number], string> = {
  Operation: "Opérations",
  User: "Membres",
  Category: "Catégories",
  FarmSettings: "Paramètres",
};

export default async function AuditPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const [, sp, settings] = await Promise.all([requireAdminPage(), searchParams, getSettings()]);
  const [result, members, names] = await Promise.all([
    listAuditLogs({
      entityType: pickEnum(first(sp, "entity"), ENTITY_TYPES),
      actorId: pickId(first(sp, "actor")),
      page: parsePage(sp),
      pageSize: parsePageSize(sp, 50),
    }),
    getMemberOptions(),
    getReferenceNames(),
  ]);
  const values = { entity: first(sp, "entity"), actor: first(sp, "actor") };
  const preserved = { pageSize: first(sp, "pageSize") };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Journal d'activité"
        description="Historique des actions sensibles (opérations, membres, catégories, paramètres, exports)."
      />
      <UrlFilters
        basePath="/audit"
        values={values}
        preserved={preserved}
        fields={[
          {
            kind: "select",
            name: "entity",
            label: "Domaine",
            allLabel: "Tous",
            options: ENTITY_TYPES.map((e) => ({ value: e, label: ENTITY_LABELS[e] })),
          },
          {
            kind: "select",
            name: "actor",
            label: "Auteur",
            allLabel: "Tous",
            options: members.map((m) => ({ value: m.id, label: m.name })),
          },
        ]}
      />
      <Card className="overflow-hidden">
        {result.items.length === 0 ? (
          <EmptyState icon={History} title="Aucune entrée" description="Les actions sensibles apparaîtront ici." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Date</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Auteur</TableHead>
                <TableHead className="hidden md:table-cell">Détails</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((entry) => {
                const changes = describeChanges(entry.metadata, names);
                return (
                  <TableRow key={entry.id}>
                    <TableCell className="tabular whitespace-nowrap text-muted-foreground">
                      {formatDateTime(entry.createdAt, settings.timezone)}
                    </TableCell>
                    <TableCell className="font-medium">{describeAuditAction(entry.action)}</TableCell>
                    <TableCell>{entry.actor?.name ?? "Système"}</TableCell>
                    <TableCell className="hidden max-w-md text-xs text-muted-foreground md:table-cell">
                      {changes.length > 0
                        ? changes.map((c) => `${c.field} : ${c.before} → ${c.after}`).join(" · ")
                        : entry.entityId && names[entry.entityId]
                          ? names[entry.entityId]
                          : "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
        <Pagination
          basePath="/audit"
          params={{ ...values, ...preserved }}
          page={result.page}
          totalPages={result.totalPages}
          total={result.total}
          pageSize={result.pageSize}
          itemLabel="entrée"
        />
      </Card>
    </div>
  );
}
