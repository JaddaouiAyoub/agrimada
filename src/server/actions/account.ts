"use server";

import { revalidatePath } from "next/cache";
import { signOut } from "@/lib/auth/config";
import type { ActionResult } from "@/lib/action-result";
import { requireUser } from "@/lib/auth/session";
import { changePasswordSchema, profileSchema } from "@/lib/validations/auth";
import { changePassword, updateProfile } from "@/server/services/account";
import { runAction } from "@/server/run-action";

export async function updateProfileAction(input: unknown): Promise<ActionResult> {
  return runAction(async () => {
    const user = await requireUser();
    const values = profileSchema.parse(input);
    await updateProfile(user, values.name);
    revalidatePath("/", "layout");
    return { ok: true, message: "Profil mis à jour." };
  });
}

export async function changePasswordAction(input: unknown): Promise<ActionResult> {
  const result = await runAction<undefined>(async () => {
    const user = await requireUser();
    const values = changePasswordSchema.parse(input);
    await changePassword(user, values.currentPassword, values.newPassword);
    return { ok: true };
  });
  if (!result.ok) return result;
  // Toutes les sessions sont révoquées : reconnexion avec le nouveau mot de passe.
  await signOut({ redirectTo: "/login?password=changed" });
  return result;
}
