"use client";

import { useOptimistic, useTransition } from "react";

import { Label } from "@/components/ui/label";

import { updateRemindersEnabledAction } from "../api";

type NotificationSettingsFormProps = {
  initial: {
    remindersEnabled: boolean;
  };
  senderFrom: string;
};

export function NotificationSettingsForm({ initial, senderFrom }: NotificationSettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticEnabled, setOptimisticEnabled] = useOptimistic(initial.remindersEnabled);

  function toggle(next: boolean) {
    startTransition(async () => {
      setOptimisticEnabled(next);
      await updateRemindersEnabledAction({ remindersEnabled: next });
    });
  }

  return (
    <div className="space-y-[var(--space-8)]">
      <section className="space-y-[var(--space-3)]">
        <h2 className="text-sm font-medium text-[var(--text-0)]">Erinnerungen</h2>
        <label className="flex items-center justify-between gap-[var(--space-4)] rounded-md border border-[var(--ink-3)] px-[var(--space-4)] py-[var(--space-3)]">
          <div>
            <Label htmlFor="reminders-toggle" className="text-[var(--text-0)]">
              24-Stunden-Erinnerung per E-Mail
            </Label>
            <p className="text-xs text-[var(--text-2)]">
              Betrifft zukünftige Erinnerungen — ausstehende werden beim Versand übersprungen.
            </p>
          </div>
          <input
            id="reminders-toggle"
            type="checkbox"
            className="size-5 accent-[var(--brass)]"
            checked={optimisticEnabled}
            disabled={isPending}
            onChange={(event) => toggle(event.target.checked)}
          />
        </label>
      </section>

      <section className="space-y-[var(--space-2)]">
        <h2 className="text-sm font-medium text-[var(--text-0)]">Absender</h2>
        <p className="text-sm text-[var(--text-2)]">
          Transaktionale E-Mails gehen von{" "}
          <span className="text-data text-[var(--text-0)]">{senderFrom}</span> an deine Kunden. Antworten
          landen nicht bei Glanzo — Kunden erreichen dich über deine Mini-Site.
        </p>
      </section>
    </div>
  );
}
