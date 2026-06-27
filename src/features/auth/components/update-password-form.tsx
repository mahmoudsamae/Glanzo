"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { SubmitButton } from "@/components/shared/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuthActionResult } from "@/lib/auth/types";
import { isNextRedirectError } from "@/lib/auth/next-redirect";

const updateSchema = z.object({
  password: z.string().min(8, "Mindestens 8 Zeichen"),
});

type UpdateValues = z.infer<typeof updateSchema>;

type UpdatePasswordFormProps = {
  updateAction: (formData: FormData) => Promise<AuthActionResult>;
};

export function UpdatePasswordForm({ updateAction }: UpdatePasswordFormProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<UpdateValues>({
    resolver: zodResolver(updateSchema),
    defaultValues: { password: "" },
  });

  function onSubmit(values: UpdateValues) {
    setErrorMessage(null);
    const formData = new FormData();
    formData.set("password", values.password);

    startTransition(async () => {
      try {
        const result = await updateAction(formData);
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
        <Label htmlFor="password">Neues Passwort</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          className="salon-auth-input"
          {...form.register("password")}
        />
        {form.formState.errors.password ? (
          <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
        ) : null}
      </div>

      {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

      <SubmitButton pending={isPending} className="salon-auth-submit">
        Passwort aktualisieren
      </SubmitButton>
    </form>
  );
}
