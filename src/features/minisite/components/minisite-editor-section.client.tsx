"use client";

import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useSyncExternalStore } from "react";

import { cn } from "@/lib/utils";

const STORAGE_PREFIX = "glanzo:minisite-section:";
const SECTION_EVENT = "glanzo:minisite-section-change";

function readStoredOpen(id: string, defaultOpen: boolean): boolean {
  const stored = window.localStorage.getItem(`${STORAGE_PREFIX}${id}`);
  if (stored !== null) {
    return stored === "true";
  }
  return defaultOpen;
}

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
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const handler = (event: Event) => {
        const detail = (event as CustomEvent<{ id?: string }>).detail;
        if (!detail?.id || detail.id === id) {
          onStoreChange();
        }
      };
      window.addEventListener(SECTION_EVENT, handler);
      return () => window.removeEventListener(SECTION_EVENT, handler);
    },
    [id],
  );

  const getSnapshot = useCallback(() => readStoredOpen(id, defaultOpen), [defaultOpen, id]);
  const open = useSyncExternalStore(subscribe, getSnapshot, () => defaultOpen);

  function toggle() {
    const next = !readStoredOpen(id, defaultOpen);
    window.localStorage.setItem(`${STORAGE_PREFIX}${id}`, String(next));
    window.dispatchEvent(new CustomEvent(SECTION_EVENT, { detail: { id } }));
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
