"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clientEnv } from "@/lib/env";
import type { AuthActionResult } from "@/lib/auth/types";
import { isNextRedirectError } from "@/lib/auth/next-redirect";

import { AuthLink } from "./auth-shell";
import { SubmitButton } from "@/components/shared/submit-button";

const loginSchema = z.object({
  email: z.string().email("Bitte eine gültige E-Mail eingeben"),
  password: z.string().min(1, "Passwort ist erforderlich"),
});

type LoginValues = z.infer<typeof loginSchema>;

type LoginFormProps = {
  loginAction: (formData: FormData) => Promise<AuthActionResult>;
  googleSignInAction?: () => Promise<void>;
  nextPath?: string;
};

export function LoginForm({ loginAction, googleSignInAction, nextPath }: LoginFormProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const googleEnabled = clientEnv.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED;

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(values: LoginValues) {
    setErrorMessage(null);
    const formData = new FormData();
    formData.set("email", values.email);
    formData.set("password", values.password);
    if (nextPath) {
      formData.set("next", nextPath);
    }

    startTransition(async () => {
      try {
        const result = await loginAction(formData);
        if (!result.ok) {
          setErrorMessage(result.message);
          return;
        }
        if (result.redirectTo) {
          router.refresh();
          router.push(result.redirectTo);
        }
      } catch (error) {
        if (isNextRedirectError(error)) {
          throw error;
        }
        setErrorMessage("Etwas ist schiefgelaufen. Bitte erneut versuchen.");
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="salon-auth-form space-y-[var(--space-4)]">
      <div className="space-y-[var(--space-2)]">
        <Label htmlFor="email">E-Mail</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          className="salon-auth-input"
          {...form.register("email")}
        />
        {form.formState.errors.email ? (
          <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
        ) : null}
      </div>

      <div className="space-y-[var(--space-2)]">
        <div className="flex items-center justify-between gap-[var(--space-2)]">
          <Label htmlFor="password">Passwort</Label>
          <AuthLink href="/forgot-password">Passwort vergessen?</AuthLink>
        </div>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          className="salon-auth-input"
          {...form.register("password")}
        />
        {form.formState.errors.password ? (
          <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
        ) : null}
      </div>

      {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

      <SubmitButton pending={isPending} className="salon-auth-submit">
        Anmelden
      </SubmitButton>

      {googleEnabled && googleSignInAction ? (
        <Button
          type="button"
          variant="outline"
          className="salon-auth-secondary w-full"
          disabled={isPending}
          onClick={() => startTransition(async () => googleSignInAction())}
        >
          Mit Google fortfahren
        </Button>
      ) : null}
    </form>
  );
}
