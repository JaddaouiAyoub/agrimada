"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormField, fieldAria } from "@/components/shared/form-field";
import { PASSWORD_MIN_LENGTH } from "@/lib/constants";
import {
  changePasswordSchema,
  profileSchema,
  type ChangePasswordValues,
  type ProfileValues,
} from "@/lib/validations/auth";
import { changePasswordAction, updateProfileAction } from "@/server/actions/account";

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const form = useForm<ProfileValues>({ resolver: zodResolver(profileSchema), defaultValues: { name } });
  const { errors, isDirty } = form.formState;

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await updateProfileAction(values);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message ?? "Profil mis à jour.");
      form.reset(values);
      router.refresh();
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
          <CardDescription>L&apos;adresse email et le rôle sont gérés par l&apos;administrateur.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <FormField id="p-name" label="Nom complet" required error={errors.name?.message}>
            <Input {...fieldAria("p-name", errors.name?.message)} autoComplete="name" {...form.register("name")} />
          </FormField>
          <FormField id="p-email" label="Adresse email">
            <Input id="p-email" value={email} readOnly disabled />
          </FormField>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" disabled={pending || !isDirty}>
            {pending && <LoaderCircle className="animate-spin" />}
            Enregistrer
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

export function ChangePasswordForm({ email }: { email: string }) {
  const [pending, startTransition] = React.useTransition();
  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirm: "" },
  });
  const { errors } = form.formState;

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      // En cas de succès, l'action déconnecte et redirige vers la page de connexion.
      const result = await changePasswordAction(values);
      if (result && !result.ok) {
        toast.error(result.error);
        form.setValue("currentPassword", "");
      }
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <input type="email" name="username" autoComplete="username" value={email} readOnly hidden />
      <Card>
        <CardHeader>
          <CardTitle>Mot de passe</CardTitle>
          <CardDescription>
            Après le changement, toutes vos sessions sont fermées et vous devrez vous reconnecter.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-3">
          <FormField id="currentPassword" label="Mot de passe actuel" required error={errors.currentPassword?.message}>
            <Input
              {...fieldAria("currentPassword", errors.currentPassword?.message)}
              type="password"
              autoComplete="current-password"
              {...form.register("currentPassword")}
            />
          </FormField>
          <FormField
            id="newPassword"
            label="Nouveau mot de passe"
            required
            hint={`${PASSWORD_MIN_LENGTH} caractères minimum`}
            error={errors.newPassword?.message}
          >
            <Input
              {...fieldAria("newPassword", errors.newPassword?.message, "hint")}
              type="password"
              autoComplete="new-password"
              {...form.register("newPassword")}
            />
          </FormField>
          <FormField id="confirm" label="Confirmation" required error={errors.confirm?.message}>
            <Input
              {...fieldAria("confirm", errors.confirm?.message)}
              type="password"
              autoComplete="new-password"
              {...form.register("confirm")}
            />
          </FormField>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" disabled={pending}>
            {pending && <LoaderCircle className="animate-spin" />}
            Changer le mot de passe
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
