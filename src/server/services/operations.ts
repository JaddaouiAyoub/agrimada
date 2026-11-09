import "server-only";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { BusinessError, ForbiddenError } from "@/lib/action-result";
import type { CurrentUser } from "@/lib/auth/session";
import { DEFAULT_CURRENCY, type OperationTypeValue } from "@/lib/constants";
import { dbDateToIso, formatDate, formatMonthLabel, isoToDbDate } from "@/lib/dates";
import { normalizeAmount } from "@/lib/money";
import { canChooseOperationMember, canEditOperation } from "@/lib/permissions";
import { emptyToNull } from "@/lib/validations/common";
import type { OperationFormValues } from "@/lib/validations/operation";
import { diffFields, writeAudit } from "@/server/audit";
import { getSettings } from "@/server/settings";

async function assertNotLocked(dateIso: string): Promise<void> {
  const { lockedUntil } = await getSettings();
  if (lockedUntil && dateIso <= lockedUntil) {
    throw new BusinessError(
      `La période est clôturée jusqu'au ${formatDate(lockedUntil)} : aucune opération à cette date ne peut être créée, modifiée ou supprimée.`,
    );
  }
}

/**
 * Détermine le membre concerné. Un MEMBER ne peut saisir que pour lui-même ;
 * l'ADMIN choisit parmi les membres actifs. Lors d'une modification, le membre
 * d'origine est conservé même s'il a été désactivé depuis.
 */
async function resolveMemberId(actor: CurrentUser, requestedId: string, currentId?: string): Promise<string> {
  if (!canChooseOperationMember(actor)) {
    const expected = currentId ?? actor.id;
    if (requestedId !== expected) {
      throw new ForbiddenError("Vous ne pouvez enregistrer que vos propres opérations.");
    }
    return expected;
  }
  if (requestedId === currentId) return requestedId;
  const member = await db.user.findUnique({ where: { id: requestedId }, select: { status: true } });
  if (!member || member.status !== "ACTIVE") {
    throw new BusinessError("Le membre sélectionné n'existe pas ou n'est pas actif.");
  }
  return requestedId;
}

/** La catégorie doit exister, être du bon type et être active (sauf si inchangée). */
async function assertCategoryUsable(categoryId: string, type: OperationTypeValue, currentId?: string): Promise<void> {
  const category = await db.category.findUnique({ where: { id: categoryId }, select: { type: true, isActive: true } });
  if (!category || category.type !== type) throw new BusinessError("Catégorie invalide pour ce type d'opération.");
  if (!category.isActive && categoryId !== currentId) {
    throw new BusinessError("Cette catégorie est désactivée et ne peut plus être utilisée.");
  }
}

/** Titre par défaut d'une cotisation : « Cotisation nov. 2026 — Nom du membre ». */
async function contributionTitle(dateIso: string, memberId: string): Promise<string> {
  const member = await db.user.findUnique({ where: { id: memberId }, select: { name: true } });
  const title = `Cotisation ${formatMonthLabel(dateIso.slice(0, 7))}${member ? ` — ${member.name}` : ""}`;
  return title.slice(0, 160);
}

async function toData(input: OperationFormValues, type: OperationTypeValue, memberId: string) {
  // Seul un revenu peut être une cotisation (contrainte CHECK en base).
  const isContribution = type === "REVENUE" && input.isContribution;
  const title = input.title.trim();
  return {
    title: title || (isContribution ? await contributionTitle(input.date, memberId) : title),
    description: emptyToNull(input.description),
    amount: new Prisma.Decimal(normalizeAmount(input.amount)),
    date: isoToDbDate(input.date),
    categoryId: input.categoryId,
    fundsSource: input.fundsSource,
    isContribution,
    paymentMethod: input.paymentMethod === "" ? null : input.paymentMethod,
    // Champs non proposés pour une cotisation.
    counterparty: isContribution ? null : emptyToNull(input.counterparty),
    reference: isContribution ? null : emptyToNull(input.reference),
  };
}

function auditSnapshot(op: {
  title: string;
  amount: Prisma.Decimal;
  date: Date;
  categoryId: string;
  memberId: string;
  fundsSource: string;
  isContribution: boolean;
  paymentMethod: string | null;
  counterparty: string | null;
  reference: string | null;
  description: string | null;
}): Record<string, string | null> {
  return {
    title: op.title,
    amount: op.amount.toFixed(2),
    date: dbDateToIso(op.date),
    categoryId: op.categoryId,
    memberId: op.memberId,
    fundsSource: op.fundsSource,
    isContribution: op.isContribution ? "true" : "false",
    paymentMethod: op.paymentMethod,
    counterparty: op.counterparty,
    reference: op.reference,
    description: op.description,
  };
}

export async function createOperation(
  actor: CurrentUser,
  type: OperationTypeValue,
  input: OperationFormValues,
): Promise<{ id: string }> {
  await assertNotLocked(input.date);
  const memberId = await resolveMemberId(actor, input.memberId);
  await assertCategoryUsable(input.categoryId, type);
  const data = await toData(input, type, memberId);

  return db.$transaction(async (tx) => {
    const created = await tx.operation.create({
      data: { ...data, type, memberId, currency: DEFAULT_CURRENCY, createdById: actor.id },
      select: { id: true },
    });
    await writeAudit(tx, {
      actorId: actor.id,
      action: "operation.create",
      entityType: "Operation",
      entityId: created.id,
      metadata: { type, ...auditSnapshot({ ...data, memberId }) },
    });
    return created;
  });
}

async function loadEditable(actor: CurrentUser, id: string) {
  const existing = await db.operation.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new BusinessError("Opération introuvable ou déjà supprimée.");
  if (!canEditOperation(actor, existing)) {
    throw new ForbiddenError("Vous ne pouvez modifier que les opérations que vous avez créées.");
  }
  return existing;
}

export async function updateOperation(actor: CurrentUser, id: string, input: OperationFormValues): Promise<void> {
  const existing = await loadEditable(actor, id);
  await assertNotLocked(dbDateToIso(existing.date));
  await assertNotLocked(input.date);
  const memberId = await resolveMemberId(actor, input.memberId, existing.memberId);
  await assertCategoryUsable(input.categoryId, existing.type, existing.categoryId);
  const data = await toData(input, existing.type, memberId);

  const changes = diffFields(auditSnapshot(existing), auditSnapshot({ ...data, memberId }));
  if (Object.keys(changes).length === 0) return;

  await db.$transaction(async (tx) => {
    // Verrou optimiste : échoue si l'opération a été supprimée entre-temps.
    const updated = await tx.operation.updateMany({
      where: { id, deletedAt: null },
      data: { ...data, memberId, updatedById: actor.id },
    });
    if (updated.count !== 1) throw new BusinessError("Opération introuvable ou déjà supprimée.");
    await writeAudit(tx, {
      actorId: actor.id,
      action: "operation.update",
      entityType: "Operation",
      entityId: id,
      metadata: { changes },
    });
  });
}

/** Suppression logique : l'opération disparaît des listes et calculs mais reste tracée. */
export async function deleteOperation(
  actor: CurrentUser,
  id: string,
): Promise<{ type: OperationTypeValue; isContribution: boolean }> {
  const existing = await loadEditable(actor, id);
  await assertNotLocked(dbDateToIso(existing.date));

  await db.$transaction(async (tx) => {
    const deleted = await tx.operation.updateMany({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date(), deletedById: actor.id },
    });
    if (deleted.count !== 1) throw new BusinessError("Opération introuvable ou déjà supprimée.");
    await writeAudit(tx, {
      actorId: actor.id,
      action: "operation.delete",
      entityType: "Operation",
      entityId: id,
      metadata: { type: existing.type, ...auditSnapshot(existing) },
    });
  });
  return { type: existing.type, isContribution: existing.isContribution };
}
