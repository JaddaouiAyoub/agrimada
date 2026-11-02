"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ActionResult } from "@/lib/action-result";
import { requireUser } from "@/lib/auth/session";
import { OPERATION_TYPES } from "@/lib/constants";
import { idSchema } from "@/lib/validations/common";
import { operationFormSchema } from "@/lib/validations/operation";
import { createOperation, deleteOperation, updateOperation } from "@/server/services/operations";
import { runAction } from "@/server/run-action";

// Les pages concernées sont dynamiques ; on invalide l'ensemble du layout
// pour que dashboard, listes et totaux reflètent immédiatement la modification.
function revalidateFinancialPages() {
  revalidatePath("/", "layout");
}

export async function createOperationAction(type: unknown, input: unknown): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    const user = await requireUser();
    const opType = z.enum(OPERATION_TYPES).parse(type);
    const values = operationFormSchema.parse(input);
    const created = await createOperation(user, opType, values);
    revalidateFinancialPages();
    return {
      ok: true,
      message: opType === "EXPENSE" ? "Dépense enregistrée." : "Revenu enregistré.",
      data: created,
    };
  });
}

export async function updateOperationAction(id: unknown, input: unknown): Promise<ActionResult> {
  return runAction(async () => {
    const user = await requireUser();
    const operationId = idSchema.parse(id);
    const values = operationFormSchema.parse(input);
    await updateOperation(user, operationId, values);
    revalidateFinancialPages();
    return { ok: true, message: "Opération mise à jour." };
  });
}

export async function deleteOperationAction(id: unknown): Promise<ActionResult> {
  return runAction(async () => {
    const user = await requireUser();
    const type = await deleteOperation(user, idSchema.parse(id));
    revalidateFinancialPages();
    return { ok: true, message: type === "EXPENSE" ? "Dépense supprimée." : "Revenu supprimé." };
  });
}
