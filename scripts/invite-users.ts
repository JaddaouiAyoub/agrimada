// Création initiale des comptes (administrateur et membres) SANS mot de passe.
//  - Chaque compte est créé « En attente » avec un lien d'activation à usage unique (72 h).
//  - La personne choisit elle-même son mot de passe en ouvrant son lien : aucun mot de passe
//    n'est défini, affiché ni stocké par ce script. Seul le hash SHA-256 du jeton est en base.
//  - Refuse toute adresse déjà existante (aucune modification de compte existant).
// Lancement : npm run users:invite -- chemin/vers/comptes.json
// Format : [{ "name": "Prénom Nom", "email": "x@exemple.ma", "role": "ADMIN" | "MEMBER" }]
import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";
import { activationUrl, createRawToken, hashToken } from "../src/lib/auth/tokens";
import { INVITATION_TTL_HOURS } from "../src/lib/constants";

const prisma = new PrismaClient();
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Invite = { name: string; email: string; role: "ADMIN" | "MEMBER" };

function parseInvites(path: string): Invite[] {
  const raw: unknown = JSON.parse(readFileSync(path, "utf8"));
  if (!Array.isArray(raw) || raw.length === 0) throw new Error("Le fichier doit contenir une liste non vide.");
  const invites = raw.map((entry: unknown, index): Invite => {
    const e = entry as Partial<Record<keyof Invite, unknown>>;
    const name = typeof e.name === "string" ? e.name.trim().replace(/\s+/g, " ") : "";
    const email = typeof e.email === "string" ? e.email.trim().toLowerCase() : "";
    const role = e.role === "ADMIN" ? "ADMIN" : e.role === "MEMBER" || e.role === undefined ? "MEMBER" : null;
    if (name.length < 2 || name.length > 120) throw new Error(`Entrée ${index + 1} : nom invalide.`);
    if (!EMAIL_REGEX.test(email) || email.length > 254) throw new Error(`Entrée ${index + 1} : email invalide.`);
    if (!role) throw new Error(`Entrée ${index + 1} : rôle invalide (ADMIN ou MEMBER).`);
    return { name, email, role };
  });
  if (new Set(invites.map((i) => i.email)).size !== invites.length) throw new Error("Adresse email en double.");
  return invites;
}

async function main() {
  const path = process.argv[2];
  if (!path) throw new Error("Usage : npm run users:invite -- comptes.json");
  const invites = parseInvites(path);

  const links = await prisma.$transaction(
    async (tx) => {
      const hasAdmin = (await tx.user.count({ where: { role: "ADMIN", status: { not: "DISABLED" } } })) > 0;
      if (!hasAdmin && !invites.some((i) => i.role === "ADMIN")) {
        throw new Error("Aucun administrateur n'existe : la liste doit en contenir au moins un.");
      }
      const existing = await tx.user.findMany({
        where: { email: { in: invites.map((i) => i.email) } },
        select: { email: true },
      });
      if (existing.length > 0) {
        throw new Error(`Compte(s) déjà existant(s) : ${existing.map((u) => u.email).join(", ")}.`);
      }

      const expiresAt = new Date(Date.now() + INVITATION_TTL_HOURS * 3600 * 1000);
      const result: { invite: Invite; url: string }[] = [];
      for (const invite of invites) {
        const user = await tx.user.create({
          data: { name: invite.name, email: invite.email, role: invite.role, status: "PENDING" },
          select: { id: true },
        });
        const rawToken = createRawToken();
        await tx.authToken.create({
          data: { userId: user.id, type: "INVITATION", tokenHash: hashToken(rawToken), expiresAt },
        });
        await tx.auditLog.create({
          data: {
            actorId: null,
            action: "user.create",
            entityType: "User",
            entityId: user.id,
            metadata: { script: "invite-users", role: invite.role },
          },
        });
        result.push({ invite, url: activationUrl(rawToken) });
      }
      return result;
    },
    { isolationLevel: "Serializable" },
  );

  console.log(`\n${links.length} compte(s) créé(s), en attente d'activation (liens valables ${INVITATION_TTL_HOURS} h, usage unique) :\n`);
  for (const { invite, url } of links) {
    console.log(`${invite.role === "ADMIN" ? "[ADMIN] " : ""}${invite.name} <${invite.email}>\n  ${url}\n`);
  }
  console.log("Transmettez chaque lien à sa personne uniquement. Ils ne seront plus affichés.");
}

main()
  .catch((error: unknown) => {
    console.error(`\nÉchec : ${error instanceof Error ? error.message : "erreur inconnue"}`);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
