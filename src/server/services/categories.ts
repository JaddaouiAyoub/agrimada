import "server-only";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { BusinessError } from "@/lib/action-result";
import type { CurrentUser } from "@/lib/auth/session";
import { emptyToNull } from "@/lib/validations/common";
import { cleanCategoryName, normalizeCategoryName, type CategoryValues } from "@/lib/validations/category";
import { diffFields, writeAudit } from "@/server/audit";

const DUPLICATE_MESSAGE = "Une catégorie de ce type porte déjà ce nom.";

function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export async function createCategory(actor: CurrentUser, input: CategoryValues): Promise<void> {
  try {
    await db.$transaction(async (tx) => {
      const last = await tx.category.aggregate({ where: { type: input.type }, _max: { sortOrder: true } });
      const created = await tx.category.create({
        data: {
          type: input.type,
          name: cleanCategoryName(input.name),
          normalizedName: normalizeCategoryName(input.name),
          description: emptyToNull(input.description),
          color: emptyToNull(input.color),
          icon: emptyToNull(input.icon),
          sortOrder: (last._max.sortOrder ?? 0) + 1,
        },
        select: { id: true },
      });
      await writeAudit(tx, {
        actorId: actor.id,
        action: "category.create",
        entityType: "Category",
        entityId: created.id,
        metadata: { type: input.type, name: cleanCategoryName(input.name) },
      });
    });
  } catch (error) {
    if (isUniqueViolation(error)) throw new BusinessError(DUPLICATE_MESSAGE);
    throw error;
  }
}

/** Le type d'une catégorie n'est jamais modifiable (cohérence de l'historique). */
export async function updateCategory(actor: CurrentUser, id: string, input: CategoryValues): Promise<void> {
  const existing = await db.category.findUnique({ where: { id } });
  if (!existing) throw new BusinessError("Catégorie introuvable.");

  const next = {
    name: cleanCategoryName(input.name),
    description: emptyToNull(input.description),
    color: emptyToNull(input.color),
    icon: emptyToNull(input.icon),
  };
  const changes = diffFields(
    { name: existing.name, description: existing.description, color: existing.color, icon: existing.icon },
    next,
  );
  if (Object.keys(changes).length === 0) return;

  try {
    await db.$transaction(async (tx) => {
      await tx.category.update({
        where: { id },
        data: { ...next, normalizedName: normalizeCategoryName(input.name) },
      });
      await writeAudit(tx, {
        actorId: actor.id,
        action: "category.update",
        entityType: "Category",
        entityId: id,
        metadata: { changes },
      });
    });
  } catch (error) {
    if (isUniqueViolation(error)) throw new BusinessError(DUPLICATE_MESSAGE);
    throw error;
  }
}

export async function setCategoryActive(actor: CurrentUser, id: string, active: boolean): Promise<void> {
  await db.$transaction(async (tx) => {
    const updated = await tx.category.updateMany({ where: { id, isActive: !active }, data: { isActive: active } });
    if (updated.count === 0) return;
    await writeAudit(tx, {
      actorId: actor.id,
      action: active ? "category.enable" : "category.disable",
      entityType: "Category",
      entityId: id,
    });
  });
}

/** Échange la position avec la catégorie voisine du même type. */
export async function moveCategory(actor: CurrentUser, id: string, direction: "up" | "down"): Promise<void> {
  await db.$transaction(async (tx) => {
    const current = await tx.category.findUnique({ where: { id }, select: { id: true, type: true } });
    if (!current) throw new BusinessError("Catégorie introuvable.");
    const ordered = await tx.category.findMany({
      where: { type: current.type },
      select: { id: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
    const index = ordered.findIndex((c) => c.id === id);
    const target = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || target < 0 || target >= ordered.length) return;
    const reordered = [...ordered];
    const [moved] = reordered.splice(index, 1);
    if (!moved) return;
    reordered.splice(target, 0, moved);
    // Renumérotation complète : corrige aussi d'éventuels doublons de sortOrder.
    for (const [position, category] of reordered.entries()) {
      await tx.category.update({ where: { id: category.id }, data: { sortOrder: position + 1 } });
    }
    await writeAudit(tx, {
      actorId: actor.id,
      action: "category.reorder",
      entityType: "Category",
      entityId: id,
      metadata: { direction },
    });
  });
}

/** Suppression physique uniquement si aucune opération (même supprimée) n'y fait référence. */
export async function deleteCategory(actor: CurrentUser, id: string): Promise<void> {
  await db.$transaction(async (tx) => {
    const category = await tx.category.findUnique({
      where: { id },
      select: { id: true, name: true, type: true, _count: { select: { operations: true } } },
    });
    if (!category) throw new BusinessError("Catégorie introuvable.");
    if (category._count.operations > 0) {
      throw new BusinessError("Cette catégorie est utilisée par des opérations : désactivez-la plutôt.");
    }
    await tx.category.delete({ where: { id } });
    await writeAudit(tx, {
      actorId: actor.id,
      action: "category.delete",
      entityType: "Category",
      entityId: id,
      metadata: { name: category.name, type: category.type },
    });
  });
}
