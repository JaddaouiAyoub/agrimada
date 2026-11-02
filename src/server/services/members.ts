import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { BusinessError } from "@/lib/action-result";
import type { CurrentUser } from "@/lib/auth/session";
import { activationUrl, createRawToken, hashToken } from "@/lib/auth/tokens";
import { INVITATION_TTL_HOURS, RESET_TTL_HOURS } from "@/lib/constants";
import type { MemberCreateValues, MemberUpdateValues } from "@/lib/validations/member";
import { diffFields, writeAudit } from "@/server/audit";

const SERIALIZABLE = { isolationLevel: "Serializable" as const };

async function issueToken(
  tx: Prisma.TransactionClient,
  userId: string,
  type: "INVITATION" | "PASSWORD_RESET",
): Promise<string> {
  // Un seul lien valide à la fois : les précédents sont invalidés.
  await tx.authToken.deleteMany({ where: { userId, usedAt: null } });
  const raw = createRawToken();
  const ttlHours = type === "INVITATION" ? INVITATION_TTL_HOURS : RESET_TTL_HOURS;
  await tx.authToken.create({
    data: {
      userId,
      type,
      tokenHash: hashToken(raw),
      expiresAt: new Date(Date.now() + ttlHours * 3600 * 1000),
    },
  });
  return activationUrl(raw);
}

async function assertAnotherActiveAdmin(tx: Prisma.TransactionClient, excludedUserId: string): Promise<void> {
  const others = await tx.user.count({
    where: { role: "ADMIN", status: "ACTIVE", id: { not: excludedUserId } },
  });
  if (others === 0) {
    throw new BusinessError("Action impossible : la ferme doit toujours conserver au moins un administrateur actif.");
  }
}

export async function createMember(
  actor: CurrentUser,
  input: MemberCreateValues,
): Promise<{ id: string; activationUrl: string | null }> {
  const exists = await db.user.findUnique({ where: { email: input.email }, select: { id: true } });
  if (exists) throw new BusinessError("Un compte existe déjà avec cette adresse email.");

  return db.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { name: input.name, email: input.email, role: input.role, status: input.initialStatus },
      select: { id: true },
    });
    const url = input.initialStatus === "PENDING" ? await issueToken(tx, user.id, "INVITATION") : null;
    await writeAudit(tx, {
      actorId: actor.id,
      action: "user.create",
      entityType: "User",
      entityId: user.id,
      metadata: { name: input.name, email: input.email, role: input.role, status: input.initialStatus },
    });
    return { id: user.id, activationUrl: url };
  });
}

export async function updateMember(actor: CurrentUser, input: MemberUpdateValues): Promise<void> {
  await db.$transaction(async (tx) => {
    const target = await tx.user.findUnique({
      where: { id: input.id },
      select: { id: true, name: true, email: true, role: true, status: true },
    });
    if (!target) throw new BusinessError("Membre introuvable.");

    if (target.role !== input.role) {
      if (target.id === actor.id) throw new BusinessError("Vous ne pouvez pas modifier votre propre rôle.");
      if (target.role === "ADMIN" && target.status === "ACTIVE") await assertAnotherActiveAdmin(tx, target.id);
    }
    if (target.email !== input.email) {
      const taken = await tx.user.findUnique({ where: { email: input.email }, select: { id: true } });
      if (taken) throw new BusinessError("Un compte existe déjà avec cette adresse email.");
    }

    const changes = diffFields(
      { name: target.name, email: target.email, role: target.role },
      { name: input.name, email: input.email, role: input.role },
    );
    if (Object.keys(changes).length === 0) return;

    const securityChange = target.role !== input.role || target.email !== input.email;
    await tx.user.update({
      where: { id: target.id },
      data: {
        name: input.name,
        email: input.email,
        role: input.role,
        ...(securityChange ? { sessionVersion: { increment: 1 } } : {}),
      },
    });
    await writeAudit(tx, {
      actorId: actor.id,
      action: "user.update",
      entityType: "User",
      entityId: target.id,
      metadata: { changes },
    });
  }, SERIALIZABLE);
}

export async function setMemberActive(actor: CurrentUser, userId: string, active: boolean): Promise<void> {
  await db.$transaction(async (tx) => {
    const target = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, status: true, passwordHash: true },
    });
    if (!target) throw new BusinessError("Membre introuvable.");

    if (!active) {
      if (target.id === actor.id) throw new BusinessError("Vous ne pouvez pas désactiver votre propre compte.");
      if (target.status === "DISABLED") return;
      if (target.role === "ADMIN" && target.status === "ACTIVE") await assertAnotherActiveAdmin(tx, target.id);
      await tx.user.update({
        where: { id: target.id },
        data: { status: "DISABLED", sessionVersion: { increment: 1 } },
      });
      await tx.authToken.deleteMany({ where: { userId: target.id, usedAt: null } });
    } else {
      if (target.status !== "DISABLED") return;
      // Un compte jamais activé repasse « en attente » : il lui faudra un lien d'activation.
      await tx.user.update({
        where: { id: target.id },
        data: { status: target.passwordHash ? "ACTIVE" : "PENDING" },
      });
    }
    await writeAudit(tx, {
      actorId: actor.id,
      action: active ? "user.enable" : "user.disable",
      entityType: "User",
      entityId: target.id,
    });
  }, SERIALIZABLE);
}

/** Lien d'activation (compte jamais activé) ou de réinitialisation du mot de passe. */
export async function createAccessLink(actor: CurrentUser, userId: string): Promise<string> {
  return db.$transaction(async (tx) => {
    const target = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true, status: true, passwordHash: true },
    });
    if (!target) throw new BusinessError("Membre introuvable.");
    if (target.status === "DISABLED") throw new BusinessError("Réactivez d'abord ce compte.");
    const type = target.passwordHash ? "PASSWORD_RESET" : "INVITATION";
    const url = await issueToken(tx, target.id, type);
    await writeAudit(tx, {
      actorId: actor.id,
      action: type === "INVITATION" ? "user.invitation_link" : "user.reset_link",
      entityType: "User",
      entityId: target.id,
    });
    return url;
  });
}

/** Suppression physique réservée aux comptes jamais activés et sans aucun historique. */
export async function deleteMember(actor: CurrentUser, userId: string): Promise<void> {
  await db.$transaction(async (tx) => {
    const target = await tx.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        lastLoginAt: true,
        _count: { select: { operations: true, createdOperations: true, auditLogs: true } },
      },
    });
    if (!target) throw new BusinessError("Membre introuvable.");
    if (target.id === actor.id) throw new BusinessError("Vous ne pouvez pas supprimer votre propre compte.");
    const hasHistory =
      target.passwordHash !== null ||
      target.lastLoginAt !== null ||
      target._count.operations + target._count.createdOperations + target._count.auditLogs > 0;
    if (hasHistory) {
      throw new BusinessError("Ce compte possède un historique : il ne peut qu'être désactivé.");
    }
    await tx.user.delete({ where: { id: target.id } });
    await writeAudit(tx, {
      actorId: actor.id,
      action: "user.delete",
      entityType: "User",
      entityId: target.id,
      metadata: { email: target.email },
    });
  });
}
