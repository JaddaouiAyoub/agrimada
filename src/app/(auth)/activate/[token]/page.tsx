import type { Metadata } from "next";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getValidToken } from "@/server/services/account";
import { SetPasswordForm } from "./set-password-form";

export const metadata: Metadata = { title: "Activation du compte" };

export default async function ActivatePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const info = await getValidToken(token);

  if (!info) {
    return (
      <div className="space-y-6">
        <div className="flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <TriangleAlert className="size-5" aria-hidden />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Lien invalide</h1>
          <p className="text-sm text-muted-foreground">
            Ce lien a expiré, a déjà été utilisé ou n&apos;existe pas. Demandez un nouveau lien à l&apos;administrateur.
          </p>
        </div>
        <Button variant="outline" asChild className="w-full">
          <Link href="/login">Retour à la connexion</Link>
        </Button>
      </div>
    );
  }

  const isInvitation = info.type === "INVITATION";
  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">
          {isInvitation ? `Bienvenue, ${info.name}` : "Nouveau mot de passe"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isInvitation
            ? "Choisissez votre mot de passe pour activer votre compte."
            : "Choisissez un nouveau mot de passe pour votre compte."}{" "}
          <span className="font-medium text-foreground">{info.email}</span>
        </p>
      </div>
      <SetPasswordForm token={token} email={info.email} />
    </div>
  );
}
