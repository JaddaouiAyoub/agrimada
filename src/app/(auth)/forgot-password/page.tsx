import type { Metadata } from "next";
import Link from "next/link";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Mot de passe oublié" };

// Aucun service d'email n'est configuré : la réinitialisation passe par l'administrateur,
// qui génère un lien à usage unique depuis la page « Membres ».
export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="flex size-11 items-center justify-center rounded-full bg-secondary text-primary">
        <KeyRound className="size-5" aria-hidden />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Mot de passe oublié</h1>
        <p className="text-sm text-muted-foreground">
          Demandez à l&apos;administrateur de la ferme de vous générer un lien de réinitialisation depuis la page
          « Membres ». Ce lien, valable 24 heures et utilisable une seule fois, vous permettra de choisir un nouveau
          mot de passe.
        </p>
      </div>
      <Button variant="outline" asChild className="w-full">
        <Link href="/login">Retour à la connexion</Link>
      </Button>
    </div>
  );
}
