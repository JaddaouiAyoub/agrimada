import type { Metadata } from "next";
import { Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { ExportForm } from "@/components/reports/export-form";
import { requireUser } from "@/lib/auth/session";
import { OPERATION_TYPE_LABELS } from "@/lib/constants";
import { getCategoryOptions, getMemberOptions } from "@/server/queries/operations";

export const metadata: Metadata = { title: "Rapports et exports" };

export default async function ReportsPage() {
  await requireUser();
  const [members, categories] = await Promise.all([getMemberOptions(), getCategoryOptions()]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rapports et exports"
        description="Exportez les opérations ou le bilan financier de la ferme au format Excel ou CSV."
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <ExportForm
          members={members.map((m) => ({ value: m.id, label: m.status === "DISABLED" ? `${m.name} (désactivé)` : m.name }))}
          categories={categories.map((c) => ({
            value: c.id,
            label: `${OPERATION_TYPE_LABELS[c.type]} · ${c.name}${c.isActive ? "" : " (inactive)"}`,
          }))}
        />
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="size-4 text-muted-foreground" aria-hidden /> Bon à savoir
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">CSV</strong> : séparateur point-virgule, décimales avec virgule, encodage
              UTF-8 — s&apos;ouvre directement dans Excel en français.
            </p>
            <p>
              <strong className="text-foreground">Excel</strong> : montants numériques au format MAD, dates reconnues
              par Excel.
            </p>
            <p>
              Le <strong className="text-foreground">résultat</strong> (revenus − dépenses) n&apos;est pas un solde de
              trésorerie. Les montants par membre sont bruts, hors remboursements.
            </p>
            <p>Chaque export est enregistré dans le journal d&apos;activité.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
