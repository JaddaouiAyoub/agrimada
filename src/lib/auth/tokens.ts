import { createHash, randomBytes } from "node:crypto";

/** Jeton aléatoire de 256 bits, transmis une seule fois à l'utilisateur. */
export function createRawToken(): string {
  return randomBytes(32).toString("base64url");
}

/** Seul ce hash est stocké en base. */
export function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

export function appUrl(): string {
  return (process.env.APP_URL ?? "http://localhost:3000").replace(/\/+$/, "");
}

export function activationUrl(rawToken: string): string {
  return `${appUrl()}/activate/${rawToken}`;
}
