"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OpeningHoursEditor } from "@/components/shared/opening-hours-editor";
import { SubmitButton } from "@/components/shared/submit-button";
import type { CheckSlugResult, CreateShopErrorCode, CreateShopResult } from "@/lib/auth/types";
import { clientEnv } from "@/lib/env";
import { slugify } from "@/lib/slugify";
import {
  DEFAULT_ONBOARDING_OPENING_HOURS,
  openingHoursSchema,
  shopSlugSchema,
  type CreateShopInput,
} from "@/lib/validations/shop";

const shopStepSchema = z.object({
  name: z.string().trim().min(2, "Shop name is too short").max(80),
  slug: shopSlugSchema,
});

const timezoneStepSchema = z.object({
  timezone: z.string().min(1, "Choose a timezone"),
});

const wizardSchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: shopSlugSchema,
  timezone: z.string().min(1),
  openingHours: openingHoursSchema,
});

type WizardValues = z.infer<typeof wizardSchema>;

const CREATE_SHOP_ERRORS: Record<CreateShopErrorCode, string> = {
  NOT_AUTHENTICATED: "Sign in again to continue.",
  VALIDATION: "Check your details and try again.",
  SLUG_INVALID: "That slug isn't valid.",
  SLUG_RESERVED: "That slug is reserved.",
  SLUG_TAKEN: "Someone just took that slug — pick another.",
  SLUG_OWNED: "You already own a shop with that slug.",
  TIMEZONE_INVALID: "Choose a valid timezone.",
  INVALID_NAME: "Shop name is required.",
  UNKNOWN: "Something went wrong. Try again.",
};

const TIMEZONE_OPTIONS =
  typeof Intl.supportedValuesOf === "function"
    ? Intl.supportedValuesOf("timeZone")
    : ["Europe/Berlin", "Europe/London", "America/New_York"];

type OnboardingWizardProps = {
  checkSlugAction: (slug: string) => Promise<CheckSlugResult>;
  createShopAction: (input: CreateShopInput) => Promise<CreateShopResult>;
};

export function OnboardingWizard({ checkSlugAction, createShopAction }: OnboardingWizardProps) {
  const [step, setStep] = useState(0);
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">(
    "idle",
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<WizardValues>({
    resolver: zodResolver(wizardSchema),
    defaultValues: {
      name: "",
      slug: "",
      timezone: "Europe/Berlin",
      openingHours: DEFAULT_ONBOARDING_OPENING_HOURS,
    },
    mode: "onChange",
  });

  const name = form.watch("name");
  const slug = form.watch("slug");
  const timezone = form.watch("timezone");
  const openingHours = form.watch("openingHours");

  useEffect(() => {
    if (!name || step !== 0) return;
    const suggested = slugify(name);
    if (suggested && !form.getFieldState("slug").isDirty) {
      form.setValue("slug", suggested, { shouldValidate: true });
    }
  }, [name, step, form]);

  useEffect(() => {
    if (step !== 0 || !slug) {
      setSlugStatus("idle");
      return;
    }

    const parsed = shopSlugSchema.safeParse(slug);
    if (!parsed.success) {
      setSlugStatus("invalid");
      return;
    }

    setSlugStatus("checking");
    const handle = window.setTimeout(() => {
      void checkSlugAction(slug).then((result) => {
        if (!result.ok) {
          setSlugStatus("invalid");
          return;
        }
        setSlugStatus(result.available ? "available" : "taken");
      });
    }, 400);

    return () => window.clearTimeout(handle);
  }, [slug, step]);

  const previewHost = useMemo(() => {
    const root = clientEnv.NEXT_PUBLIC_ROOT_DOMAIN.replace(/^[^.]+\./, "");
    return `${slug || "your-shop"}.${root}`;
  }, [slug]);

  function goNext(fromStep: number) {
    if (fromStep === 0) {
      const result = shopStepSchema.safeParse({ name, slug });
      if (!result.success || slugStatus === "taken" || slugStatus === "invalid") {
        void form.trigger(["name", "slug"]);
        return;
      }
    }

    if (fromStep === 1) {
      const result = timezoneStepSchema.safeParse({ timezone });
      if (!result.success) {
        void form.trigger(["timezone"]);
        return;
      }
    }

    setStep((current) => Math.min(current + 1, 2));
  }

  function onSubmit(values: WizardValues) {
    setSubmitError(null);
    startTransition(async () => {
      const result = await createShopAction({
        name: values.name,
        slug: values.slug,
        timezone: values.timezone,
        openingHours: values.openingHours,
      });

      if (!result.ok) {
        setSubmitError(CREATE_SHOP_ERRORS[result.code]);
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-[var(--space-6)]">
      <p className="text-center text-sm text-muted-foreground">Step {step + 1} of 3</p>

      {step === 0 ? (
        <div className="space-y-[var(--space-4)]">
          <div className="space-y-[var(--space-2)]">
            <Label htmlFor="name">Shop name</Label>
            <Input id="name" {...form.register("name")} />
          </div>
          <div className="space-y-[var(--space-2)]">
            <Label htmlFor="slug">URL slug</Label>
            <Input id="slug" {...form.register("slug")} />
            <p className="text-sm text-muted-foreground">{previewHost}</p>
            {slugStatus === "checking" ? (
              <p className="text-sm text-muted-foreground">Checking availability…</p>
            ) : null}
            {slugStatus === "available" ? (
              <p className="text-sm text-[var(--signal-ok)]">Available</p>
            ) : null}
            {slugStatus === "taken" ? (
              <p className="text-sm text-destructive">That slug is taken.</p>
            ) : null}
          </div>
          <Button type="button" className="w-full" onClick={() => goNext(0)}>
            Continue
          </Button>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="space-y-[var(--space-4)]">
          <div className="space-y-[var(--space-2)]">
            <Label htmlFor="timezone">Timezone</Label>
            <Input id="timezone" list="timezone-options" {...form.register("timezone")} />
            <datalist id="timezone-options">
              {TIMEZONE_OPTIONS.map((tz) => (
                <option key={tz} value={tz} />
              ))}
            </datalist>
          </div>
          <p className="text-sm text-muted-foreground">Currency: EUR (MVP)</p>
          <div className="flex gap-[var(--space-2)]">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(0)}>
              Back
            </Button>
            <Button type="button" className="flex-1" onClick={() => goNext(1)}>
              Continue
            </Button>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-[var(--space-4)]">
          <OpeningHoursEditor
            value={openingHours}
            onChange={(next) => form.setValue("openingHours", next, { shouldValidate: true })}
          />

          {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}

          <div className="flex gap-[var(--space-2)]">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>
              Back
            </Button>
            <div className="flex-1">
              <SubmitButton pending={isPending}>Open my shop</SubmitButton>
            </div>
          </div>
        </div>
      ) : null}
    </form>
  );
}
