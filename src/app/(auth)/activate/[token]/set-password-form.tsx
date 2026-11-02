"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, fieldAria } from "@/components/shared/form-field";
import { PASSWORD_MIN_LENGTH } from "@/lib/constants";
import { setPasswordSchema, type SetPasswordValues } from "@/lib/validations/auth";
import { setPasswordAction } from "@/server/actions/auth";

export function SetPasswordForm({ token, email }: { token: string; email: string }) {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();
  const form = useForm<SetPasswordValues>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: { token, password: "", confirm: "" },
  });
  const { errors } = form.formState;

  const onSubmit = form.handleSubmit((values) => {
    setError(null);
    startTransition(async () => {
      const result = await setPasswordAction(values);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/login?activated=1");
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {/* Aide les gestionnaires de mots de passe à associer le compte. */}
      <input type="email" name="username" autoComplete="username" value={email} readOnly hidden />
      {error && (
        <p role="alert" className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      <FormField
        id="password"
        label="Mot de passe"
        required
        hint={`Au moins ${PASSWORD_MIN_LENGTH} caractères. Une phrase de passe est idéale.`}
        error={errors.password?.message}
      >
        <Input
          {...fieldAria("password", errors.password?.message, "hint")}
          type="password"
          autoComplete="new-password"
          {...form.register("password")}
        />
      </FormField>
      <FormField id="confirm" label="Confirmer le mot de passe" required error={errors.confirm?.message}>
        <Input
          {...fieldAria("confirm", errors.confirm?.message)}
          type="password"
          autoComplete="new-password"
          {...form.register("confirm")}
        />
      </FormField>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending && <LoaderCircle className="animate-spin" />}
        Enregistrer le mot de passe
      </Button>
    </form>
  );
}
