import Link from "next/link";
import { CategoryLabel, ContributionBadge, OperationTypeBadge, SignedAmount } from "@/components/shared/badges";
import { SortLink } from "@/components/shared/sort-link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OperationRowActions } from "@/components/operations/operation-row-actions";
import { MEMBER_ROLE_LABELS, operationBasePath, type OperationTypeValue } from "@/lib/constants";
import { formatDate } from "@/lib/dates";
import { canEditOperation, type Actor } from "@/lib/permissions";
import type { OperationListItem } from "@/server/queries/operations";

type OperationsTableProps = {
  items: OperationListItem[];
  actor: Actor;
  /** Type fixe (pages Dépenses / Revenus) ; absent pour la vue unifiée. */
  type?: OperationTypeValue;
  dateFormat: string;
  /** Libellé de la colonne membre (ex. « Cotisant »). */
  memberLabel?: string;
  sort?: string;
  basePath?: string;
  params?: Record<string, string | undefined>;
};

export function OperationsTable({
  items,
  actor,
  type,
  dateFormat,
  memberLabel,
  sort,
  basePath,
  params,
}: OperationsTableProps) {
  const sortProps = sort !== undefined && basePath !== undefined && params !== undefined ? { sort, basePath, params } : null;
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>{sortProps ? <SortLink label="Date" field="date" {...sortProps} /> : "Date"}</TableHead>
          {!type && <TableHead className="hidden sm:table-cell">Type</TableHead>}
          <TableHead>Titre</TableHead>
          <TableHead className="hidden md:table-cell">Catégorie</TableHead>
          <TableHead className="hidden lg:table-cell">{memberLabel ?? (type ? MEMBER_ROLE_LABELS[type] : "Membre")}</TableHead>
          <TableHead className="hidden xl:table-cell">Créé par</TableHead>
          <TableHead className="text-right">
            {sortProps ? (
              <SortLink label="Montant" field="amount" {...sortProps} className="justify-end" />
            ) : (
              "Montant"
            )}
          </TableHead>
          <TableHead className="w-10">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((op) => (
          <TableRow key={op.id}>
            <TableCell className="tabular whitespace-nowrap text-muted-foreground">{formatDate(op.date, dateFormat)}</TableCell>
            {!type && (
              <TableCell className="hidden sm:table-cell">
                <div className="flex flex-wrap gap-1">
                  <OperationTypeBadge type={op.type} />
                  {op.isContribution && <ContributionBadge />}
                </div>
              </TableCell>
            )}
            <TableCell className="max-w-64">
              <Link
                href={`${operationBasePath(op)}/${op.id}`}
                className="block truncate font-medium hover:underline"
              >
                {op.title}
              </Link>
              {/* Informations condensées sur petit écran */}
              <span className="block truncate text-xs text-muted-foreground md:hidden">
                {op.category.name} · {op.member.name}
              </span>
              {op.fundsSource === "MEMBER" && (
                <span className="mt-0.5 hidden text-xs text-muted-foreground md:block">
                  {op.type === "EXPENSE" ? "Avance personnelle" : "Conservé par le membre"}
                </span>
              )}
            </TableCell>
            <TableCell className="hidden max-w-56 md:table-cell">
              <CategoryLabel name={op.category.name} color={op.category.color} icon={op.category.icon} />
            </TableCell>
            <TableCell className="hidden lg:table-cell">{op.member.name}</TableCell>
            <TableCell className="hidden text-muted-foreground xl:table-cell">{op.createdBy.name}</TableCell>
            <TableCell className="text-right">
              <SignedAmount type={op.type} amount={op.amount} />
            </TableCell>
            <TableCell>
              <OperationRowActions
                id={op.id}
                type={op.type}
                isContribution={op.isContribution}
                title={op.title}
                canEdit={canEditOperation(actor, op)}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
