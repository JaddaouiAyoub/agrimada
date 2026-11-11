import type { Metadata } from "next";
import Link from "next/link";
import { Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppDocument } from "@/components/layout/app-document";

export const metadata: Metadata = { title: "Page introuvable", robots: { index: false, follow: false } };

// Page 404 globale : le gabarit racine ne fournissant pas de <html>, elle porte le sien.
export default function NotFound() {
  return (
    <AppDocument>
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
          <Sprout className="size-6" aria-hidden />
        </div>
        <h1 className="text-xl font-semibold">Page introuvable</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Cette page n&apos;existe pas ou vous n&apos;avez pas les droits pour y accéder.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link href="/fr">Retour au site</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">Tableau de bord</Link>
          </Button>
        </div>
      </main>
    </AppDocument>
  );
}
