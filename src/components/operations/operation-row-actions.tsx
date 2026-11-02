"use client";

import * as React from "react";
import Link from "next/link";
import { Ellipsis, Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmAction } from "@/components/shared/confirm-action";
import { OPERATION_TYPE_PATHS, type OperationTypeValue } from "@/lib/constants";
import { deleteOperationAction } from "@/server/actions/operations";

type Props = {
  id: string;
  type: OperationTypeValue;
  title: string;
  canEdit: boolean;
  /** Après suppression depuis la fiche, retour à la liste. */
  redirectAfterDelete?: boolean;
  variant?: "menu" | "buttons";
};

export function OperationRowActions({ id, type, title, canEdit, redirectAfterDelete, variant = "menu" }: Props) {
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const base = `${OPERATION_TYPE_PATHS[type]}/${id}`;
  const label = type === "EXPENSE" ? "cette dépense" : "ce revenu";

  const confirm = (
    <ConfirmAction
      open={confirmOpen}
      onOpenChange={setConfirmOpen}
      title={type === "EXPENSE" ? "Supprimer la dépense ?" : "Supprimer le revenu ?"}
      description={
        <>
          « {title} » sera retiré{type === "EXPENSE" ? "e" : ""} des listes et des calculs. La suppression est tracée dans
          le journal d&apos;activité.
        </>
      }
      confirmLabel="Supprimer"
      destructive
      action={() => deleteOperationAction(id)}
      redirectTo={redirectAfterDelete ? OPERATION_TYPE_PATHS[type] : undefined}
    />
  );

  if (variant === "buttons") {
    return (
      <div className="flex flex-wrap gap-2">
        {canEdit && (
          <>
            <Button variant="outline" asChild>
              <Link href={`${base}/edit`}>
                <Pencil /> Modifier
              </Link>
            </Button>
            <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setConfirmOpen(true)}>
              <Trash2 /> Supprimer
            </Button>
          </>
        )}
        {confirm}
      </div>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`Actions pour ${label}`}>
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={base}>
              <Eye /> Voir le détail
            </Link>
          </DropdownMenuItem>
          {canEdit && (
            <>
              <DropdownMenuItem asChild>
                <Link href={`${base}/edit`}>
                  <Pencil /> Modifier
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={() => setConfirmOpen(true)}>
                <Trash2 /> Supprimer
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {confirm}
    </>
  );
}
