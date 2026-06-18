"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deriveAccentPalette } from "@/lib/color/accent";
import { MINISITE_ACCENT_PRESETS } from "@/lib/minisite/accent-presets";
import type { MinisiteSaveInput } from "@/lib/validations/minisite-editor";
import type { MinisiteTemplate } from "@/lib/validations/public-shop";

import { MINISITE_TEMPLATES } from "../templates/registry";
import { StarterKitPicker } from "./starter-kit-picker.client";

type MinisiteDesignsPanelProps = {
  shopName: string;
  shopSlug: string;
  address?: string;
  template: MinisiteTemplate;
  accentHex: string;
  draft: MinisiteSaveInput;
  onTemplateChange: (template: MinisiteTemplate) => void;
  onAccentChange: (hex: string) => void;
  onApplyStarterKit: (draft: MinisiteSaveInput) => void;
};

export function MinisiteDesignsPanel({
  shopName,
  shopSlug,
  address,
  template,
  accentHex,
  draft,
  onTemplateChange,
  onAccentChange,
  onApplyStarterKit,
}: MinisiteDesignsPanelProps) {
  const accentChip = deriveAccentPalette(accentHex, template);

  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      <section className="space-y-[var(--space-3)]">
        <div>
          <h2 className="font-display text-lg">Starter-Vorlagen</h2>
          <p className="mt-[var(--space-1)] text-sm text-[var(--text-2)]">
            Fertige Layouts — ein Klick, dann Abschnitte anpassen und speichern.
          </p>
        </div>
        <StarterKitPicker
          shopName={shopName}
          shopSlug={shopSlug}
          address={address}
          draft={draft}
          onApply={onApplyStarterKit}
        />
      </section>

      <section className="space-y-[var(--space-3)]">
        <div>
          <h2 className="font-display text-lg">Vorlage & Akzent</h2>
          <p className="mt-[var(--space-1)] text-sm text-[var(--text-2)]">
            Template und Farbe für Buttons, Links und Akzente.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-[var(--space-2)] sm:grid-cols-3 xl:grid-cols-3">
          {(Object.keys(MINISITE_TEMPLATES) as MinisiteTemplate[]).map((key) => {
            const item = MINISITE_TEMPLATES[key];
            const active = template === key;
            return (
              <button
                key={key}
                type="button"
                className={`rounded-md border px-[var(--space-3)] py-[var(--space-4)] text-left transition-colors ${
                  active
                    ? "border-[var(--brass)] bg-[var(--ink-2)]"
                    : "border-[var(--ink-3)] hover:border-[var(--ink-4)]"
                }`}
                onClick={() => onTemplateChange(key)}
              >
                <span className="font-display text-md">{item.label}</span>
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-[var(--space-2)]">
          {MINISITE_ACCENT_PRESETS.map((preset) => (
            <button
              key={preset.hex}
              type="button"
              title={preset.label}
              className={`size-9 rounded-full border-2 ${
                accentHex.toLowerCase() === preset.hex.toLowerCase()
                  ? "border-[var(--text-0)]"
                  : "border-transparent"
              }`}
              style={{ backgroundColor: preset.hex }}
              onClick={() => onAccentChange(preset.hex)}
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-[var(--space-3)]">
          <Label htmlFor="accent-custom" className="sr-only">
            Eigene Farbe
          </Label>
          <Input
            id="accent-custom"
            value={accentHex}
            onChange={(e) => onAccentChange(e.target.value)}
            className="salon-dash-search max-w-[8rem] font-mono text-sm"
            placeholder="#000000"
          />
          <span
            className="inline-flex items-center rounded-md px-[var(--space-3)] py-[var(--space-2)] text-sm"
            style={{
              backgroundColor: accentChip.accent,
              color: accentChip.onAccent,
            }}
          >
            AA Vorschau
          </span>
        </div>
      </section>
    </div>
  );
}
