import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { ChangePasswordForm, ProfileForm } from "@/components/profile/profile-forms";
import { OperationsTable } from "@/components/operations/operations-table";
import { requireUser } from "@/lib/auth/session";
import { ROLE_LABELS } from "@/lib/constants";
import { formatMoney } from "@/lib/money";
import { buildOperationWhere, getOperationTotals, getRecentOperations } from "@/server/queries/operations";
import { getSettings } from "@/server/settings";

export const metadata: Metadata = { title: "Mon profil" };

export default async function ProfilePage() {
  const user = await requireUser();
  const where = buildOperationWhere({ memberId: user.id });
  const [settings, totals, recent] = await Promise.all([
    getSettings(),
    getOperationTotals(where),
    getRecentOperations(where, [{ date: "desc" }, { createdAt: "desc" }], 10),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title="Mon profil" description={`${user.email} · ${ROLE_LABELS[user.role]}`} />
      <ProfileForm name={user.name} email={user.email} />
      <ChangePasswordForm email={user.email} />
      <Card className="overflow-hidden">
        <CardHeader className="flex-row flex-wrap items-end justify-between gap-2">
          <div>
            <CardTitle>Mon historique</CardTitle>
            <CardDescription>
              {totals.expenseCount} dépense(s) payée(s) pour {formatMoney(totals.expense)} · {totals.revenueCount} revenu(s)
              encaissé(s) pour {formatMoney(totals.revenue)}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/transactions?member=${user.id}`}>
              Tout voir <ArrowRight />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {recent.length > 0 ? (
            <OperationsTable items={recent} actor={user} dateFormat={settings.dateFormat} />
          ) : (
            <p className="px-5 pb-5 text-sm text-muted-foreground">Aucune opération à votre nom pour le moment.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
