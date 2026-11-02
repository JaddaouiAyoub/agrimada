"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ActionResult } from "@/lib/action-result";
import { assertAdmin, requireUser } from "@/lib/auth/session";
import { categorySchema } from "@/lib/validations/category";
import { idSchema } from "@/lib/validations/common";
import {
  createCategory,
  deleteCategory,
  moveCategory,
  setCategoryActive,
  updateCategory,
} from "@/server/services/categories";
import { runAction } from "@/server/run-action";

async function requireAdminActor() {
  const user = await requireUser();
  assertAdmin(user);
  return user;
}

function revalidate() {
  revalidatePath("/", "layout");
}

export async function createCategoryAction(input: unknown): Promise<ActionResult> {
  return runAction(async () => {
    const actor = await requireAdminActor();
    await createCategory(actor, categorySchema.parse(input));
    revalidate();
    return { ok: true, message: "Catégorie créée." };
  });
}

export async function updateCategoryAction(id: unknown, input: unknown): Promise<ActionResult> {
  return runAction(async () => {
    const actor = await requireAdminActor();
    await updateCategory(actor, idSchema.parse(id), categorySchema.parse(input));
    revalidate();
    return { ok: true, message: "Catégorie mise à jour." };
  });
}

export async function setCategoryActiveAction(id: unknown, active: unknown): Promise<ActionResult> {
  return runAction(async () => {
    const actor = await requireAdminActor();
    const enable = z.boolean().parse(active);
    await setCategoryActive(actor, idSchema.parse(id), enable);
    revalidate();
    return { ok: true, message: enable ? "Catégorie activée." : "Catégorie désactivée." };
  });
}

export async function moveCategoryAction(id: unknown, direction: unknown): Promise<ActionResult> {
  return runAction(async () => {
    const actor = await requireAdminActor();
    await moveCategory(actor, idSchema.parse(id), z.enum(["up", "down"]).parse(direction));
    revalidate();
    return { ok: true };
  });
}

export async function deleteCategoryAction(id: unknown): Promise<ActionResult> {
  return runAction(async () => {
    const actor = await requireAdminActor();
    await deleteCategory(actor, idSchema.parse(id));
    revalidate();
    return { ok: true, message: "Catégorie supprimée." };
  });
}
