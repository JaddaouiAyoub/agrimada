"use client";

import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <TriangleAlert className="size-6" aria-hidden />
      </div>
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">Une erreur est survenue</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Le chargement de cette page a échoué. Réessayez ; si le problème persiste, contactez l&apos;administrateur.
        </p>
      </div>
      <Button onClick={reset}>Réessayer</Button>
    </div>
  );
}
