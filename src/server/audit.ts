import "server-only";
import { headers } from "next/headers";
import type { Prisma } from "@prisma/client";
import { ipFromHeaders } from "@/lib/auth/rate-limit";

export type AuditEntry = {
  actorId: string | null;
  action: string;
  entityType: "User" | "Category" | "Operation" | "FarmSettings";
  entityId?: string | null;
  metadata?: Prisma.InputJsonValue;
};

async function currentIp(): Promise<string | null> {
  try {
    return ipFromHeaders(await headers());
  } catch {
    return null; // hors contexte de requête
  }
}

/** Écrit une entrée d'audit dans la transaction fournie. Ne jamais y mettre de secret. */
export async function writeAudit(tx: Prisma.TransactionClient, entry: AuditEntry): Promise<void> {
  await tx.auditLog.create({
    data: {
      actorId: entry.actorId,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId ?? null,
      metadata: entry.metadata,
      ip: await currentIp(),
    },
  });
}

/** Liste des champs modifiés { champ: [avant, après] } pour l'audit. */
export function diffFields(
  before: Record<string, string | null>,
  after: Record<string, string | null>,
): Record<string, [string | null, string | null]> {
  const changes: Record<string, [string | null, string | null]> = {};
  for (const key of Object.keys(after)) {
    const a = before[key] ?? null;
    const b = after[key] ?? null;
    if (a !== b) changes[key] = [a, b];
  }
  return changes;
}
