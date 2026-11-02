"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/action-result";
import { assertAdmin, requireUser } from "@/lib/auth/session";
import { settingsSchema } from "@/lib/validations/settings";
import { updateSettings } from "@/server/services/settings";
import { runAction } from "@/server/run-action";

export async function updateSettingsAction(input: unknown): Promise<ActionResult> {
  return runAction(async () => {
    const actor = await requireUser();
    assertAdmin(actor);
    await updateSettings(actor, settingsSchema.parse(input));
    revalidatePath("/", "layout");
    return { ok: true, message: "Paramètres enregistrés." };
  });
}
