import "server-only";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { ForbiddenError } from "@/lib/action-result";
import type { RoleValue } from "@/lib/constants";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: RoleValue;
};

/**
 * Utilisateur courant, relu en base à chaque requête (mise en cache le temps du rendu).
 * Un compte désactivé, ou dont la sessionVersion a changé (désactivation, changement
 * de rôle ou de mot de passe), perd immédiatement l'accès même si son JWT est encore valide.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true, status: true, sessionVersion: true },
  });
  if (!user || user.status !== "ACTIVE" || user.sessionVersion !== session.sv) return null;

  return { id: user.id, name: user.name, email: user.email, role: user.role };
});

/** Pages et actions : redirige vers /login si la session n'est pas valide. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Pages réservées à l'administrateur : 404 pour ne pas révéler leur existence. */
export async function requireAdminPage(): Promise<CurrentUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN") notFound();
  return user;
}

/** Actions serveur réservées à l'administrateur. */
export function assertAdmin(user: CurrentUser): void {
  if (user.role !== "ADMIN") throw new ForbiddenError();
}
