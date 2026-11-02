import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { SettingsForm } from "@/components/settings/settings-form";
import { requireAdminPage } from "@/lib/auth/session";
import { getSettings } from "@/server/settings";

export const metadata: Metadata = { title: "Paramètres" };

export default async function SettingsPage() {
  await requireAdminPage();
  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Paramètres" description="Configuration de la ferme. Toute modification est tracée." />
      <SettingsForm
        defaultValues={{
          farmName: settings.farmName,
          description: settings.description ?? "",
          timezone: settings.timezone,
          dateFormat: settings.dateFormat,
          lockedUntil: settings.lockedUntil ?? "",
        }}
      />
      <Card>
        <CardHeader>
          <CardTitle>Parts des associés</CardTitle>
          <CardDescription>
            Module non activé. La répartition du résultat et le calcul des sommes dues entre associés nécessitent des
            règles de partage à valider (étape 10) : aucune répartition n&apos;est supposée par défaut.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          En attendant, le tableau de bord affiche les montants bruts payés, avancés et encaissés par chaque membre.
        </CardContent>
      </Card>
    </div>
  );
}
