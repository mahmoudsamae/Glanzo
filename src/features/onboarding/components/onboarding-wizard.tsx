"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
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
  name: z.string().trim().min(2, "Salonname ist zu kurz").max(80),
  slug: shopSlugSchema,
});

const timezoneStepSchema = z.object({
  timezone: z.string().min(1, "Bitte Zeitzone wählen"),
});

const wizardSchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: shopSlugSchema,
  timezone: z.string().min(1),
  openingHours: openingHoursSchema,
});

type WizardValues = z.infer<typeof wizardSchema>;

const CREATE_SHOP_ERRORS: Record<CreateShopErrorCode, string> = {
  NOT_AUTHENTICATED: "Bitte erneut anmelden.",
  VALIDATION: "Bitte Angaben prüfen und erneut versuchen.",
  SLUG_INVALID: "Dieser Slug ist ungültig.",
  SLUG_RESERVED: "Dieser Slug ist reserviert.",
  SLUG_TAKEN: "Dieser Slug ist vergeben — wähle einen anderen.",
  SLUG_OWNED: "Du besitzt bereits einen Salon mit diesem Slug.",
  TIMEZONE_INVALID: "Bitte eine gültige Zeitzone wählen.",
  INVALID_NAME: "Salonname ist erforderlich.",
  UNKNOWN: "Etwas ist schiefgelaufen. Bitte erneut versuchen.",
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
  const [slugCheck, setSlugCheck] = useState<{
    slug: string;
    status: "available" | "taken" | "invalid";
  } | null>(null);
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

  const name = useWatch({ control: form.control, name: "name" }) ?? "";
  const slug = useWatch({ control: form.control, name: "slug" }) ?? "";
  const timezone = useWatch({ control: form.control, name: "timezone" }) ?? "";
  const openingHours = useWatch({ control: form.control, name: "openingHours" }) ?? DEFAULT_ONBOARDING_OPENING_HOURS;

  useEffect(() => {
    if (!name || step !== 0) return;
    const suggested = slugify(name);
    if (suggested && !form.getFieldState("slug").isDirty) {
      form.setValue("slug", suggested, { shouldValidate: true });
    }
  }, [name, step, form]);

  useEffect(() => {
    if (step !== 0 || !slug) {
      return;
    }

    const parsed = shopSlugSchema.safeParse(slug);
    if (!parsed.success) {
      return;
    }

    const handle = window.setTimeout(() => {
      void checkSlugAction(slug).then((result) => {
        if (!result.ok) {
          setSlugCheck({ slug, status: "invalid" });
          return;
        }
        setSlugCheck({ slug, status: result.available ? "available" : "taken" });
      });
    }, 400);

    return () => window.clearTimeout(handle);
  }, [slug, step, checkSlugAction]);

  const slugStatus = useMemo((): "idle" | "checking" | "available" | "taken" | "invalid" => {
    if (step !== 0 || !slug) return "idle";
    const parsed = shopSlugSchema.safeParse(slug);
    if (!parsed.success) return "invalid";
    if (!slugCheck || slugCheck.slug !== slug) return "checking";
    return slugCheck.status;
  }, [slug, step, slugCheck]);

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
      <p className="text-center text-sm text-muted-foreground">Schritt {step + 1} von 3</p>

      {step === 0 ? (
        <div className="space-y-[var(--space-4)]">
          <div className="space-y-[var(--space-2)]">
            <Label htmlFor="name">Salonname</Label>
            <Input id="name" {...form.register("name")} />
          </div>
          <div className="space-y-[var(--space-2)]">
            <Label htmlFor="slug">URL-Slug</Label>
            <Input id="slug" {...form.register("slug")} />
            <p className="text-sm text-muted-foreground">{previewHost}</p>
            {slugStatus === "checking" ? (
              <p className="text-sm text-muted-foreground">Verfügbarkeit wird geprüft…</p>
            ) : null}
            {slugStatus === "available" ? (
              <p className="text-sm text-[var(--signal-ok)]">Verfügbar</p>
            ) : null}
            {slugStatus === "taken" ? (
              <p className="text-sm text-destructive">Dieser Slug ist vergeben.</p>
            ) : null}
          </div>
          <Button type="button" className="w-full" onClick={() => goNext(0)}>
            Weiter
          </Button>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="space-y-[var(--space-4)]">
          <div className="space-y-[var(--space-2)]">
            <Label htmlFor="timezone">Zeitzone</Label>
            <Input id="timezone" list="timezone-options" {...form.register("timezone")} />
            <datalist id="timezone-options">
              {TIMEZONE_OPTIONS.map((tz) => (
                <option key={tz} value={tz} />
              ))}
            </datalist>
          </div>
          <p className="text-sm text-muted-foreground">Währung: EUR (MVP)</p>
          <div className="flex gap-[var(--space-2)]">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(0)}>
              Zurück
            </Button>
            <Button type="button" className="flex-1" onClick={() => goNext(1)}>
              Weiter
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
              Zurück
            </Button>
            <div className="flex-1">
              <SubmitButton pending={isPending}>Salon eröffnen</SubmitButton>
            </div>
          </div>
        </div>
      ) : null}
    </form>
  );
}
