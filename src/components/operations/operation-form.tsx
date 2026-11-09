"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input, NativeSelect, Textarea } from "@/components/ui/input";
import { FormField, fieldAria } from "@/components/shared/form-field";
import {
  COUNTERPARTY_LABELS,
  FUNDS_SOURCES,
  FUNDS_SOURCE_LABELS,
  MEMBER_ROLE_LABELS,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  operationBasePath,
  type OperationTypeValue,
} from "@/lib/constants";
import { formatDate } from "@/lib/dates";
import { operationFormSchema, type OperationFormValues } from "@/lib/validations/operation";
import { createOperationAction, updateOperationAction } from "@/server/actions/operations";

type Option = { id: string; name: string; disabled?: boolean };

type OperationFormProps = {
  type: OperationTypeValue;
  operationId?: string;
  defaultValues: OperationFormValues;
  categories: Option[];
  members: Option[];
  canChooseMember: boolean;
  lockedUntil: string | null;
  /** Catégorie présélectionnée quand on coche « cotisation » (active et proposée), sinon null. */
  defaultContributionCategoryId?: string | null;
};

export function OperationForm({
  type,
  operationId,
  defaultValues,
  categories,
  members,
  canChooseMember,
  lockedUntil,
  defaultContributionCategoryId = null,
}: OperationFormProps) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const form = useForm<OperationFormValues>({
    resolver: zodResolver(operationFormSchema),
    defaultValues,
  });
  const { errors } = form.formState;
  const isExpense = type === "EXPENSE";
  const isContribution = !isExpense && form.watch("isContribution");
  // Le lien « Annuler » ramène à la rubrique d'origine (avant modification de la case).
  const cancelBase = operationBasePath({ type, isContribution: defaultValues.isContribution });

  const contributionToggle = form.register("isContribution");
  const onContributionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    void contributionToggle.onChange(event);
    if (event.target.checked && !form.getValues("categoryId") && defaultContributionCategoryId) {
      form.setValue("categoryId", defaultContributionCategoryId, { shouldValidate: true });
    }
  };

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = operationId
        ? await updateOperationAction(operationId, values)
        : await createOperationAction(type, values);
      if (!result.ok) {
        toast.error(result.error);
        for (const [field, messages] of Object.entries(result.fieldErrors ?? {})) {
          if (messages?.[0]) form.setError(field as keyof OperationFormValues, { message: messages[0] });
        }
        return;
      }
      toast.success(result.message ?? "Enregistré.");
      // Après enregistrement, on rejoint la rubrique correspondant à la case cochée.
      const target = operationBasePath({ type, isContribution: values.isContribution });
      router.push(operationId ? `${target}/${operationId}` : target);
    });
  });

  const err = (name: keyof OperationFormValues) => errors[name]?.message;

  return (
    <form onSubmit={onSubmit} noValidate>
      <Card>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          {lockedUntil && (
            <p className="flex items-start gap-2 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground sm:col-span-2">
              <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
              Les comptes sont clôturés jusqu&apos;au {formatDate(lockedUntil)} : la date doit être postérieure.
            </p>
          )}

          {!isExpense && (
            <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border bg-card p-3 text-sm transition-colors has-[:checked]:border-primary has-[:checked]:bg-secondary has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring sm:col-span-2">
              <input
                type="checkbox"
                className="mt-0.5 size-4 accent-[var(--primary)]"
                {...contributionToggle}
                onChange={onContributionChange}
              />
              <span>
                <span className="font-medium">C&apos;est une cotisation d&apos;un membre</span>
                <span className="block text-xs text-muted-foreground">
                  Reste comptée dans les revenus, mais apparaît dans la rubrique « Cotisations ». Décochez pour un
                  revenu ordinaire (vente, prestation…).
                </span>
              </span>
            </label>
          )}

          <FormField
            id="title"
            label="Titre"
            required={!isContribution}
            error={err("title")}
            hint={isContribution ? "Facultatif : laissé vide, il est généré (ex. « Cotisation nov. 2026 — Nom »)." : undefined}
            className="sm:col-span-2"
          >
            <Input
              {...fieldAria("title", err("title"), isContribution ? "hint" : undefined)}
              placeholder={
                isExpense ? "Ex. Achat de semences de blé" : isContribution ? "Généré automatiquement" : "Ex. Vente de 2 tonnes d'olives"
              }
              {...form.register("title")}
            />
          </FormField>

          <FormField id="amount" label="Montant (MAD)" required error={err("amount")}>
            <Input
              {...fieldAria("amount", err("amount"))}
              inputMode="decimal"
              placeholder="0,00"
              className="tabular"
              {...form.register("amount")}
            />
          </FormField>

          <FormField id="date" label={isExpense ? "Date de la dépense" : isContribution ? "Date de la cotisation" : "Date d'encaissement"} required error={err("date")}>
            <Input {...fieldAria("date", err("date"))} type="date" {...form.register("date")} />
          </FormField>

          <FormField id="categoryId" label="Catégorie" required error={err("categoryId")}>
            <NativeSelect {...fieldAria("categoryId", err("categoryId"))} {...form.register("categoryId")}>
              <option value="">Choisir une catégorie…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id} disabled={c.disabled}>
                  {c.name}
                  {c.disabled ? " (inactive)" : ""}
                </option>
              ))}
            </NativeSelect>
          </FormField>

          <FormField
            id="memberId"
            label={isContribution ? "Cotisant" : MEMBER_ROLE_LABELS[type]}
            required
            error={err("memberId")}
            hint={canChooseMember ? undefined : "Vous ne pouvez enregistrer que vos propres opérations."}
          >
            <NativeSelect
              {...fieldAria("memberId", err("memberId"), canChooseMember ? undefined : "hint")}
              disabled={!canChooseMember}
              {...form.register("memberId")}
            >
              {canChooseMember && <option value="">Choisir un membre…</option>}
              {members.map((m) => (
                <option key={m.id} value={m.id} disabled={m.disabled}>
                  {m.name}
                </option>
              ))}
            </NativeSelect>
          </FormField>

          <fieldset className="grid gap-2 sm:col-span-2">
            <legend className="mb-1 text-sm font-medium">
              {isExpense ? "Avec quel argent ?" : "Où est l'argent ?"}
              <span className="text-destructive" aria-hidden>
                *
              </span>
            </legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {FUNDS_SOURCES.map((source) => (
                <label
                  key={source}
                  className="flex cursor-pointer items-start gap-2.5 rounded-lg border bg-card p-3 text-sm transition-colors has-[:checked]:border-primary has-[:checked]:bg-secondary has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring"
                >
                  <input type="radio" value={source} className="mt-0.5 accent-[var(--primary)]" {...form.register("fundsSource")} />
                  <span>{FUNDS_SOURCE_LABELS[type][source]}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {isExpense
                ? "Une avance personnelle est suivie dans le résumé par membre (montant brut, hors remboursements)."
                : "Un montant conservé par le membre reste un revenu de la ferme ; il est suivi dans le résumé par membre."}
            </p>
          </fieldset>

          {!isContribution && (
            <FormField id="counterparty" label={COUNTERPARTY_LABELS[type]} error={err("counterparty")}>
              <Input {...fieldAria("counterparty", err("counterparty"))} {...form.register("counterparty")} />
            </FormField>
          )}

          <FormField id="paymentMethod" label={isExpense ? "Mode de paiement" : "Mode d'encaissement"} error={err("paymentMethod")}>
            <NativeSelect {...fieldAria("paymentMethod", err("paymentMethod"))} {...form.register("paymentMethod")}>
              <option value="">Non précisé</option>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {PAYMENT_METHOD_LABELS[m]}
                </option>
              ))}
            </NativeSelect>
          </FormField>

          {!isContribution && (
            <FormField
              id="reference"
              label={isExpense ? "Référence de facture" : "Référence de transaction"}
              error={err("reference")}
            >
              <Input {...fieldAria("reference", err("reference"))} {...form.register("reference")} />
            </FormField>
          )}

          <FormField
            id="description"
            label={isContribution ? "Note" : "Description"}
            error={err("description")}
            className="sm:col-span-2"
          >
            <Textarea {...fieldAria("description", err("description"))} rows={3} {...form.register("description")} />
          </FormField>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button variant="outline" asChild>
            <Link href={operationId ? `${cancelBase}/${operationId}` : cancelBase}>Annuler</Link>
          </Button>
          <Button type="submit" disabled={pending}>
            {pending && <LoaderCircle className="animate-spin" />}
            {operationId ? "Enregistrer les modifications" : "Enregistrer"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
