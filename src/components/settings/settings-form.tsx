"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HandCoins, LoaderCircle, Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, NativeSelect, Textarea } from "@/components/ui/input";
import { FormField, fieldAria } from "@/components/shared/form-field";
import { DATE_FORMATS, DATE_FORMAT_LABELS, TIMEZONES } from "@/lib/constants";
import { settingsSchema, type SettingsValues } from "@/lib/validations/settings";
import { updateSettingsAction } from "@/server/actions/settings";

type CategoryOption = { id: string; name: string; isActive: boolean };

export function SettingsForm({
  defaultValues,
  revenueCategories,
}: {
  defaultValues: SettingsValues;
  revenueCategories: CategoryOption[];
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const form = useForm<SettingsValues>({ resolver: zodResolver(settingsSchema), defaultValues });
  const { errors, isDirty } = form.formState;
  const timezones = TIMEZONES.includes(defaultValues.timezone as (typeof TIMEZONES)[number])
    ? TIMEZONES
    : [defaultValues.timezone, ...TIMEZONES];

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await updateSettingsAction(values);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message ?? "Paramètres enregistrés.");
      form.reset(values);
      router.refresh();
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>La ferme</CardTitle>
          <CardDescription>Informations générales affichées dans l&apos;application.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <FormField id="farmName" label="Nom de la ferme" required error={errors.farmName?.message}>
            <Input {...fieldAria("farmName", errors.farmName?.message)} {...form.register("farmName")} />
          </FormField>
          <FormField id="currency" label="Devise" hint="Devise unique de la ferme (multi-devises non activé).">
            <Input id="currency" value="MAD — Dirham marocain" readOnly disabled aria-describedby="currency-hint" />
          </FormField>
          <FormField id="description" label="Description" error={errors.description?.message} className="sm:col-span-2">
            <Textarea {...fieldAria("description", errors.description?.message)} rows={3} {...form.register("description")} />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Affichage</CardTitle>
          <CardDescription>Préférences communes à tous les membres.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <FormField
            id="timezone"
            label="Fuseau horaire"
            required
            error={errors.timezone?.message}
            hint="Détermine « aujourd'hui », « ce mois »… et l'affichage des horodatages."
          >
            <NativeSelect {...fieldAria("timezone", errors.timezone?.message, "hint")} {...form.register("timezone")}>
              {timezones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </NativeSelect>
          </FormField>
          <FormField id="dateFormat" label="Format des dates" required>
            <NativeSelect id="dateFormat" {...form.register("dateFormat")}>
              {DATE_FORMATS.map((f) => (
                <option key={f} value={f}>
                  {DATE_FORMAT_LABELS[f]}
                </option>
              ))}
            </NativeSelect>
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HandCoins className="size-4 text-muted-foreground" aria-hidden /> Cotisations
          </CardTitle>
          <CardDescription>
            Catégorie présélectionnée lors de la saisie d&apos;une cotisation. Elle reste modifiable à chaque saisie.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          <FormField
            id="defaultContributionCategoryId"
            label="Catégorie par défaut des cotisations"
            error={errors.defaultContributionCategoryId?.message}
            className="sm:max-w-md"
          >
            <NativeSelect
              {...fieldAria("defaultContributionCategoryId", errors.defaultContributionCategoryId?.message)}
              {...form.register("defaultContributionCategoryId")}
            >
              <option value="">Aucune (à choisir à chaque saisie)</option>
              {revenueCategories
                .filter((c) => c.isActive || c.id === defaultValues.defaultContributionCategoryId)
                .map((c) => (
                  <option key={c.id} value={c.id} disabled={!c.isActive}>
                    {c.name}
                    {c.isActive ? "" : " (inactive)"}
                  </option>
                ))}
            </NativeSelect>
          </FormField>
          <FormField
            id="advanceContributionCategoryId"
            label="Catégorie des cotisations issues d'achats personnels"
            error={errors.advanceContributionCategoryId?.message}
            hint="Utilisée quand un membre paie une dépense avec son propre argent et la compte comme cotisation. Si vide, la catégorie par défaut ci-dessus est utilisée."
            className="sm:max-w-md"
          >
            <NativeSelect
              {...fieldAria("advanceContributionCategoryId", errors.advanceContributionCategoryId?.message, "hint")}
              {...form.register("advanceContributionCategoryId")}
            >
              <option value="">Même que la catégorie par défaut</option>
              {revenueCategories
                .filter((c) => c.isActive || c.id === defaultValues.advanceContributionCategoryId)
                .map((c) => (
                  <option key={c.id} value={c.id} disabled={!c.isActive}>
                    {c.name}
                    {c.isActive ? "" : " (inactive)"}
                  </option>
                ))}
            </NativeSelect>
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="size-4 text-muted-foreground" aria-hidden /> Clôture des comptes
          </CardTitle>
          <CardDescription>
            Aucune opération datée jusqu&apos;à cette date incluse ne pourra être créée, modifiée ou supprimée — y
            compris par un administrateur, tant que la date n&apos;est pas modifiée ici. Laisser vide pour ne rien
            verrouiller.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormField id="lockedUntil" label="Comptes clôturés jusqu'au" error={errors.lockedUntil?.message} className="sm:max-w-xs">
            <Input {...fieldAria("lockedUntil", errors.lockedUntil?.message)} type="date" {...form.register("lockedUntil")} />
          </FormField>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" disabled={pending || !isDirty}>
            {pending && <LoaderCircle className="animate-spin" />}
            Enregistrer les paramètres
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
