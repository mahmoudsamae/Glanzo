"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { platformStatusReasonSchema } from "@/lib/validations/platform-admin";
import { cn } from "@/lib/utils";

type PlatformReasonSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  pending?: boolean;
  onConfirm: (reason: string) => void;
};

export function PlatformReasonSheet({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  pending = false,
  onConfirm,
}: PlatformReasonSheetProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleConfirm() {
    const parsed = platformStatusReasonSchema.safeParse(reason);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Ungültige Begründung.");
      return;
    }
    setError(null);
    onConfirm(parsed.data);
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setReason("");
      setError(null);
    }
    onOpenChange(next);
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="gap-[var(--space-4)]">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <p className="text-sm text-[var(--text-2)]">{description}</p>
        <div className="flex flex-col gap-[var(--space-2)]">
          <label htmlFor="platform-reason" className="text-sm text-[var(--text-1)]">
            Begründung (Pflicht, min. 10 Zeichen)
          </label>
          <textarea
            id="platform-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={3}
            disabled={pending}
            className={cn(
              "flex min-h-[5rem] w-full rounded-md border border-border bg-transparent px-[var(--space-3)] py-[var(--space-2)] text-sm text-[var(--text-0)]",
              "placeholder:text-[var(--text-2)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--brass)]",
            )}
          />
          {error ? <p className="text-sm text-[var(--brass)]">{error}</p> : null}
        </div>
        <div className="flex gap-[var(--space-2)]">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={pending}
            onClick={() => handleOpenChange(false)}
          >
            Abbrechen
          </Button>
          <Button type="button" className="flex-1" disabled={pending} onClick={handleConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
