"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, fieldAria } from "@/components/shared/form-field";
import { loginSchema, type LoginValues } from "@/lib/validations/auth";
import { loginAction } from "@/server/actions/auth";

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [error, setError] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const { errors } = form.formState;

  const onSubmit = form.handleSubmit((values) => {
    setError(null);
    startTransition(async () => {
      const result = await loginAction(values, callbackUrl);
      // En cas de succès, l'action redirige : on n'arrive ici qu'en cas d'échec.
      if (!result.ok) {
        setError(result.error);
        form.setValue("password", "");
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {error && (
        <p role="alert" className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      <FormField id="email" label="Adresse email" error={errors.email?.message}>
        <Input
          {...fieldAria("email", errors.email?.message)}
          type="email"
          autoComplete="email"
          autoFocus
          {...form.register("email")}
        />
      </FormField>
      <FormField id="password" label="Mot de passe" error={errors.password?.message}>
        <Input
          {...fieldAria("password", errors.password?.message)}
          type="password"
          autoComplete="current-password"
          {...form.register("password")}
        />
      </FormField>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending && <LoaderCircle className="animate-spin" />}
        Se connecter
      </Button>
      <p className="text-center text-sm">
        <Link href="/forgot-password" className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
          Mot de passe oublié ?
        </Link>
      </p>
    </form>
  );
}
