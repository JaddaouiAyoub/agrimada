import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { first, type SearchParams } from "@/lib/validations/filters";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Connexion" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const [user, sp] = await Promise.all([getCurrentUser(), searchParams]);
  if (user) redirect("/dashboard");

  const notice =
    first(sp, "password") === "changed"
      ? "Mot de passe modifié. Reconnectez-vous avec votre nouveau mot de passe."
      : first(sp, "activated") === "1"
        ? "Votre mot de passe est enregistré. Vous pouvez vous connecter."
        : undefined;

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Connexion</h1>
        <p className="text-sm text-muted-foreground">Accédez à l&apos;espace financier de la ferme.</p>
      </div>
      {notice && (
        <p role="status" className="rounded-md border border-revenue/20 bg-revenue-soft px-3 py-2 text-sm text-revenue">
          {notice}
        </p>
      )}
      <LoginForm callbackUrl={first(sp, "callbackUrl")} />
    </div>
  );
}
