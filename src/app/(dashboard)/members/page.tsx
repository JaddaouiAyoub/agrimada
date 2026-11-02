import type { Metadata } from "next";
import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { UserStatusBadge } from "@/components/shared/badges";
import { UrlFilters } from "@/components/shared/url-filters";
import { MemberActions } from "@/components/members/member-actions";
import { CreateMemberButton } from "@/components/members/member-dialogs";
import { requireAdminPage } from "@/lib/auth/session";
import { ROLES, ROLE_LABELS, USER_STATUSES, USER_STATUS_LABELS } from "@/lib/constants";
import { formatDateTime } from "@/lib/dates";
import { first, parsePage, parsePageSize, parseSearch, pickEnum, type SearchParams } from "@/lib/validations/filters";
import { listMembers } from "@/server/queries/admin";
import { getSettings } from "@/server/settings";

export const metadata: Metadata = { title: "Membres" };

export default async function MembersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const [actor, sp, settings] = await Promise.all([requireAdminPage(), searchParams, getSettings()]);
  const filters = {
    q: parseSearch(sp),
    role: pickEnum(first(sp, "role"), ROLES),
    status: pickEnum(first(sp, "status"), USER_STATUSES),
    page: parsePage(sp),
    pageSize: parsePageSize(sp),
  };
  const result = await listMembers(filters);
  const values = { q: first(sp, "q"), role: first(sp, "role"), status: first(sp, "status") };
  const preserved = { pageSize: first(sp, "pageSize") };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion des membres"
        description="Comptes des associés. Un membre désactivé ne peut plus se connecter ; son historique est conservé."
        actions={<CreateMemberButton />}
      />
      <UrlFilters
        basePath="/members"
        values={values}
        preserved={preserved}
        fields={[
          { kind: "search", name: "q", label: "Recherche", placeholder: "Nom ou email…", className: "w-full sm:w-64" },
          {
            kind: "select",
            name: "role",
            label: "Rôle",
            allLabel: "Tous les rôles",
            options: ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] })),
          },
          {
            kind: "select",
            name: "status",
            label: "Statut",
            allLabel: "Tous les statuts",
            options: USER_STATUSES.map((s) => ({ value: s, label: USER_STATUS_LABELS[s] })),
          },
        ]}
      />
      <Card className="overflow-hidden">
        {result.items.length === 0 ? (
          <EmptyState icon={Users} title="Aucun membre trouvé" description="Modifiez les filtres de recherche." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Nom</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="hidden lg:table-cell">Créé le</TableHead>
                <TableHead className="hidden lg:table-cell">Dernière connexion</TableHead>
                <TableHead className="hidden sm:table-cell text-right">Opérations</TableHead>
                <TableHead className="w-10">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">
                    {m.name}
                    {m.id === actor.id && <span className="ml-1.5 text-xs text-muted-foreground">(vous)</span>}
                    <span className="block text-xs font-normal text-muted-foreground md:hidden">{m.email}</span>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">{m.email}</TableCell>
                  <TableCell>
                    <Badge variant={m.role === "ADMIN" ? "secondary" : "outline"}>{ROLE_LABELS[m.role]}</Badge>
                  </TableCell>
                  <TableCell>
                    <UserStatusBadge status={m.status} />
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground lg:table-cell">
                    {formatDateTime(m.createdAt, settings.timezone)}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground lg:table-cell">
                    {m.lastLoginAt ? formatDateTime(m.lastLoginAt, settings.timezone) : "Jamais"}
                  </TableCell>
                  <TableCell className="tabular hidden text-right sm:table-cell">{m.operationsCount}</TableCell>
                  <TableCell>
                    <MemberActions
                      isSelf={m.id === actor.id}
                      member={{
                        id: m.id,
                        name: m.name,
                        email: m.email,
                        role: m.role,
                        status: m.status,
                        neverActivated: m.neverActivated,
                        deletable: m.deletable,
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <Pagination
          basePath="/members"
          params={{ ...values, ...preserved }}
          page={result.page}
          totalPages={result.totalPages}
          total={result.total}
          pageSize={result.pageSize}
          itemLabel="membre"
        />
      </Card>
    </div>
  );
}
