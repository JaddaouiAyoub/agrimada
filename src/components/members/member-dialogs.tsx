"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Copy, LoaderCircle, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input, NativeSelect } from "@/components/ui/input";
import { FormField, fieldAria } from "@/components/shared/form-field";
import { ROLES, ROLE_LABELS } from "@/lib/constants";
import {
  memberCreateSchema,
  memberUpdateSchema,
  type MemberCreateValues,
  type MemberUpdateValues,
} from "@/lib/validations/member";
import { createMemberAction, updateMemberAction } from "@/server/actions/members";

/** Affiche une seule fois le lien d'activation à transmettre au membre. */
export function AccessLinkDialog({
  url,
  onClose,
  title = "Lien d'activation",
}: {
  url: string | null;
  onClose: () => void;
  title?: string;
}) {
  const [copied, setCopied] = React.useState(false);
  const copy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Copie impossible : sélectionnez le lien manuellement.");
    }
  };
  return (
    <Dialog open={url !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Transmettez ce lien au membre par un canal privé. Il est utilisable une seule fois et ne sera plus affiché
            après fermeture de cette fenêtre.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2">
          <Input readOnly value={url ?? ""} onFocus={(e) => e.currentTarget.select()} aria-label="Lien à transmettre" />
          <Button type="button" variant="outline" size="icon" onClick={copy} aria-label="Copier le lien">
            {copied ? <Check /> : <Copy />}
          </Button>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>J&apos;ai transmis le lien</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CreateMemberButton() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [link, setLink] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();
  const form = useForm<MemberCreateValues>({
    resolver: zodResolver(memberCreateSchema),
    defaultValues: { name: "", email: "", role: "MEMBER", initialStatus: "PENDING" },
  });
  const { errors } = form.formState;

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await createMemberAction(values);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message ?? "Membre créé.");
      setOpen(false);
      form.reset();
      setLink(result.data?.activationUrl ?? null);
      router.refresh();
    });
  });

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <UserPlus /> Ajouter un membre
      </Button>
      <Dialog open={open} onOpenChange={(o) => !pending && setOpen(o)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un membre</DialogTitle>
            <DialogDescription>
              Le compte est créé sans mot de passe. Un lien d&apos;activation à usage unique (valable 72 h) vous sera
              affiché pour le transmettre au membre.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="grid gap-4" noValidate>
            <FormField id="m-name" label="Nom complet" required error={errors.name?.message}>
              <Input {...fieldAria("m-name", errors.name?.message)} autoComplete="off" {...form.register("name")} />
            </FormField>
            <FormField id="m-email" label="Adresse email" required error={errors.email?.message}>
              <Input {...fieldAria("m-email", errors.email?.message)} type="email" autoComplete="off" {...form.register("email")} />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField id="m-role" label="Rôle" required>
                <NativeSelect id="m-role" {...form.register("role")}>
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </option>
                  ))}
                </NativeSelect>
              </FormField>
              <FormField id="m-status" label="Statut initial" required>
                <NativeSelect id="m-status" {...form.register("initialStatus")}>
                  <option value="PENDING">À activer (lien généré)</option>
                  <option value="DISABLED">Désactivé</option>
                </NativeSelect>
              </FormField>
            </div>
            <p className="text-xs text-muted-foreground">
              Méthode d&apos;activation : lien à transmettre manuellement (aucun service d&apos;email configuré).
            </p>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
                Annuler
              </Button>
              <Button type="submit" disabled={pending}>
                {pending && <LoaderCircle className="animate-spin" />}
                Créer le compte
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <AccessLinkDialog url={link} onClose={() => setLink(null)} />
    </>
  );
}

export function EditMemberDialog({
  member,
  isSelf,
  open,
  onOpenChange,
}: {
  member: MemberUpdateValues;
  isSelf: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const form = useForm<MemberUpdateValues>({
    resolver: zodResolver(memberUpdateSchema),
    defaultValues: member,
  });
  const { errors } = form.formState;

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await updateMemberAction(values);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message ?? "Membre mis à jour.");
      onOpenChange(false);
      router.refresh();
    });
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !pending && onOpenChange(o)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier le membre</DialogTitle>
          <DialogDescription>
            Un changement d&apos;email ou de rôle déconnecte le membre de toutes ses sessions.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4" noValidate>
          <FormField id="e-name" label="Nom complet" required error={errors.name?.message}>
            <Input {...fieldAria("e-name", errors.name?.message)} {...form.register("name")} />
          </FormField>
          <FormField id="e-email" label="Adresse email" required error={errors.email?.message}>
            <Input {...fieldAria("e-email", errors.email?.message)} type="email" {...form.register("email")} />
          </FormField>
          <FormField
            id="e-role"
            label="Rôle"
            required
            hint={isSelf ? "Vous ne pouvez pas modifier votre propre rôle." : undefined}
          >
            <NativeSelect id="e-role" disabled={isSelf} {...form.register("role")}>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </NativeSelect>
          </FormField>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
              Annuler
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <LoaderCircle className="animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
