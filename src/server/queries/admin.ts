import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type { OperationTypeValue, RoleValue, UserStatusValue } from "@/lib/constants";

export type Paginated<T> = { items: T[]; total: number; page: number; pageSize: number; totalPages: number };

function paginate<T>(items: T[], total: number, page: number, pageSize: number): Paginated<T> {
  return { items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

// ---------------------------------------------------------------------------
// Membres
// ---------------------------------------------------------------------------

export type MemberFilters = {
  q?: string;
  role?: RoleValue;
  status?: UserStatusValue;
  page: number;
  pageSize: number;
};

export type MemberRow = {
  id: string;
  name: string;
  email: string;
  role: RoleValue;
  status: UserStatusValue;
  createdAt: string;
  lastLoginAt: string | null;
  operationsCount: number;
  neverActivated: boolean;
  deletable: boolean;
};

export async function listMembers(f: MemberFilters): Promise<Paginated<MemberRow>> {
  const where: Prisma.UserWhereInput = {
    ...(f.role ? { role: f.role } : {}),
    ...(f.status ? { status: f.status } : {}),
    ...(f.q
      ? {
          OR: [
            { name: { contains: f.q, mode: "insensitive" } },
            { email: { contains: f.q, mode: "insensitive" } },
          ],
        }
      : {}),
  };
  const [rows, total] = await Promise.all([
    db.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        lastLoginAt: true,
        passwordHash: true, // utilisé uniquement pour calculer neverActivated, jamais renvoyé
        _count: {
          select: {
            operations: { where: { deletedAt: null } },
            createdOperations: true,
            auditLogs: true,
          },
        },
      },
      orderBy: [{ createdAt: "asc" }],
      skip: (f.page - 1) * f.pageSize,
      take: f.pageSize,
    }),
    db.user.count({ where }),
  ]);
  return paginate(
    rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      role: r.role,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      lastLoginAt: r.lastLoginAt?.toISOString() ?? null,
      operationsCount: r._count.operations,
      neverActivated: r.passwordHash === null,
      deletable:
        r.passwordHash === null &&
        r.lastLoginAt === null &&
        r._count.operations + r._count.createdOperations + r._count.auditLogs === 0,
    })),
    total,
    f.page,
    f.pageSize,
  );
}

// ---------------------------------------------------------------------------
// Catégories
// ---------------------------------------------------------------------------

export type CategoryFilters = {
  q?: string;
  type?: OperationTypeValue;
  active?: boolean;
  page: number;
  pageSize: number;
};

export type CategoryRow = {
  id: string;
  type: OperationTypeValue;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  isActive: boolean;
  createdAt: string;
  operationsCount: number;
  totalOperationsCount: number; // y compris supprimées : conditionne la suppression physique
};

export async function listCategories(f: CategoryFilters): Promise<Paginated<CategoryRow>> {
  const where: Prisma.CategoryWhereInput = {
    ...(f.type ? { type: f.type } : {}),
    ...(f.active !== undefined ? { isActive: f.active } : {}),
    ...(f.q ? { name: { contains: f.q, mode: "insensitive" } } : {}),
  };
  const [rows, total] = await Promise.all([
    db.category.findMany({
      where,
      select: {
        id: true,
        type: true,
        name: true,
        description: true,
        color: true,
        icon: true,
        isActive: true,
        createdAt: true,
        _count: { select: { operations: true } },
      },
      orderBy: [{ type: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
      skip: (f.page - 1) * f.pageSize,
      take: f.pageSize,
    }),
    db.category.count({ where }),
  ]);

  // Nombre d'opérations actives par catégorie, en une seule requête GROUP BY.
  const active = rows.length
    ? await db.operation.groupBy({
        by: ["categoryId"],
        where: { categoryId: { in: rows.map((r) => r.id) }, deletedAt: null },
        _count: { _all: true },
      })
    : [];
  const activeById = new Map(active.map((a) => [a.categoryId, a._count._all]));

  return paginate(
    rows.map((r) => ({
      id: r.id,
      type: r.type,
      name: r.name,
      description: r.description,
      color: r.color,
      icon: r.icon,
      isActive: r.isActive,
      createdAt: r.createdAt.toISOString(),
      operationsCount: activeById.get(r.id) ?? 0,
      totalOperationsCount: r._count.operations,
    })),
    total,
    f.page,
    f.pageSize,
  );
}

// ---------------------------------------------------------------------------
// Journal d'audit
// ---------------------------------------------------------------------------

export type AuditFilters = { entityType?: string; actorId?: string; page: number; pageSize: number };

export type AuditRow = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: unknown;
  ip: string | null;
  createdAt: string;
  actor: { id: string; name: string } | null;
};

export async function listAuditLogs(f: AuditFilters): Promise<Paginated<AuditRow>> {
  const where: Prisma.AuditLogWhereInput = {
    ...(f.entityType ? { entityType: f.entityType } : {}),
    ...(f.actorId ? { actorId: f.actorId } : {}),
  };
  const [rows, total] = await Promise.all([
    db.auditLog.findMany({
      where,
      select: {
        id: true,
        action: true,
        entityType: true,
        entityId: true,
        metadata: true,
        ip: true,
        createdAt: true,
        actor: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (f.page - 1) * f.pageSize,
      take: f.pageSize,
    }),
    db.auditLog.count({ where }),
  ]);
  return paginate(
    rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
    total,
    f.page,
    f.pageSize,
  );
}

/** Historique d'une entité (fiche opération, par exemple). */
export async function getEntityHistory(entityType: string, entityId: string): Promise<AuditRow[]> {
  const rows = await db.auditLog.findMany({
    where: { entityType, entityId },
    select: {
      id: true,
      action: true,
      entityType: true,
      entityId: true,
      metadata: true,
      ip: true,
      createdAt: true,
      actor: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }));
}

/** Noms des catégories et membres pour afficher lisiblement les changements d'audit. */
export async function getReferenceNames(): Promise<Record<string, string>> {
  const [users, categories] = await Promise.all([
    db.user.findMany({ select: { id: true, name: true } }),
    db.category.findMany({ select: { id: true, name: true } }),
  ]);
  return Object.fromEntries([...users, ...categories].map((x) => [x.id, x.name]));
}
