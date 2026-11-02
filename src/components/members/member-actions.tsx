"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Ban, Ellipsis, KeyRound, Link2, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmAction } from "@/components/shared/confirm-action";
import { AccessLinkDialog, EditMemberDialog } from "@/components/members/member-dialogs";
import type { RoleValue, UserStatusValue } from "@/lib/constants";
import {
  createAccessLinkAction,
  deleteMemberAction,
  setMemberActiveAction,
} from "@/server/actions/members";

type Props = {
  member: {
    id: string;
    name: string;
    email: string;
    role: RoleValue;
    status: UserStatusValue;
    neverActivated: boolean;
    deletable: boolean;
  };
  isSelf: boolean;
};

export function MemberActions({ member, isSelf }: Props) {
  const router = useRouter();
  const [dialog, setDialog] = React.useState<"edit" | "disable" | "enable" | "delete" | null>(null);
  const [link, setLink] = React.useState<string | null>(null);
  const [, startTransition] = React.useTransition();

  const generateLink = () =>
    startTransition(async () => {
      const result = await createAccessLinkAction(member.id);
      if (!result.ok || !result.data) {
        toast.error(result.ok ? "Lien indisponible." : result.error);
        return;
      }
      setLink(result.data.url);
      router.refresh();
    });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`Actions pour ${member.name}`}>
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setDialog("edit")}>
            <Pencil /> Modifier
          </DropdownMenuItem>
          {member.status !== "DISABLED" && (
            <DropdownMenuItem onSelect={generateLink}>
              {member.neverActivated ? <Link2 /> : <KeyRound />}
              {member.neverActivated ? "Générer un lien d'activation" : "Lien de réinitialisation du mot de passe"}
            </DropdownMenuItem>
          )}
          {!isSelf && (
            <>
              <DropdownMenuSeparator />
              {member.status === "DISABLED" ? (
                <DropdownMenuItem onSelect={() => setDialog("enable")}>
                  <RotateCcw /> Réactiver
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem variant="destructive" onSelect={() => setDialog("disable")}>
                  <Ban /> Désactiver
                </DropdownMenuItem>
              )}
              {member.deletable && (
                <DropdownMenuItem variant="destructive" onSelect={() => setDialog("delete")}>
                  <Trash2 /> Supprimer le compte
                </DropdownMenuItem>
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {dialog === "edit" && (
        <EditMemberDialog
          open
          onOpenChange={(o) => !o && setDialog(null)}
          isSelf={isSelf}
          member={{ id: member.id, name: member.name, email: member.email, role: member.role }}
        />
      )}
      <ConfirmAction
        open={dialog === "disable"}
        onOpenChange={(o) => !o && setDialog(null)}
        title={`Désactiver ${member.name} ?`}
        description="Le membre ne pourra plus se connecter et ses sessions en cours seront révoquées. Son historique financier est conservé. Vous pourrez le réactiver."
        confirmLabel="Désactiver"
        destructive
        action={() => setMemberActiveAction(member.id, false)}
      />
      <ConfirmAction
        open={dialog === "enable"}
        onOpenChange={(o) => !o && setDialog(null)}
        title={`Réactiver ${member.name} ?`}
        description={
          member.neverActivated
            ? "Le compte repassera « en attente » : générez ensuite un lien d'activation."
            : "Le membre pourra de nouveau se connecter avec son mot de passe."
        }
        confirmLabel="Réactiver"
        action={() => setMemberActiveAction(member.id, true)}
      />
      <ConfirmAction
        open={dialog === "delete"}
        onOpenChange={(o) => !o && setDialog(null)}
        title={`Supprimer le compte de ${member.name} ?`}
        description="Ce compte n'a jamais été activé et n'a aucun historique : il sera supprimé définitivement."
        confirmLabel="Supprimer"
        destructive
        action={() => deleteMemberAction(member.id)}
      />
      <AccessLinkDialog
        url={link}
        onClose={() => setLink(null)}
        title={member.neverActivated ? "Lien d'activation" : "Lien de réinitialisation (24 h)"}
      />
    </>
  );
}
