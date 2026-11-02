import type { Metadata } from "next";
import Link from "next/link";
import { Info, Plus, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { UrlFilters, type FilterField } from "@/components/shared/url-filters";
import {
  CategoryBarChart,
  MemberChart,
  ResultChart,
  RevenueExpenseChart,
  TypeSplitChart,
  type ChartPoint,
} from "@/components/dashboard/charts";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { MemberSummaryTable } from "@/components/dashboard/member-summary";
import { RecentList } from "@/components/dashboard/recent-list";
import { requireUser } from "@/lib/auth/session";
import { OPERATION_TYPES, OPERATION_TYPE_LABELS, PERIOD_LABELS, PERIOD_PRESETS } from "@/lib/constants";
import { formatDate, formatMonthLabel, formatRangeLabel, resolvePeriod, todayInTimeZone } from "@/lib/dates";
import { first, parseOperationCriteria, parsePeriodPreset, type SearchParams } from "@/lib/validations/filters";
import { getCategoryOptions, getMemberOptions } from "@/server/queries/operations";
import { getDashboardData, type DashboardCriteria } from "@/server/services/finance";
import { getSettings } from "@/server/settings";

export const metadata: Metadata = { title: "Tableau de bord" };

export default async function DashboardPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const [user, sp, settings] = await Promise.all([requireUser(), searchParams, getSettings()]);
  const today = todayInTimeZone(settings.timezone);
  const preset = parsePeriodPreset(sp, "year");
  const parsed = parseOperationCriteria(sp);
  const range = resolvePeriod(preset, today, { from: parsed.from, to: parsed.to });
  const criteria: DashboardCriteria = {
    type: parsed.type,
    memberId: parsed.memberId,
    categoryId: parsed.categoryId,
    from: range.from,
    to: range.to,
  };

  const [data, members, categories] = await Promise.all([
    getDashboardData(criteria, today),
    getMemberOptions(),
    getCategoryOptions(),
  ]);

  const values = {
    period: first(sp, "period"),
    from: first(sp, "from"),
    to: first(sp, "to"),
    member: first(sp, "member"),
    category: first(sp, "category"),
    type: first(sp, "type"),
  };
  const fields: FilterField[] = [
    {
      kind: "select",
      name: "period",
      label: "Période",
      allLabel: `${PERIOD_LABELS.year} (par défaut)`,
      options: PERIOD_PRESETS.filter((p) => p !== "year").map((p) => ({ value: p, label: PERIOD_LABELS[p] })),
      className: "sm:w-52",
    },
    ...(preset === "custom"
      ? [
          { kind: "date" as const, name: "from", label: "Du" },
          { kind: "date" as const, name: "to", label: "Au" },
        ]
      : []),
    {
      kind: "select",
      name: "member",
      label: "Membre",
      allLabel: "Tous les membres",
      options: members.map((m) => ({ value: m.id, label: m.name })),
    },
    {
      kind: "select",
      name: "category",
      label: "Catégorie",
      allLabel: "Toutes",
      options: categories.map((c) => ({ value: c.id, label: `${OPERATION_TYPE_LABELS[c.type]} · ${c.name}` })),
      className: "sm:w-56",
    },
    {
      kind: "select",
      name: "type",
      label: "Type",
      allLabel: "Tous",
      options: OPERATION_TYPES.map((t) => ({ value: t, label: OPERATION_TYPE_LABELS[t] })),
    },
  ];

  const periodLabel = preset === "all" ? "Toute la période" : formatRangeLabel(range, settings.dateFormat);
  const monthLabel = formatMonthLabel(today.slice(0, 7));
  const chartData: ChartPoint[] = data.series.map((p) => ({
    ...p,
    label: data.granularity === "day" ? formatDate(p.bucket, "d MMM") : formatMonthLabel(p.bucket),
  }));
  const isEmpty = data.totals.count === 0;
  const hasFilters = Boolean(values.member || values.category || values.type);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Bonjour, ${user.name.split(" ")[0] ?? user.name}`}
        description={`Situation financière de ${settings.farmName} — ${periodLabel}.`}
        actions={
          <>
            <Button variant="secondary" asChild>
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
        }
      />

      <UrlFilters basePath="/dashboard" fields={fields} values={values} />

      <KpiCards
        totals={data.totals}
        previous={data.previousTotals}
        month={data.monthTotals}
        periodLabel={periodLabel}
        monthLabel={`Mois en cours (${monthLabel})`}
      />

      {data.previousRange && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Info className="size-3.5" aria-hidden />
          Variations calculées par rapport à la période précédente de même durée (
          {formatRangeLabel(data.previousRange, settings.dateFormat)}).
        </p>
      )}

      {isEmpty ? (
        <Card>
          <EmptyState
            icon={Sprout}
            title={hasFilters || preset !== "all" ? "Aucune opération sur cette sélection" : "Aucune opération enregistrée"}
            description={
              hasFilters || preset !== "all"
                ? "Élargissez la période ou retirez des filtres pour voir les statistiques."
                : "Les graphiques et indicateurs s'afficheront dès la première dépense ou le premier revenu."
            }
            action={
              <Button asChild>
                <Link href="/expenses/new">
                  <Plus /> Enregistrer une dépense
                </Link>
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          <div className="grid gap-6 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle>Revenus et dépenses</CardTitle>
                <CardDescription>
                  Évolution {data.granularity === "day" ? "quotidienne" : "mensuelle"} — {periodLabel}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RevenueExpenseChart data={chartData} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Répartition par type</CardTitle>
                <CardDescription>Nombre d&apos;opérations</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center">
                <TypeSplitChart revenueCount={data.totals.revenueCount} expenseCount={data.totals.expenseCount} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Évolution du résultat</CardTitle>
              <CardDescription>Résultat cumulé sur la période (revenus − dépenses, hors trésorerie)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResultChart data={chartData} />
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Dépenses par catégorie</CardTitle>
              </CardHeader>
              <CardContent>
                {data.expensesByCategory.length > 0 ? (
                  <CategoryBarChart data={data.expensesByCategory} color="expense" />
                ) : (
                  <p className="py-6 text-center text-sm text-muted-foreground">Aucune dépense sur cette sélection.</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Revenus par catégorie</CardTitle>
              </CardHeader>
              <CardContent>
                {data.revenuesByCategory.length > 0 ? (
                  <CategoryBarChart data={data.revenuesByCategory} color="revenue" />
                ) : (
                  <p className="py-6 text-center text-sm text-muted-foreground">Aucun revenu sur cette sélection.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Résumé par membre</CardTitle>
          <CardDescription>
            Montants bruts enregistrés sur la période. Les remboursements et la répartition entre associés ne sont pas
            encore calculés (module de régularisation non activé) : ces chiffres ne constituent pas des dettes.
          </CardDescription>
        </CardHeader>
        {!isEmpty && data.members.length > 0 && (
          <CardContent className="pb-0">
            <MemberChart
              data={data.members.map((m) => ({
                name: m.name,
                expense: Number(m.expensesPaid),
                revenue: Number(m.revenuesReceived),
              }))}
            />
          </CardContent>
        )}
        <CardContent className="px-0">
          <MemberSummaryTable members={data.members} />
        </CardContent>
      </Card>

      {!isEmpty && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Dernières dépenses</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <RecentList items={data.recentExpenses} dateFormat={settings.dateFormat} emptyLabel="Aucune dépense." />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Derniers revenus</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <RecentList items={data.recentRevenues} dateFormat={settings.dateFormat} emptyLabel="Aucun revenu." />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Dépenses les plus importantes</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <RecentList items={data.topExpenses} dateFormat={settings.dateFormat} emptyLabel="Aucune dépense." />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Saisies récentes</CardTitle>
              <CardDescription>Dernières opérations enregistrées</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <RecentList items={data.recentOperations} dateFormat={settings.dateFormat} emptyLabel="Aucune opération." />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
