"use client";

import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

import { cn } from "@/lib/utils";

const STORAGE_PREFIX = "glanzo:minisite-section:";

export type MinisiteEditorSectionProps = {
  id: string;
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

export function MinisiteEditorSection({
  id,
  title,
  description,
  defaultOpen = false,
  children,
}: MinisiteEditorSectionProps) {
  const [open, setOpen] = useState(() => {
    if (typeof window === "undefined") {
      return defaultOpen;
    }
    const stored = window.localStorage.getItem(`${STORAGE_PREFIX}${id}`);
    if (stored !== null) {
      return stored === "true";
    }
    return defaultOpen;
  });

  function toggle() {
    setOpen((current) => {
      const next = !current;
      window.localStorage.setItem(`${STORAGE_PREFIX}${id}`, String(next));
      return next;
    });
  }

  return (
    <section className={cn("salon-dash-editor-section", open && "salon-dash-editor-section--open")}>
      <button
        type="button"
        className="salon-dash-editor-section__trigger"
        aria-expanded={open}
        onClick={toggle}
      >
        <span className="min-w-0 flex-1 text-left">
          <span className="block text-sm font-medium text-[var(--text-0)]">{title}</span>
          {description ? (
            <span className="mt-[var(--space-1)] block text-xs leading-relaxed text-[var(--text-2)]">
              {description}
            </span>
          ) : null}
        </span>
        <ChevronDown
          className={cn(
            "salon-dash-editor-section__chevron size-4 shrink-0 text-[var(--text-2)]",
            open && "salon-dash-editor-section__chevron--open",
          )}
          strokeWidth={1.75}
          aria-hidden
        />
      </button>
      {open ? <div className="salon-dash-editor-section__body">{children}</div> : null}
    </section>
  );
}
