"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth/config";
import type { ActionResult } from "@/lib/action-result";
import { loginSchema, setPasswordSchema } from "@/lib/validations/auth";
import { setPasswordWithToken } from "@/server/services/account";
import { runAction } from "@/server/run-action";

function safeCallbackUrl(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return "/dashboard";
  }
  return value;
}

export async function loginAction(input: unknown, callbackUrl?: unknown): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Email ou mot de passe incorrect." };
  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: safeCallbackUrl(callbackUrl),
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthError) {
      const code = "code" in error ? (error as { code?: unknown }).code : undefined;
      if (code === "rate_limited") {
        return { ok: false, error: "Trop de tentatives. Réessayez dans 15 minutes." };
      }
      return { ok: false, error: "Email ou mot de passe incorrect." };
    }
    throw error; // redirection de succès (NEXT_REDIRECT)
  }
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}

export async function setPasswordAction(input: unknown): Promise<ActionResult> {
  return runAction(async () => {
    const values = setPasswordSchema.parse(input);
    await setPasswordWithToken(values.token, values.password);
    return { ok: true, message: "Mot de passe enregistré. Vous pouvez vous connecter." };
  });
}
