"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { SubmitButton } from "@/components/shared/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLink } from "@/features/auth";
import type { AuthActionResult } from "@/lib/auth/types";

const loginSchema = z.object({
  email: z.string().email("Gültige E-Mail eingeben"),
  password: z.string().min(1, "Passwort erforderlich"),
});

type LoginValues = z.infer<typeof loginSchema>;

type PlatformAdminLoginFormProps = {
  loginAction: (formData: FormData) => Promise<AuthActionResult>;
};

export function PlatformAdminLoginForm({ loginAction }: PlatformAdminLoginFormProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(values: LoginValues) {
    setErrorMessage(null);
    const formData = new FormData();
    formData.set("email", values.email);
    formData.set("password", values.password);

    startTransition(async () => {
      try {
        const result = await loginAction(formData);
        if (!result.ok) {
          setErrorMessage(result.message);
          return;
        }
        router.push(result.redirectTo ?? "/admin");
        router.refresh();
      } catch {
        setErrorMessage("Etwas ist schiefgelaufen. Bitte erneut versuchen.");
      }
    });
  }

  return (
    <div className="platform-admin-root flex min-h-full flex-1 flex-col">
      <main className="platform-admin-shell mx-auto flex min-h-full w-full max-w-[420px] flex-1 flex-col justify-center px-[var(--space-4)] py-[var(--space-8)]">
        <div className="platform-admin-login-card platform-admin-rise-in">
          <header className="mb-[var(--space-8)] space-y-[var(--space-3)] text-center">
            <p className="platform-admin-hero-kicker text-xs">Glanzo</p>
            <h1 className="platform-admin-hero-title font-display text-3xl">Platform</h1>
            <p className="text-sm text-[var(--text-2)]">Nur für Plattform-Administratoren.</p>
          </header>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-[var(--space-4)]">
            <div className="space-y-[var(--space-2)]">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                className="border-[color-mix(in_oklch,var(--brass)_12%,var(--ink-3))] bg-[var(--ink-0)]/50"
                {...form.register("email")}
              />
              {form.formState.errors.email ? (
                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
              ) : null}
            </div>

            <div className="space-y-[var(--space-2)]">
              <Label htmlFor="password">Passwort</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                className="border-[color-mix(in_oklch,var(--brass)_12%,var(--ink-3))] bg-[var(--ink-0)]/50"
                {...form.register("password")}
              />
              {form.formState.errors.password ? (
                <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
              ) : null}
            </div>

            {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

            <SubmitButton pending={isPending} className="w-full">
              Anmelden
            </SubmitButton>
          </form>

          <footer className="mt-[var(--space-8)] text-center text-sm text-[var(--text-2)]">
            Salon-Dashboard? <AuthLink href="/login">Zum Shop-Login</AuthLink>
          </footer>
        </div>
      </main>
    </div>
  );
}
