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

const registerSchema = z.object({
  displayName: z.string().trim().min(1, "Display name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
});

type RegisterValues = z.infer<typeof registerSchema>;

type RegisterFormProps = {
  registerAction: (formData: FormData) => Promise<AuthActionResult>;
  nextPath?: string;
};

export function RegisterForm({ registerAction, nextPath }: RegisterFormProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { displayName: "", email: "", password: "" },
  });

  function onSubmit(values: RegisterValues) {
    setErrorMessage(null);
    const formData = new FormData();
    formData.set("displayName", values.displayName);
    formData.set("email", values.email);
    formData.set("password", values.password);
    if (nextPath) {
      formData.set("next", nextPath);
    }

    startTransition(async () => {
      try {
        const result = await registerAction(formData);
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
        <Label htmlFor="displayName">Display name</Label>
        <Input id="displayName" autoComplete="name" {...form.register("displayName")} />
        {form.formState.errors.displayName ? (
          <p className="text-sm text-destructive">{form.formState.errors.displayName.message}</p>
        ) : null}
      </div>

      <div className="space-y-[var(--space-2)]">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
        {form.formState.errors.email ? (
          <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
        ) : null}
      </div>

      <div className="space-y-[var(--space-2)]">
        <Label htmlFor="password">Password</Label>
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

      <SubmitButton pending={isPending}>Create account</SubmitButton>
    </form>
  );
}
