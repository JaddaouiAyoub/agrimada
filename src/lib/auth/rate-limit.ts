import "server-only";
import { db } from "@/lib/db";

// Limitation des tentatives de connexion, stockée en base (pas de Redis nécessaire).
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES_PER_EMAIL = 5;
const MAX_FAILURES_PER_IP = 20;
const RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

export async function isLoginBlocked(email: string, ip: string | null): Promise<boolean> {
  const since = new Date(Date.now() - WINDOW_MS);
  const [byEmail, byIp] = await Promise.all([
    db.loginAttempt.count({ where: { email, success: false, createdAt: { gte: since } } }),
    ip
      ? db.loginAttempt.count({ where: { ip, success: false, createdAt: { gte: since } } })
      : Promise.resolve(0),
  ]);
  return byEmail >= MAX_FAILURES_PER_EMAIL || byIp >= MAX_FAILURES_PER_IP;
}

export async function recordLoginAttempt(email: string, ip: string | null, success: boolean) {
  await db.loginAttempt.create({ data: { email, ip, success } });
  // Purge occasionnelle des anciennes tentatives.
  if (Math.random() < 0.02) {
    await db.loginAttempt.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - RETENTION_MS) } } });
  }
}

export function ipFromHeaders(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || headers.get("x-real-ip")?.trim() || null;
  return ip ? ip.slice(0, 45) : null;
}
