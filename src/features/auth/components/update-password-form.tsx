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

const updateSchema = z.object({
  password: z.string().min(8, "At least 8 characters"),
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
          router.push(result.redirectTo);
        }
      } catch {
        setErrorMessage("Something went wrong. Try again.");
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-[var(--space-4)]">
      <div className="space-y-[var(--space-2)]">
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          {...form.register("password")}
        />
        {form.formState.errors.password ? (
          <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
        ) : null}
      </div>

      {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

      <SubmitButton pending={isPending}>Update password</SubmitButton>
    </form>
  );
}
