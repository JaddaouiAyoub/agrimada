import "server-only";
import { db } from "@/lib/db";
import { BusinessError } from "@/lib/action-result";
import type { CurrentUser } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { hashToken } from "@/lib/auth/tokens";
import { writeAudit } from "@/server/audit";

const INVALID_LINK = "Ce lien est invalide ou a expiré. Demandez un nouveau lien à l'administrateur.";

export type TokenInfo = { type: "INVITATION" | "PASSWORD_RESET"; name: string; email: string };

/** Vérifie un lien d'activation / de réinitialisation sans le consommer. */
export async function getValidToken(rawToken: string): Promise<TokenInfo | null> {
  if (rawToken.length < 20 || rawToken.length > 200) return null;
  const token = await db.authToken.findUnique({
    where: { tokenHash: hashToken(rawToken) },
    select: { type: true, usedAt: true, expiresAt: true, user: { select: { name: true, email: true, status: true } } },
  });
  if (!token || token.usedAt || token.expiresAt < new Date() || token.user.status === "DISABLED") return null;
  return { type: token.type, name: token.user.name, email: token.user.email };
}

/** Consomme le lien et définit le mot de passe ; le compte devient actif. */
export async function setPasswordWithToken(rawToken: string, password: string): Promise<void> {
  const tokenHash = hashToken(rawToken);
  const token = await db.authToken.findUnique({
    where: { tokenHash },
    select: { id: true, type: true, userId: true, usedAt: true, expiresAt: true, user: { select: { status: true } } },
  });
  if (!token || token.usedAt || token.expiresAt < new Date() || token.user.status === "DISABLED") {
    throw new BusinessError(INVALID_LINK);
  }
  const passwordHash = await hashPassword(password);

  await db.$transaction(async (tx) => {
    // Consommation atomique : un lien ne peut servir qu'une fois, même en cas de double envoi.
    const consumed = await tx.authToken.updateMany({
      where: { id: token.id, usedAt: null },
      data: { usedAt: new Date() },
    });
    if (consumed.count !== 1) throw new BusinessError(INVALID_LINK);

    await tx.user.update({
      where: { id: token.userId },
      data: { passwordHash, status: "ACTIVE", sessionVersion: { increment: 1 } },
    });
    await tx.authToken.deleteMany({ where: { userId: token.userId, usedAt: null } });
    await writeAudit(tx, {
      actorId: token.userId,
      action: token.type === "INVITATION" ? "user.activate" : "user.password_reset",
      entityType: "User",
      entityId: token.userId,
    });
  });
}

export async function changePassword(actor: CurrentUser, currentPassword: string, newPassword: string): Promise<void> {
  const user = await db.user.findUnique({ where: { id: actor.id }, select: { passwordHash: true } });
  if (!user?.passwordHash || !(await verifyPassword(user.passwordHash, currentPassword))) {
    throw new BusinessError("Le mot de passe actuel est incorrect.");
  }
  const passwordHash = await hashPassword(newPassword);
  await db.$transaction(async (tx) => {
    // Incrémenter sessionVersion déconnecte toutes les sessions, y compris la session courante.
    await tx.user.update({
      where: { id: actor.id },
      data: { passwordHash, sessionVersion: { increment: 1 } },
    });
    await writeAudit(tx, { actorId: actor.id, action: "user.password_change", entityType: "User", entityId: actor.id });
  });
}

export async function updateProfile(actor: CurrentUser, name: string): Promise<void> {
  if (name === actor.name) return;
  await db.$transaction(async (tx) => {
    await tx.user.update({ where: { id: actor.id }, data: { name } });
    await writeAudit(tx, {
      actorId: actor.id,
      action: "user.profile_update",
      entityType: "User",
      entityId: actor.id,
      metadata: { changes: { name: [actor.name, name] } },
    });
  });
}
