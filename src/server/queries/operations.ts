import "server-only";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { dbDateToIso, isoToDbDate } from "@/lib/dates";
import type { FundsSourceValue, OperationTypeValue, PaymentMethodValue } from "@/lib/constants";
import type { OperationCriteria, OperationListFilters, OperationSort } from "@/lib/validations/filters";

// ---------------------------------------------------------------------------
// Construction des filtres (Prisma et SQL brut) — source unique pour listes,
// totaux, exports et dashboard.
// ---------------------------------------------------------------------------

export function buildOperationWhere(c: OperationCriteria): Prisma.OperationWhereInput {
  const where: Prisma.OperationWhereInput = { deletedAt: null };
  if (c.type) where.type = c.type;
  if (c.memberId) where.memberId = c.memberId;
  if (c.categoryId) where.categoryId = c.categoryId;
  if (c.from || c.to) {
    where.date = {
      ...(c.from ? { gte: isoToDbDate(c.from) } : {}),
      ...(c.to ? { lte: isoToDbDate(c.to) } : {}),
    };
  }
  if (c.min || c.max) {
    where.amount = {
      ...(c.min ? { gte: new Prisma.Decimal(c.min) } : {}),
      ...(c.max ? { lte: new Prisma.Decimal(c.max) } : {}),
    };
  }
  if (c.q) {
    const contains = { contains: c.q, mode: "insensitive" as const };
    where.OR = [{ title: contains }, { description: contains }, { counterparty: contains }, { reference: contains }];
  }
  return where;
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (m) => `\\${m}`);
}

/** Équivalent SQL de buildOperationWhere, pour les agrégations en $queryRaw. */
export function buildOperationSqlWhere(c: OperationCriteria): Prisma.Sql {
  const conditions: Prisma.Sql[] = [Prisma.sql`"deletedAt" IS NULL`];
  if (c.type) conditions.push(Prisma.sql`"type" = ${c.type}::"OperationType"`);
  if (c.memberId) conditions.push(Prisma.sql`"memberId" = ${c.memberId}`);
  if (c.categoryId) conditions.push(Prisma.sql`"categoryId" = ${c.categoryId}`);
  if (c.from) conditions.push(Prisma.sql`"date" >= ${c.from}::date`);
  if (c.to) conditions.push(Prisma.sql`"date" <= ${c.to}::date`);
  if (c.min) conditions.push(Prisma.sql`"amount" >= ${c.min}::numeric`);
  if (c.max) conditions.push(Prisma.sql`"amount" <= ${c.max}::numeric`);
  if (c.q) {
    const like = `%${escapeLike(c.q)}%`;
    conditions.push(
      Prisma.sql`("title" ILIKE ${like} OR "description" ILIKE ${like} OR "counterparty" ILIKE ${like} OR "reference" ILIKE ${like})`,
    );
  }
  return Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}`;
}

const ORDER_BY: Record<OperationSort, Prisma.OperationOrderByWithRelationInput[]> = {
  date_desc: [{ date: "desc" }, { id: "desc" }],
  date_asc: [{ date: "asc" }, { id: "asc" }],
  amount_desc: [{ amount: "desc" }, { id: "desc" }],
  amount_asc: [{ amount: "asc" }, { id: "asc" }],
};

// ---------------------------------------------------------------------------
// Totaux
// ---------------------------------------------------------------------------

export type OperationTotals = {
  revenue: string;
  expense: string;
  result: string;
  revenueCount: number;
  expenseCount: number;
  count: number;
};

/** Totaux par type calculés en SQL (une seule requête GROUP BY). */
export async function getOperationTotals(where: Prisma.OperationWhereInput): Promise<OperationTotals> {
  const groups = await db.operation.groupBy({
    by: ["type"],
    where,
    _sum: { amount: true },
    _count: { _all: true },
  });
  const zero = new Prisma.Decimal(0);
  const revenue = groups.find((g) => g.type === "REVENUE");
  const expense = groups.find((g) => g.type === "EXPENSE");
  const revenueSum = revenue?._sum.amount ?? zero;
  const expenseSum = expense?._sum.amount ?? zero;
  const revenueCount = revenue?._count._all ?? 0;
  const expenseCount = expense?._count._all ?? 0;
  return {
    revenue: revenueSum.toFixed(2),
    expense: expenseSum.toFixed(2),
    result: revenueSum.minus(expenseSum).toFixed(2),
    revenueCount,
    expenseCount,
    count: revenueCount + expenseCount,
  };
}

// ---------------------------------------------------------------------------
// Liste paginée
// ---------------------------------------------------------------------------

const listSelect = {
  id: true,
  type: true,
  title: true,
  amount: true,
  currency: true,
  date: true,
  fundsSource: true,
  counterparty: true,
  createdById: true,
  category: { select: { id: true, name: true, color: true, icon: true } },
  member: { select: { id: true, name: true } },
  createdBy: { select: { id: true, name: true } },
} satisfies Prisma.OperationSelect;

type ListRow = Prisma.OperationGetPayload<{ select: typeof listSelect }>;

export type OperationListItem = {
  id: string;
  type: OperationTypeValue;
  title: string;
  amount: string;
  currency: string;
  date: string;
  fundsSource: FundsSourceValue;
  counterparty: string | null;
  createdById: string;
  category: { id: string; name: string; color: string | null; icon: string | null };
  member: { id: string; name: string };
  createdBy: { id: string; name: string };
};

function serializeListRow(row: ListRow): OperationListItem {
  return { ...row, amount: row.amount.toFixed(2), date: dbDateToIso(row.date) };
}

export type OperationListResult = {
  items: OperationListItem[];
  totals: OperationTotals;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function listOperations(filters: OperationListFilters): Promise<OperationListResult> {
  const where = buildOperationWhere(filters);
  // Le nombre total de lignes est dérivé du GROUP BY des totaux : pas de COUNT séparé.
  const [rows, totals] = await Promise.all([
    db.operation.findMany({
      where,
      select: listSelect,
      orderBy: ORDER_BY[filters.sort],
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
    }),
    getOperationTotals(where),
  ]);
  return {
    items: rows.map(serializeListRow),
    totals,
    page: filters.page,
    pageSize: filters.pageSize,
    totalPages: Math.max(1, Math.ceil(totals.count / filters.pageSize)),
  };
}

export async function getRecentOperations(
  where: Prisma.OperationWhereInput,
  orderBy: Prisma.OperationOrderByWithRelationInput[],
  take: number,
): Promise<OperationListItem[]> {
  const rows = await db.operation.findMany({ where, select: listSelect, orderBy, take });
  return rows.map(serializeListRow);
}

// ---------------------------------------------------------------------------
// Détail
// ---------------------------------------------------------------------------

const detailSelect = {
  ...listSelect,
  description: true,
  paymentMethod: true,
  reference: true,
  memberId: true,
  categoryId: true,
  createdAt: true,
  updatedAt: true,
  updatedBy: { select: { id: true, name: true } },
} satisfies Prisma.OperationSelect;

export type OperationDetail = OperationListItem & {
  description: string | null;
  paymentMethod: PaymentMethodValue | null;
  reference: string | null;
  memberId: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: { id: string; name: string } | null;
};

export async function getOperation(id: string, type?: OperationTypeValue): Promise<OperationDetail | null> {
  const row = await db.operation.findFirst({
    where: { id, deletedAt: null, ...(type ? { type } : {}) },
    select: detailSelect,
  });
  if (!row) return null;
  return {
    ...row,
    amount: row.amount.toFixed(2),
    date: dbDateToIso(row.date),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Export : parcours par lots (pagination par curseur), sans tout charger en mémoire.
// ---------------------------------------------------------------------------

const exportSelect = {
  id: true,
  type: true,
  title: true,
  description: true,
  amount: true,
  currency: true,
  date: true,
  fundsSource: true,
  paymentMethod: true,
  counterparty: true,
  reference: true,
  category: { select: { name: true } },
  member: { select: { name: true } },
  createdBy: { select: { name: true } },
} satisfies Prisma.OperationSelect;

export type ExportRow = Prisma.OperationGetPayload<{ select: typeof exportSelect }>;

export async function* iterateOperationsForExport(
  criteria: OperationCriteria,
  batchSize = 1000,
): AsyncGenerator<ExportRow[]> {
  const where = buildOperationWhere(criteria);
  let cursor: string | undefined;
  for (;;) {
    const batch = await db.operation.findMany({
      where,
      select: exportSelect,
      orderBy: [{ date: "desc" }, { id: "desc" }],
      take: batchSize,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
    if (batch.length === 0) return;
    yield batch;
    if (batch.length < batchSize) return;
    cursor = batch[batch.length - 1]?.id;
  }
}

// ---------------------------------------------------------------------------
// Options des formulaires et filtres
// ---------------------------------------------------------------------------

export type MemberOption = { id: string; name: string; status: "PENDING" | "ACTIVE" | "DISABLED" };
export type CategoryOption = { id: string; name: string; type: OperationTypeValue; isActive: boolean };

export async function getMemberOptions(): Promise<MemberOption[]> {
  return db.user.findMany({
    where: { status: { not: "PENDING" } },
    select: { id: true, name: true, status: true },
    orderBy: { name: "asc" },
  });
}

export async function getCategoryOptions(type?: OperationTypeValue): Promise<CategoryOption[]> {
  return db.category.findMany({
    where: type ? { type } : {},
    select: { id: true, name: true, type: true, isActive: true },
    orderBy: [{ type: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
  });
}
