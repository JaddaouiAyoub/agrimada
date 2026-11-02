"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ActionResult } from "@/lib/action-result";
import { assertAdmin, requireUser } from "@/lib/auth/session";
import { idSchema } from "@/lib/validations/common";
import { memberCreateSchema, memberUpdateSchema } from "@/lib/validations/member";
import {
  createAccessLink,
  createMember,
  deleteMember,
  setMemberActive,
  updateMember,
} from "@/server/services/members";
import { runAction } from "@/server/run-action";

async function requireAdminActor() {
  const user = await requireUser();
  assertAdmin(user);
  return user;
}

export async function createMemberAction(input: unknown): Promise<ActionResult<{ activationUrl: string | null }>> {
  return runAction(async () => {
    const actor = await requireAdminActor();
    const values = memberCreateSchema.parse(input);
    const result = await createMember(actor, values);
    revalidatePath("/members");
    return { ok: true, message: "Membre créé.", data: { activationUrl: result.activationUrl } };
  });
}

export async function updateMemberAction(input: unknown): Promise<ActionResult> {
  return runAction(async () => {
    const actor = await requireAdminActor();
    await updateMember(actor, memberUpdateSchema.parse(input));
    revalidatePath("/", "layout");
    return { ok: true, message: "Membre mis à jour." };
  });
}

export async function setMemberActiveAction(id: unknown, active: unknown): Promise<ActionResult> {
  return runAction(async () => {
    const actor = await requireAdminActor();
    const enable = z.boolean().parse(active);
    await setMemberActive(actor, idSchema.parse(id), enable);
    revalidatePath("/", "layout");
    return { ok: true, message: enable ? "Compte réactivé." : "Compte désactivé. Ses sessions sont révoquées." };
  });
}

export async function createAccessLinkAction(id: unknown): Promise<ActionResult<{ url: string }>> {
  return runAction(async () => {
    const actor = await requireAdminActor();
    const url = await createAccessLink(actor, idSchema.parse(id));
    return { ok: true, message: "Lien généré.", data: { url } };
  });
}

export async function deleteMemberAction(id: unknown): Promise<ActionResult> {
  return runAction(async () => {
    const actor = await requireAdminActor();
    await deleteMember(actor, idSchema.parse(id));
    revalidatePath("/members");
    return { ok: true, message: "Compte supprimé." };
  });
}
