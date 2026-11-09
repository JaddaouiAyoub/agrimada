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

type OperationData = Awaited<ReturnType<typeof toData>>;

// ---------------------------------------------------------------------------
// Cotisation générée par une dépense payée avec l'argent personnel du membre
// (case « Compter aussi comme cotisation »). Elle reprend montant, date et membre
// de la dépense, et n'est modifiable / supprimable qu'à travers la dépense.
// ---------------------------------------------------------------------------

/** La dépense doit-elle avoir une cotisation associée ? */
function wantsAdvanceContribution(type: OperationTypeValue, input: OperationFormValues): boolean {
  return type === "EXPENSE" && input.fundsSource === "MEMBER" && input.advanceAsContribution;
}

/** Catégorie dédiée (Paramètres), à défaut la catégorie par défaut des cotisations. */
async function resolveAdvanceContributionCategory(): Promise<string> {
  const settings = await getSettings();
  const candidates = [settings.advanceContributionCategoryId, settings.defaultContributionCategoryId].filter(
    (id): id is string => Boolean(id),
  );
  for (const id of candidates) {
    const category = await db.category.findUnique({ where: { id }, select: { type: true, isActive: true } });
    if (category?.type === "REVENUE" && category.isActive) return id;
  }
  throw new BusinessError(
    "Aucune catégorie de cotisation active n'est définie : l'administrateur doit la choisir dans Paramètres > Cotisations.",
  );
}

function advanceContributionFields(expense: Pick<OperationData, "title" | "amount" | "date">, memberId: string) {
  return {
    title: `Cotisation — achat : ${expense.title}`.slice(0, 160),
    amount: expense.amount,
    date: expense.date,
    memberId,
  };
}

async function createAdvanceContribution(
  tx: Prisma.TransactionClient,
  actor: CurrentUser,
  expenseId: string,
  expense: OperationData,
  memberId: string,
  categoryId: string,
): Promise<void> {
  const fields = advanceContributionFields(expense, memberId);
  const created = await tx.operation.create({
    data: {
      ...fields,
      type: "REVENUE",
      isContribution: true,
      sourceExpenseId: expenseId,
      categoryId,
      // L'apport est considéré comme versé à la ferme (il a servi à payer la dépense).
      fundsSource: "FARM",
      paymentMethod: expense.paymentMethod,
      description: "Générée automatiquement : achat payé avec l'argent personnel du membre.",
      currency: DEFAULT_CURRENCY,
      createdById: actor.id,
    },
    select: { id: true },
  });
  await writeAudit(tx, {
    actorId: actor.id,
    action: "operation.create",
    entityType: "Operation",
    entityId: created.id,
    metadata: {
      type: "REVENUE",
      sourceExpenseId: expenseId,
      title: fields.title,
      amount: fields.amount.toFixed(2),
      date: dbDateToIso(fields.date),
      categoryId,
      memberId,
      isContribution: "true",
    },
  });
}

function findAdvanceContribution(expenseId: string, client: Prisma.TransactionClient = db) {
  return client.operation.findFirst({
    where: { sourceExpenseId: expenseId, deletedAt: null },
    select: { id: true, title: true, amount: true, date: true, memberId: true },
  });
}

async function softDeleteAdvanceContribution(
  tx: Prisma.TransactionClient,
  actor: CurrentUser,
  contribution: { id: string; title: string; amount: Prisma.Decimal; date: Date; memberId: string },
  expenseId: string,
): Promise<void> {
  await tx.operation.updateMany({
    where: { id: contribution.id, deletedAt: null },
    data: { deletedAt: new Date(), deletedById: actor.id },
  });
  await writeAudit(tx, {
    actorId: actor.id,
    action: "operation.delete",
    entityType: "Operation",
    entityId: contribution.id,
    metadata: {
      type: "REVENUE",
      sourceExpenseId: expenseId,
      title: contribution.title,
      amount: contribution.amount.toFixed(2),
      date: dbDateToIso(contribution.date),
      memberId: contribution.memberId,
    },
  });
}

function assertNotGenerated(op: { sourceExpenseId: string | null }): void {
  if (op.sourceExpenseId) {
    throw new BusinessError(
      "Cette cotisation est générée par une dépense payée avec l'argent personnel du membre : modifiez ou supprimez la dépense.",
    );
  }
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
  const contributionCategoryId = wantsAdvanceContribution(type, input)
    ? await resolveAdvanceContributionCategory()
    : null;

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
    if (contributionCategoryId) {
      await createAdvanceContribution(tx, actor, created.id, data, memberId, contributionCategoryId);
    }
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
  assertNotGenerated(existing);
  await assertNotLocked(dbDateToIso(existing.date));
  await assertNotLocked(input.date);
  const memberId = await resolveMemberId(actor, input.memberId, existing.memberId);
  await assertCategoryUsable(input.categoryId, existing.type, existing.categoryId);
  const data = await toData(input, existing.type, memberId);

  // Synchronisation de la cotisation associée (dépenses uniquement).
  const linked = existing.type === "EXPENSE" ? await findAdvanceContribution(id) : null;
  const wanted = wantsAdvanceContribution(existing.type, input);
  const contributionCategoryId = wanted && !linked ? await resolveAdvanceContributionCategory() : null;
  const nextFields = advanceContributionFields(data, memberId);
  const linkedOutdated =
    wanted &&
    linked !== null &&
    (linked.title !== nextFields.title ||
      !linked.amount.equals(nextFields.amount) ||
      linked.date.getTime() !== nextFields.date.getTime() ||
      linked.memberId !== nextFields.memberId);

  const changes = diffFields(auditSnapshot(existing), auditSnapshot({ ...data, memberId }));
  const expenseChanged = Object.keys(changes).length > 0;
  if (!expenseChanged && !contributionCategoryId && !linkedOutdated && !(linked && !wanted)) return;

  await db.$transaction(async (tx) => {
    if (expenseChanged) {
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
    }

    if (contributionCategoryId) {
      await createAdvanceContribution(tx, actor, id, data, memberId, contributionCategoryId);
    } else if (linked && !wanted) {
      await softDeleteAdvanceContribution(tx, actor, linked, id);
    } else if (linked && linkedOutdated) {
      await tx.operation.update({ where: { id: linked.id }, data: { ...nextFields, updatedById: actor.id } });
      await writeAudit(tx, {
        actorId: actor.id,
        action: "operation.update",
        entityType: "Operation",
        entityId: linked.id,
        metadata: {
          sourceExpenseId: id,
          changes: diffFields(
            {
              title: linked.title,
              amount: linked.amount.toFixed(2),
              date: dbDateToIso(linked.date),
              memberId: linked.memberId,
            },
            {
              title: nextFields.title,
              amount: nextFields.amount.toFixed(2),
              date: dbDateToIso(nextFields.date),
              memberId: nextFields.memberId,
            },
          ),
        },
      });
    }
  });
}

/** Suppression logique : l'opération disparaît des listes et calculs mais reste tracée. */
export async function deleteOperation(
  actor: CurrentUser,
  id: string,
): Promise<{ type: OperationTypeValue; isContribution: boolean }> {
  const existing = await loadEditable(actor, id);
  assertNotGenerated(existing);
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
    // La cotisation générée par cette dépense disparaît avec elle.
    if (existing.type === "EXPENSE") {
      const linked = await findAdvanceContribution(id, tx);
      if (linked) await softDeleteAdvanceContribution(tx, actor, linked, id);
    }
  });
  return { type: existing.type, isContribution: existing.isContribution };
}
