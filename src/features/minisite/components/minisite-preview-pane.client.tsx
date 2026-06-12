"use client";

import type { CSSProperties } from "react";

import { deriveAccentCssVars } from "@/lib/color/accent";
import { mergeEditorDraftIntoPublicData } from "@/lib/minisite/editor-preview";
import type { MinisiteSaveInput } from "@/lib/validations/minisite-editor";
import type { ShopPublicData } from "@/lib/validations/public-shop";

import { MinisiteShell } from "../templates/minisite-shell";
import { getMinisiteTemplate } from "../templates/registry";

import "@/styles/themes/classic.css";
import "@/styles/themes/midnight.css";
import "@/styles/themes/bold.css";

type MinisitePreviewPaneProps = {
  shopSlug: string;
  publicData: ShopPublicData;
  draft: MinisiteSaveInput;
};

export function MinisitePreviewPane({ shopSlug, publicData, draft }: MinisitePreviewPaneProps) {
  const merged = mergeEditorDraftIntoPublicData(publicData, draft);
  const template = getMinisiteTemplate(draft.template);
  const accentVars = deriveAccentCssVars(draft.accentHex, draft.template);

  return (
    <div className="flex flex-col items-center gap-[var(--space-3)]">
      <p className="text-xs uppercase tracking-wide text-[var(--text-2)]">Live preview · 375px</p>
      <div
        className={`minisite ${template.themeClass} ${template.fontClass} w-[375px] max-w-full overflow-hidden rounded-[1.75rem] border border-[var(--ink-3)] bg-[color:var(--ms-bg)] shadow-lg`}
        style={accentVars as CSSProperties}
      >
        <div className="max-h-[70vh] overflow-y-auto overscroll-contain">
          <MinisiteShell data={merged} shopSlug={shopSlug} preview />
        </div>
      </div>
    </div>
  );
}
