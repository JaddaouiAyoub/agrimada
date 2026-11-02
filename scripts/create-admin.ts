// Création sécurisée du PREMIER administrateur.
//  - Refuse de s'exécuter si un administrateur actif existe déjà.
//  - Le mot de passe est saisi de façon masquée ; il n'est jamais affiché, journalisé ni écrit sur disque.
// Lancement : npm run admin:create
import "dotenv/config";
import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline/promises";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth/password";

const prisma = new PrismaClient();
const MIN_LENGTH = 12;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function askHidden(question: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!stdin.isTTY) {
      reject(new Error("Terminal interactif requis pour saisir le mot de passe."));
      return;
    }
    stdout.write(question);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    let value = "";
    const onData = (chunk: string) => {
      for (const char of chunk) {
        if (char === "\r" || char === "\n" || char === "\u0004") {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.off("data", onData);
          stdout.write("\n");
          resolve(value);
          return;
        }
        if (char === "\u0003") {
          stdin.setRawMode(false);
          stdout.write("\n");
          process.exit(130);
        }
        if (char === "\u007f" || char === "\b") {
          if (value.length > 0) {
            value = value.slice(0, -1);
            stdout.write("\b \b");
          }
          continue;
        }
        value += char;
        stdout.write("*");
      }
    };
    stdin.on("data", onData);
  });
}

async function main() {
  if (!stdin.isTTY || !stdout.isTTY) {
    throw new Error("Terminal interactif requis. Exécutez cette commande une seule fois après le déploiement, depuis un terminal connecté à la base Railway.");
  }

  const activeAdmins = await prisma.user.count({ where: { role: "ADMIN", status: "ACTIVE" } });
  if (activeAdmins > 0) {
    console.error("Un administrateur actif existe déjà. Les autres comptes se créent depuis l'application (page Membres).");
    process.exitCode = 1;
    return;
  }

  console.log("Création du premier administrateur FarmShare\n");
  const rl = createInterface({ input: stdin, output: stdout });
  const name = (await rl.question("Nom complet : ")).trim();
  const email = (await rl.question("Adresse email : ")).trim().toLowerCase();
  rl.close();

  if (name.length < 2 || name.length > 120) throw new Error("Nom invalide (2 à 120 caractères).");
  if (!EMAIL_REGEX.test(email) || email.length > 254) throw new Error("Adresse email invalide.");

  const password = await askHidden(`Mot de passe (${MIN_LENGTH} caractères minimum) : `);
  if (password.length < MIN_LENGTH || password.length > 128) {
    throw new Error(`Le mot de passe doit contenir entre ${MIN_LENGTH} et 128 caractères.`);
  }
  const confirm = await askHidden("Confirmez le mot de passe : ");
  if (confirm !== password) throw new Error("Les mots de passe ne correspondent pas.");

  const passwordHash = await hashPassword(password);

  await prisma.$transaction(
    async (tx) => {
      // Re-vérification dans la transaction (évite deux créations concurrentes).
      if ((await tx.user.count({ where: { role: "ADMIN", status: "ACTIVE" } })) > 0) {
        throw new Error("Un administrateur actif a été créé entre-temps.");
      }
      const existing = await tx.user.findUnique({ where: { email }, select: { id: true } });
      if (existing) throw new Error("Un compte existe déjà avec cette adresse email.");
      const user = await tx.user.create({
        data: { name, email, passwordHash, role: "ADMIN", status: "ACTIVE" },
        select: { id: true },
      });
      await tx.auditLog.create({
        data: { actorId: null, action: "admin.bootstrap", entityType: "User", entityId: user.id, metadata: { email } },
      });
    },
    { isolationLevel: "Serializable" },
  );

  console.log(`\nAdministrateur créé : ${email}. Vous pouvez vous connecter sur /login.`);
}

main()
  .catch((error: unknown) => {
    console.error(`\nÉchec : ${error instanceof Error ? error.message : "erreur inconnue"}`);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
