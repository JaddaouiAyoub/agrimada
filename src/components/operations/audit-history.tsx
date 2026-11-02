import { formatDateTime } from "@/lib/dates";
import { describeAuditAction, describeChanges } from "@/lib/audit-labels";
import type { AuditRow } from "@/server/queries/admin";

export function AuditHistory({
  entries,
  names,
  timezone,
}: {
  entries: AuditRow[];
  names: Record<string, string>;
  timezone: string;
}) {
  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">Aucun historique disponible.</p>;
  }
  return (
    <ol className="relative space-y-4 border-l pl-4">
      {entries.map((entry) => {
        const changes = describeChanges(entry.metadata, names);
        return (
          <li key={entry.id} className="relative">
            <span className="absolute top-1.5 -left-[21px] size-2.5 rounded-full border-2 border-card bg-primary" aria-hidden />
            <p className="text-sm font-medium">{describeAuditAction(entry.action)}</p>
            <p className="text-xs text-muted-foreground">
              {entry.actor?.name ?? "Système"} · {formatDateTime(entry.createdAt, timezone)}
            </p>
            {changes.length > 0 && (
              <ul className="mt-1.5 space-y-0.5 text-xs text-muted-foreground">
                {changes.map((c) => (
                  <li key={c.field}>
                    <span className="font-medium text-foreground">{c.field}</span> : {c.before} → {c.after}
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ol>
  );
}
