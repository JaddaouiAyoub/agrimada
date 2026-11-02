// Hachage Argon2id (paramètres recommandés par l'OWASP : 19 MiB, 2 itérations).
// Pas d'import "server-only" : ce module est aussi utilisé par le script create-admin.
import { hash, verify } from "@node-rs/argon2";

const ARGON2_OPTIONS = {
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
};

export function hashPassword(password: string): Promise<string> {
  return hash(password, ARGON2_OPTIONS);
}

export async function verifyPassword(passwordHash: string, password: string): Promise<boolean> {
  try {
    return await verify(passwordHash, password);
  } catch {
    return false;
  }
}

let dummyHash: Promise<string> | undefined;

/**
 * Effectue une vérification factice pour que la durée de réponse soit identique
 * qu'un compte existe ou non (évite l'énumération des emails).
 */
export async function fakeVerify(password: string): Promise<void> {
  dummyHash ??= hashPassword("farmshare-timing-equalizer");
  await verifyPassword(await dummyHash, password);
}
