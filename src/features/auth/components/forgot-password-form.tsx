"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { SubmitButton } from "@/components/shared/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuthActionResult } from "@/lib/auth/types";

const forgotSchema = z.object({
  email: z.string().email("Bitte eine gültige E-Mail eingeben"),
});

type ForgotValues = z.infer<typeof forgotSchema>;

type ForgotPasswordFormProps = {
  resetAction: (formData: FormData) => Promise<AuthActionResult>;
};

export function ForgotPasswordForm({ resetAction }: ForgotPasswordFormProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  function onSubmit(values: ForgotValues) {
    setMessage(null);
    setErrorMessage(null);
    const formData = new FormData();
    formData.set("email", values.email);

    startTransition(async () => {
      const result = await resetAction(formData);
      if (result.ok) {
        setMessage("Falls diese E-Mail registriert ist, senden wir dir einen Reset-Link.");
      } else {
        setErrorMessage(result.message);
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="salon-auth-form space-y-[var(--space-4)]">
      <div className="space-y-[var(--space-2)]">
        <Label htmlFor="email">E-Mail</Label>
        <Input id="email" type="email" autoComplete="email" className="salon-auth-input" {...form.register("email")} />
        {form.formState.errors.email ? (
          <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
        ) : null}
      </div>

      {message ? <p className="text-sm text-[var(--signal-ok)]">{message}</p> : null}
      {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

      <SubmitButton pending={isPending} className="salon-auth-submit">
        Reset-Link senden
      </SubmitButton>
    </form>
  );
}
