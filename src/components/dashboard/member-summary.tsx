import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/money";
import type { MemberSummary } from "@/server/services/finance";

/** Résumé brut par membre : faits enregistrés, pas des dettes (régularisation non activée). */
export function MemberSummaryTable({ members }: { members: MemberSummary[] }) {
  if (members.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">Aucun membre à afficher.</p>;
  }
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>Membre</TableHead>
          <TableHead className="text-right">Dépenses payées</TableHead>
          <TableHead className="text-right" title="Achats payés avec l'argent personnel du membre et non comptés comme cotisation">
            dont avances à rembourser
          </TableHead>
          <TableHead className="text-right">Revenus encaissés</TableHead>
          <TableHead className="text-right">dont cotisations</TableHead>
          <TableHead className="text-right">dont conservés</TableHead>
          <TableHead className="text-right">Opérations</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((m) => (
          <TableRow key={m.id}>
            <TableCell className="font-medium whitespace-nowrap">
              {m.name}
              {m.status === "DISABLED" && (
                <Badge variant="muted" className="ml-2">
                  désactivé
                </Badge>
              )}
            </TableCell>
            <TableCell className="tabular text-right">{formatMoney(m.expensesPaid)}</TableCell>
            <TableCell className="tabular text-right text-muted-foreground">{formatMoney(m.advances)}</TableCell>
            <TableCell className="tabular text-right">{formatMoney(m.revenuesReceived)}</TableCell>
            <TableCell className="tabular text-right text-muted-foreground">{formatMoney(m.contributionsPaid)}</TableCell>
            <TableCell className="tabular text-right text-muted-foreground">{formatMoney(m.heldFunds)}</TableCell>
            <TableCell className="tabular text-right">{m.operationsCount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
