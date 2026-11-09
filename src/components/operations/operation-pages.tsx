import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Download, Inbox, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { UrlFilters, type FilterField } from "@/components/shared/url-filters";
import { CategoryLabel, ContributionBadge, OperationTypeBadge, SignedAmount } from "@/components/shared/badges";
import { OperationForm } from "@/components/operations/operation-form";
import { OperationRowActions } from "@/components/operations/operation-row-actions";
import { OperationsTable } from "@/components/operations/operations-table";
import { TotalsBar } from "@/components/operations/totals-bar";
import { AuditHistory } from "@/components/operations/audit-history";
import { requireUser } from "@/lib/auth/session";
import {
  COUNTERPARTY_LABELS,
  FUNDS_SOURCE_LABELS,
  MEMBER_ROLE_LABELS,
  OPERATION_TYPES,
  OPERATION_TYPE_LABELS,
  OPERATION_TYPE_PLURAL,
  PAYMENT_METHOD_LABELS,
  operationBasePath,
  type OperationTypeValue,
} from "@/lib/constants";
import { formatDate, formatDateTime, todayInTimeZone } from "@/lib/dates";
import { amountToInput } from "@/lib/money";
import { canChooseOperationMember, canEditOperation } from "@/lib/permissions";
import { buildQuery } from "@/lib/utils";
import { ID_REGEX } from "@/lib/validations/common";
import { first, parseOperationListFilters, type SearchParams } from "@/lib/validations/filters";
import type { OperationFormValues } from "@/lib/validations/operation";
import { getEntityHistory, getReferenceNames } from "@/server/queries/admin";
import { getCategoryOptions, getMemberOptions, getOperation, listOperations } from "@/server/queries/operations";
import { getSettings } from "@/server/settings";

const FILTER_KEYS = ["q", "type", "member", "category", "from", "to", "min", "max"] as const;

// ---------------------------------------------------------------------------
// Liste (Dépenses, Revenus, Cotisations, ou vue unifiée « Opérations »)
// ---------------------------------------------------------------------------

export async function OperationListPage({
  type,
  contribution = false,
  basePath,
  searchParams,
}: {
  type?: OperationTypeValue;
  /** Avec type = REVENUE : true = rubrique Cotisations, false = Revenus hors cotisations. */
  contribution?: boolean;
  basePath: string;
  searchParams: SearchParams;
}) {
  const user = await requireUser();
  const isContributions = type === "REVENUE" && contribution;
  const filters = {
    ...parseOperationListFilters(searchParams, type),
    isContribution: type === "REVENUE" ? isContributions : undefined,
  };
  const [result, members, categories, settings] = await Promise.all([
    listOperations(filters),
    getMemberOptions(),
    getCategoryOptions(type),
    getSettings(),
  ]);

  const values = Object.fromEntries(FILTER_KEYS.map((k) => [k, first(searchParams, k)]));
  const preserved = { sort: first(searchParams, "sort"), pageSize: first(searchParams, "pageSize") };
  const params = { ...values, ...preserved };
  const hasFilters = FILTER_KEYS.some((k) => k !== "type" && values[k]);

  const fields: FilterField[] = [
    {
      kind: "search",
      name: "q",
      label: "Recherche",
      placeholder: isContributions
        ? "Titre, note…"
        : type === "REVENUE"
          ? "Titre, client…"
          : type === "EXPENSE"
            ? "Titre, fournisseur…"
            : "Titre, tiers, référence…",
      className: "w-full sm:w-64",
    },
    ...(!type
      ? [
          {
            kind: "select" as const,
            name: "type",
            label: "Type",
            allLabel: "Tous les types",
            options: OPERATION_TYPES.map((t) => ({ value: t, label: OPERATION_TYPE_LABELS[t] })),
          },
        ]
      : []),
    {
      kind: "select",
      name: "member",
      label: isContributions ? "Cotisant" : type ? MEMBER_ROLE_LABELS[type] : "Membre",
      allLabel: "Tous les membres",
      options: members.map((m) => ({ value: m.id, label: m.status === "DISABLED" ? `${m.name} (désactivé)` : m.name })),
    },
    {
      kind: "select",
      name: "category",
      label: "Catégorie",
      allLabel: "Toutes les catégories",
      options: categories.map((c) => ({
        value: c.id,
        label: `${type ? "" : `${OPERATION_TYPE_LABELS[c.type]} · `}${c.name}${c.isActive ? "" : " (inactive)"}`,
      })),
      className: "sm:w-56",
    },
    { kind: "date", name: "from", label: "Du" },
    { kind: "date", name: "to", label: "Au" },
    { kind: "amount", name: "min", label: "Montant min.", className: "w-28" },
    { kind: "amount", name: "max", label: "Montant max.", className: "w-28" },
  ];

  const title = isContributions ? "Cotisations" : type ? OPERATION_TYPE_PLURAL[type] : "Opérations";
  const exportDataset = isContributions
    ? "contributions"
    : type === "EXPENSE"
      ? "expenses"
      : type === "REVENUE"
        ? "revenues"
        : "operations";
  const newLabel = isContributions ? "Nouvelle cotisation" : type === "EXPENSE" ? "Nouvelle dépense" : "Nouveau revenu";
  const exportHref = (format: "csv" | "xlsx") =>
    `/api/exports${buildQuery({ ...values, dataset: exportDataset, format, period: values.from || values.to ? "custom" : "all" })}`;

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={
          isContributions
            ? "Cotisations versées par les membres. Elles sont comptées dans les revenus de la ferme."
            : type === "REVENUE"
              ? "Toutes les recettes de la ferme, hors cotisations (voir la rubrique Cotisations)."
              : type
                ? "Toutes les dépenses de la ferme."
                : "Historique unifié des dépenses, revenus et cotisations."
        }
        actions={
          <>
            <Button variant="outline" asChild>
              <a href={exportHref("xlsx")} download>
                <Download /> Excel
              </a>
            </Button>
            <Button variant="outline" asChild className="hidden sm:inline-flex">
              <a href={exportHref("csv")} download>
                <Download /> CSV
              </a>
            </Button>
            {type ? (
              <Button asChild>
                <Link href={`${basePath}/new`}>
                  <Plus /> {newLabel}
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="secondary">
                  <Link href="/contributions/new">
                    <Plus /> Cotisation
                  </Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/revenues/new">
                    <Plus /> Revenu
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/expenses/new">
                    <Plus /> Dépense
                  </Link>
                </Button>
              </>
            )}
          </>
        }
      />

      <UrlFilters basePath={basePath} fields={fields} values={values} preserved={preserved} />

      <TotalsBar totals={result.totals} type={type} revenueLabel={isContributions ? "Total cotisations" : undefined} />

      <Card className="overflow-hidden">
        {result.items.length > 0 ? (
          <OperationsTable
            items={result.items}
            actor={user}
            type={type}
            dateFormat={settings.dateFormat}
            memberLabel={isContributions ? "Cotisant" : undefined}
            sort={filters.sort}
            basePath={basePath}
            params={params}
          />
        ) : (
          <EmptyState
            icon={Inbox}
            title={
              result.totals.count > 0
                ? "Cette page ne contient aucun résultat"
                : hasFilters
                  ? "Aucune opération ne correspond aux filtres"
                  : type === "EXPENSE"
                    ? "Aucune dépense enregistrée"
                    : isContributions
                      ? "Aucune cotisation enregistrée"
                      : type === "REVENUE"
                      ? "Aucun revenu enregistré"
                      : "Aucune opération enregistrée"
            }
            description={
              result.totals.count > 0
                ? "Revenez à la première page."
                : hasFilters
                  ? "Modifiez ou réinitialisez les filtres."
                  : "Les opérations saisies apparaîtront ici."
            }
            action={
              result.totals.count > 0 ? (
                <Button variant="outline" asChild>
                  <Link href={`${basePath}${buildQuery({ ...params })}`}>Première page</Link>
                </Button>
              ) : !hasFilters && type ? (
                <Button asChild>
                  <Link href={`${basePath}/new`}>
                    <Plus />{" "}
                    {isContributions ? "Ajouter une cotisation" : type === "EXPENSE" ? "Ajouter une dépense" : "Ajouter un revenu"}
                  </Link>
                </Button>
              ) : undefined
            }
          />
        )}
        <Pagination
          basePath={basePath}
          params={params}
          page={result.page}
          totalPages={result.totalPages}
          total={result.totals.count}
          pageSize={result.pageSize}
          itemLabel="opération"
        />
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Création / modification
// ---------------------------------------------------------------------------

export async function OperationFormPage({
  type,
  operationId,
  contribution = false,
}: {
  type: OperationTypeValue;
  operationId?: string;
  /** Page de la rubrique Cotisations (nouvelle saisie pré-cochée « cotisation »). */
  contribution?: boolean;
}) {
  const user = await requireUser();
  if (operationId !== undefined && !ID_REGEX.test(operationId)) notFound();

  const [operation, categories, members, settings] = await Promise.all([
    operationId ? getOperation(operationId, type) : Promise.resolve(null),
    getCategoryOptions(type),
    getMemberOptions(),
    getSettings(),
  ]);
  if (operationId && (!operation || !canEditOperation(user, operation))) notFound();
  const isContributionPage = type === "REVENUE" && contribution;
  // Une opération s'ouvre toujours depuis sa propre rubrique (Revenus ou Cotisations).
  if (operation && operation.isContribution !== isContributionPage) {
    redirect(`${operationBasePath(operation)}/${operation.id}/edit`);
  }

  const canChooseMember = canChooseOperationMember(user);
  const memberOptions = canChooseMember
    ? members
        .filter((m) => m.status === "ACTIVE" || m.id === operation?.memberId)
        .map((m) => ({ id: m.id, name: m.status === "ACTIVE" ? m.name : `${m.name} (désactivé)` }))
    : [{ id: operation?.memberId ?? user.id, name: operation?.member.name ?? user.name }];

  // Les catégories inactives ne sont proposées que si l'opération les utilise déjà.
  const categoryOptions = categories
    .filter((c) => c.isActive || c.id === operation?.categoryId)
    .map((c) => ({ id: c.id, name: c.name, disabled: false }));
  // Catégorie par défaut des cotisations, seulement si elle est proposée (active, de revenu).
  const defaultContributionCategoryId =
    type === "REVENUE" && categoryOptions.some((c) => c.id === settings.defaultContributionCategoryId)
      ? settings.defaultContributionCategoryId
      : null;

  const defaults: OperationFormValues = operation
    ? {
        title: operation.title,
        description: operation.description ?? "",
        amount: amountToInput(operation.amount),
        date: operation.date,
        categoryId: operation.categoryId,
        memberId: operation.memberId,
        fundsSource: operation.fundsSource,
        isContribution: operation.isContribution,
        paymentMethod: operation.paymentMethod ?? "",
        counterparty: operation.counterparty ?? "",
        reference: operation.reference ?? "",
      }
    : {
        title: "",
        description: "",
        amount: "",
        date: todayInTimeZone(settings.timezone),
        categoryId: isContributionPage ? (defaultContributionCategoryId ?? "") : "",
        memberId: canChooseMember ? "" : user.id,
        fundsSource: "FARM",
        isContribution: isContributionPage,
        paymentMethod: "",
        counterparty: "",
        reference: "",
      };

  const basePath = operationBasePath({ type, isContribution: isContributionPage });
  const noun = isContributionPage ? "cotisation" : type === "EXPENSE" ? "dépense" : "revenu";
  const feminine = isContributionPage || type === "EXPENSE";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href={operation ? `${basePath}/${operation.id}` : basePath}>
          <ArrowLeft /> Retour
        </Link>
      </Button>
      <PageHeader
        title={operation ? `Modifier ${feminine ? "la" : "le"} ${noun}` : `${feminine ? "Nouvelle" : "Nouveau"} ${noun}`}
        description="Les champs marqués d'un astérisque sont obligatoires."
      />
      {categoryOptions.length === 0 ? (
        <Card>
          <EmptyState
            icon={Inbox}
            title="Aucune catégorie active"
            description="L'administrateur doit créer ou activer au moins une catégorie de ce type avant toute saisie."
          />
        </Card>
      ) : (
        <OperationForm
          type={type}
          operationId={operation?.id}
          defaultValues={defaults}
          categories={categoryOptions}
          members={memberOptions}
          canChooseMember={canChooseMember}
          lockedUntil={settings.lockedUntil}
          defaultContributionCategoryId={defaultContributionCategoryId}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Fiche détail
// ---------------------------------------------------------------------------

export async function OperationDetailPage({
  type,
  operationId,
  contribution = false,
}: {
  type: OperationTypeValue;
  operationId: string;
  contribution?: boolean;
}) {
  const user = await requireUser();
  if (!ID_REGEX.test(operationId)) notFound();
  const [operation, settings] = await Promise.all([getOperation(operationId, type), getSettings()]);
  if (!operation) notFound();
  const isContribution = operation.isContribution;
  // Une opération s'affiche toujours dans sa propre rubrique (Revenus ou Cotisations).
  if (isContribution !== (type === "REVENUE" && contribution)) redirect(`${operationBasePath(operation)}/${operation.id}`);
  const [history, names] = await Promise.all([
    getEntityHistory("Operation", operation.id),
    getReferenceNames(),
  ]);

  const basePath = operationBasePath(operation);
  const rows: { label: string; value: React.ReactNode }[] = [
    {
      label: type === "EXPENSE" ? "Date de la dépense" : isContribution ? "Date de la cotisation" : "Date d'encaissement",
      value: formatDate(operation.date, settings.dateFormat),
    },
    {
      label: "Catégorie",
      value: <CategoryLabel name={operation.category.name} color={operation.category.color} icon={operation.category.icon} />,
    },
    { label: isContribution ? "Cotisant" : MEMBER_ROLE_LABELS[type], value: operation.member.name },
    { label: "Origine des fonds", value: FUNDS_SOURCE_LABELS[type][operation.fundsSource] },
    ...(isContribution ? [] : [{ label: COUNTERPARTY_LABELS[type], value: operation.counterparty ?? "—" }]),
    {
      label: type === "EXPENSE" ? "Mode de paiement" : "Mode d'encaissement",
      value: operation.paymentMethod ? PAYMENT_METHOD_LABELS[operation.paymentMethod] : "—",
    },
    ...(isContribution ? [] : [{ label: "Référence", value: operation.reference ?? "—" }]),
    { label: "Devise", value: operation.currency },
    { label: "Enregistré par", value: `${operation.createdBy.name} — ${formatDateTime(operation.createdAt, settings.timezone)}` },
    {
      label: "Dernière modification",
      value: operation.updatedBy
        ? `${operation.updatedBy.name} — ${formatDateTime(operation.updatedAt, settings.timezone)}`
        : "—",
    },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href={basePath}>
          <ArrowLeft /> {isContribution ? "Cotisations" : OPERATION_TYPE_PLURAL[type]}
        </Link>
      </Button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap gap-2">
            <OperationTypeBadge type={type} />
            {isContribution && <ContributionBadge />}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight break-words">{operation.title}</h1>
          <SignedAmount type={type} amount={operation.amount} className="text-3xl font-semibold" />
        </div>
        <OperationRowActions
          id={operation.id}
          type={type}
          title={operation.title}
          isContribution={isContribution}
          canEdit={canEditOperation(user, operation)}
          redirectAfterDelete
          variant="buttons"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Détails</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="divide-y">
              {rows.map((row) => (
                <div key={row.label} className="grid gap-1 py-2.5 text-sm sm:grid-cols-[12rem_1fr]">
                  <dt className="text-muted-foreground">{row.label}</dt>
                  <dd className="min-w-0 break-words">{row.value}</dd>
                </div>
              ))}
            </dl>
            {operation.description && (
              <div className="mt-4 rounded-lg bg-muted/60 p-3 text-sm whitespace-pre-line">{operation.description}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Historique</CardTitle>
          </CardHeader>
          <CardContent>
            <AuditHistory entries={history} names={names} timezone={settings.timezone} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
