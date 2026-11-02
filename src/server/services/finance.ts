import "server-only";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { addDays, daysBetween, endOfMonth, previousRange, startOfMonth, type DateRange } from "@/lib/dates";
import type { OperationTypeValue } from "@/lib/constants";
import type { OperationCriteria } from "@/lib/validations/filters";
import {
  buildOperationSqlWhere,
  buildOperationWhere,
  getOperationTotals,
  getRecentOperations,
  type OperationListItem,
  type OperationTotals,
} from "@/server/queries/operations";

// Service central des calculs financiers. Toutes les sommes sont faites en SQL
// (SUM / GROUP BY) ; les montants restent des Decimal jusqu'à la sérialisation.
//
// Règles (validées) :
//  - Résultat de la période = revenus − dépenses (ce n'est PAS un solde de trésorerie).
//  - « Avances » = dépenses payées avec l'argent personnel d'un membre (fundsSource = MEMBER).
//  - « Fonds conservés » = revenus encaissés et gardés par un membre (fundsSource = MEMBER).
//  - Ces montants sont BRUTS : les remboursements et la régularisation entre associés
//    relèvent de l'étape 10, non activée. Aucune dette n'est calculée ici.

export type DashboardCriteria = Pick<OperationCriteria, "type" | "memberId" | "categoryId" | "from" | "to">;

export type SeriesPoint = {
  bucket: string; // "YYYY-MM" ou "YYYY-MM-DD"
  revenue: number;
  expense: number;
  result: number;
  cumulative: number;
};

export type CategoryBreakdown = { id: string; name: string; color: string | null; total: string; value: number };

export type MemberSummary = {
  id: string;
  name: string;
  status: string;
  expensesPaid: string;
  revenuesReceived: string;
  advances: string;
  heldFunds: string;
  operationsCount: number;
};

export type DashboardData = {
  totals: OperationTotals;
  previousTotals: OperationTotals | null;
  previousRange: DateRange | null;
  monthTotals: OperationTotals;
  granularity: "day" | "month";
  series: SeriesPoint[];
  expensesByCategory: CategoryBreakdown[];
  revenuesByCategory: CategoryBreakdown[];
  members: MemberSummary[];
  recentExpenses: OperationListItem[];
  recentRevenues: OperationListItem[];
  recentOperations: OperationListItem[];
  topExpenses: OperationListItem[];
};

const ZERO = new Prisma.Decimal(0);

function wantsType(criteria: DashboardCriteria, type: OperationTypeValue): boolean {
  return !criteria.type || criteria.type === type;
}

async function getSeries(criteria: DashboardCriteria, granularity: "day" | "month") {
  const trunc = Prisma.raw(granularity === "day" ? "'day'" : "'month'");
  const fmt = Prisma.raw(granularity === "day" ? "'YYYY-MM-DD'" : "'YYYY-MM'");
  return db.$queryRaw<{ bucket: string; type: OperationTypeValue; total: string }[]>`
    SELECT to_char(date_trunc(${trunc}, "date"::timestamp), ${fmt}) AS bucket,
           "type"::text AS type,
           SUM("amount")::text AS total
    FROM "Operation"
    ${buildOperationSqlWhere(criteria)}
    GROUP BY 1, 2
    ORDER BY 1`;
}

function nextBucket(bucket: string, granularity: "day" | "month"): string {
  if (granularity === "day") return addDays(bucket, 1);
  return addDays(endOfMonth(`${bucket}-01`), 1).slice(0, 7);
}

/** Complète les périodes sans opération pour obtenir une série continue. */
function buildSeries(
  rows: { bucket: string; type: OperationTypeValue; total: string }[],
  range: DateRange,
  granularity: "day" | "month",
): SeriesPoint[] {
  const key = (iso: string) => (granularity === "day" ? iso : iso.slice(0, 7));
  const buckets = rows.map((r) => r.bucket);
  const start = range.from ? key(range.from) : buckets[0];
  const end = range.to ? key(range.to) : buckets[buckets.length - 1];
  if (!start || !end) return [];

  const map = new Map<string, { revenue: Prisma.Decimal; expense: Prisma.Decimal }>();
  for (const r of rows) {
    const entry = map.get(r.bucket) ?? { revenue: ZERO, expense: ZERO };
    if (r.type === "REVENUE") entry.revenue = entry.revenue.plus(r.total);
    else entry.expense = entry.expense.plus(r.total);
    map.set(r.bucket, entry);
  }

  const points: SeriesPoint[] = [];
  let cumulative = ZERO;
  let current = start;
  for (let guard = 0; current <= end && guard < 400; guard++) {
    const entry = map.get(current) ?? { revenue: ZERO, expense: ZERO };
    const result = entry.revenue.minus(entry.expense);
    cumulative = cumulative.plus(result);
    points.push({
      bucket: current,
      revenue: entry.revenue.toNumber(),
      expense: entry.expense.toNumber(),
      result: result.toNumber(),
      cumulative: cumulative.toNumber(),
    });
    current = nextBucket(current, granularity);
  }
  return points;
}

async function getCategoryBreakdown(criteria: DashboardCriteria, type: OperationTypeValue) {
  if (!wantsType(criteria, type)) return [];
  const where = buildOperationWhere({ ...criteria, type });
  const groups = await db.operation.groupBy({
    by: ["categoryId"],
    where,
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
  });
  if (groups.length === 0) return [];
  const categories = await db.category.findMany({
    where: { id: { in: groups.map((g) => g.categoryId) } },
    select: { id: true, name: true, color: true },
  });
  const byId = new Map(categories.map((c) => [c.id, c]));
  return groups.map((g): CategoryBreakdown => {
    const total = g._sum.amount ?? ZERO;
    const cat = byId.get(g.categoryId);
    return {
      id: g.categoryId,
      name: cat?.name ?? "Catégorie inconnue",
      color: cat?.color ?? null,
      total: total.toFixed(2),
      value: total.toNumber(),
    };
  });
}

async function getMemberSummaries(criteria: DashboardCriteria): Promise<MemberSummary[]> {
  const where = buildOperationWhere(criteria);
  const [groups, users] = await Promise.all([
    db.operation.groupBy({
      by: ["memberId", "type", "fundsSource"],
      where,
      _sum: { amount: true },
      _count: { _all: true },
    }),
    db.user.findMany({
      where: criteria.memberId ? { id: criteria.memberId } : { status: { not: "PENDING" } },
      select: { id: true, name: true, status: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const summaries = new Map<
    string,
    { expenses: Prisma.Decimal; revenues: Prisma.Decimal; advances: Prisma.Decimal; held: Prisma.Decimal; count: number }
  >();
  for (const g of groups) {
    const s = summaries.get(g.memberId) ?? { expenses: ZERO, revenues: ZERO, advances: ZERO, held: ZERO, count: 0 };
    const amount = g._sum.amount ?? ZERO;
    if (g.type === "EXPENSE") {
      s.expenses = s.expenses.plus(amount);
      if (g.fundsSource === "MEMBER") s.advances = s.advances.plus(amount);
    } else {
      s.revenues = s.revenues.plus(amount);
      if (g.fundsSource === "MEMBER") s.held = s.held.plus(amount);
    }
    s.count += g._count._all;
    summaries.set(g.memberId, s);
  }

  return users
    .filter((u) => u.status === "ACTIVE" || summaries.has(u.id))
    .map((u) => {
      const s = summaries.get(u.id);
      return {
        id: u.id,
        name: u.name,
        status: u.status,
        expensesPaid: (s?.expenses ?? ZERO).toFixed(2),
        revenuesReceived: (s?.revenues ?? ZERO).toFixed(2),
        advances: (s?.advances ?? ZERO).toFixed(2),
        heldFunds: (s?.held ?? ZERO).toFixed(2),
        operationsCount: s?.count ?? 0,
      };
    });
}

export async function getDashboardData(criteria: DashboardCriteria, today: string): Promise<DashboardData> {
  const where = buildOperationWhere(criteria);
  const prev = previousRange({ from: criteria.from, to: criteria.to });
  const monthCriteria: DashboardCriteria = { ...criteria, from: startOfMonth(today), to: endOfMonth(today) };
  const span = criteria.from && criteria.to ? daysBetween(criteria.from, criteria.to) : Infinity;
  const granularity = span <= 45 ? "day" : "month";

  const expenseWhere = buildOperationWhere({ ...criteria, type: "EXPENSE" });
  const revenueWhere = buildOperationWhere({ ...criteria, type: "REVENUE" });
  const byDate: Prisma.OperationOrderByWithRelationInput[] = [{ date: "desc" }, { createdAt: "desc" }];

  const [
    totals,
    previousTotals,
    monthTotals,
    seriesRows,
    expensesByCategory,
    revenuesByCategory,
    members,
    recentExpenses,
    recentRevenues,
    recentOperations,
    topExpenses,
  ] = await Promise.all([
    getOperationTotals(where),
    prev ? getOperationTotals(buildOperationWhere({ ...criteria, ...prev })) : Promise.resolve(null),
    getOperationTotals(buildOperationWhere(monthCriteria)),
    getSeries(criteria, granularity),
    getCategoryBreakdown(criteria, "EXPENSE"),
    getCategoryBreakdown(criteria, "REVENUE"),
    getMemberSummaries(criteria),
    wantsType(criteria, "EXPENSE") ? getRecentOperations(expenseWhere, byDate, 5) : Promise.resolve([]),
    wantsType(criteria, "REVENUE") ? getRecentOperations(revenueWhere, byDate, 5) : Promise.resolve([]),
    getRecentOperations(where, [{ createdAt: "desc" }], 8),
    wantsType(criteria, "EXPENSE")
      ? getRecentOperations(expenseWhere, [{ amount: "desc" }, { date: "desc" }], 5)
      : Promise.resolve([]),
  ]);

  return {
    totals,
    previousTotals,
    previousRange: prev,
    monthTotals,
    granularity,
    series: buildSeries(seriesRows, { from: criteria.from, to: criteria.to }, granularity),
    expensesByCategory,
    revenuesByCategory,
    members,
    recentExpenses,
    recentRevenues,
    recentOperations,
    topExpenses,
  };
}

/** Bilan financier pour l'export : totaux, ventilation par catégorie et par membre. */
export async function getFinancialSummary(criteria: DashboardCriteria) {
  const [totals, expensesByCategory, revenuesByCategory, members] = await Promise.all([
    getOperationTotals(buildOperationWhere(criteria)),
    getCategoryBreakdown(criteria, "EXPENSE"),
    getCategoryBreakdown(criteria, "REVENUE"),
    getMemberSummaries(criteria),
  ]);
  return { totals, expensesByCategory, revenuesByCategory, members };
}
