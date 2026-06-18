"use client";

import { Sparkles } from "lucide-react";

import { DashboardPrimaryButton } from "@/features/dashboard";
import { applyStarterKit } from "@/lib/minisite/starter-kits/apply-starter-kit";
import { STARTER_KITS } from "@/lib/minisite/starter-kits/registry";
import type { MinisiteSaveInput } from "@/lib/validations/minisite-editor";

type StarterKitPickerProps = {
  shopName: string;
  shopSlug: string;
  address?: string | null;
  draft: MinisiteSaveInput;
  kits?: typeof STARTER_KITS;
  onApply: (next: MinisiteSaveInput) => void;
};

export function StarterKitPicker({
  shopName,
  shopSlug,
  address,
  draft,
  kits = STARTER_KITS,
  onApply,
}: StarterKitPickerProps) {
  return (
    <div className="grid gap-[var(--space-3)]">
      {kits.map((kit) => {
        const active =
          draft.template === kit.template &&
          draft.accentHex.toLowerCase() === kit.accentHex.toLowerCase();

        return (
          <article
            key={kit.id}
            className={`relative overflow-hidden rounded-[calc(var(--radius)+4px)] border p-[var(--space-4)] transition-colors ${
              active
                ? "border-[var(--brass)] bg-[color-mix(in_oklch,var(--brass)_10%,var(--ink-2))]"
                : "border-[var(--ink-3)] bg-[color-mix(in_oklch,var(--ink-0)_55%,transparent)] hover:border-[color-mix(in_oklch,var(--brass)_28%,var(--ink-3))]"
            }`}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                background: `radial-gradient(ellipse 80% 60% at 100% 0%, ${kit.accentHex}33, transparent 55%)`,
              }}
              aria-hidden
            />
            <div className="relative flex flex-col gap-[var(--space-3)] sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1 space-y-[var(--space-2)]">
                <div className="flex flex-wrap items-center gap-[var(--space-2)]">
                  <span className="inline-flex items-center gap-1 rounded-full border border-[var(--ink-3)] bg-[var(--ink-1)] px-2 py-0.5 text-[10px] uppercase tracking-wider text-[var(--text-2)]">
                    <Sparkles className="size-3 text-[var(--brass)]" aria-hidden />
                    {kit.tier === "free" ? "Starter" : "Pro"}
                  </span>
                  <span
                    className="size-3 rounded-full border border-[var(--ink-3)]"
                    style={{ backgroundColor: kit.accentHex }}
                    title={kit.accentHex}
                    aria-hidden
                  />
                </div>
                <h3 className="font-display text-lg text-[var(--text-0)]">{kit.label}</h3>
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--brass)]">{kit.tagline}</p>
                <p className="text-sm leading-relaxed text-[var(--text-2)]">{kit.description}</p>
              </div>
              <DashboardPrimaryButton
                type="button"
                className="shrink-0 self-start px-[var(--space-4)] py-[var(--space-2)] text-sm"
                onClick={() =>
                  onApply(
                    applyStarterKit(
                      kit,
                      { shopName, shopSlug, address },
                      draft,
                      { preserveMedia: true, preserveLinks: true },
                    ),
                  )
                }
              >
                {active ? "Erneut anwenden" : "Kit anwenden"}
              </DashboardPrimaryButton>
            </div>
          </article>
        );
      })}
      <p className="text-xs text-[var(--text-3)]">
        Bilder und Social-Links bleiben erhalten. Texte, Vorlage und Farbe werden überschrieben — danach
        „Alles speichern“.
      </p>
    </div>
  );
}
