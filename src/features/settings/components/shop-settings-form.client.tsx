"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { OpeningHoursEditor } from "@/components/shared/opening-hours-editor";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { parseOpeningHours, type OpeningHours } from "@/lib/validations/shop";

import { updateShopSettingsAction } from "../api";

type ShopSettingsFormProps = {
  shop: {
    name: string;
    slug: string;
    opening_hours: unknown;
    booking_lead_time_min: number;
    cancellation_window_min: number;
    slot_granularity_min: number;
  };
};

const GRANULARITY_OPTIONS = [5, 10, 15, 20, 30, 60] as const;

export function ShopSettingsForm({ shop }: ShopSettingsFormProps) {
  const router = useRouter();
  const [openingHours, setOpeningHours] = useState<OpeningHours>(
    parseOpeningHours(shop.opening_hours) ?? {
      mon: null,
      tue: { open: "09:00", close: "19:00" },
      wed: { open: "09:00", close: "19:00" },
      thu: { open: "09:00", close: "19:00" },
      fri: { open: "09:00", close: "19:00" },
      sat: { open: "09:00", close: "17:00" },
      sun: null,
    },
  );
  const [leadTime, setLeadTime] = useState(shop.booking_lead_time_min);
  const [cancelWindow, setCancelWindow] = useState(shop.cancellation_window_min);
  const [granularity, setGranularity] = useState(shop.slot_granularity_min);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await updateShopSettingsAction({
        openingHours,
        bookingLeadTimeMin: leadTime,
        cancellationWindowMin: cancelWindow,
        slotGranularityMin: granularity as (typeof GRANULARITY_OPTIONS)[number],
      });
      if (!result.ok) {
        setError("Could not save settings.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-[var(--space-8)]">
      <section className="space-y-[var(--space-3)]">
        <h2 className="text-sm font-medium">Shop identity</h2>
        <p className="text-sm text-[var(--text-2)]">
          <span className="text-[var(--text-0)]">{shop.name}</span> ·{" "}
          <span className="text-data">{shop.slug}</span>
        </p>
        <p className="text-xs text-[var(--text-2)]">
          Slug is locked — it powers your public mini-site URL and cannot change without breaking links.
        </p>
      </section>

      <section className="space-y-[var(--space-3)]">
        <h2 className="text-sm font-medium">Opening hours</h2>
        <OpeningHoursEditor value={openingHours} onChange={setOpeningHours} />
      </section>

      <section className="grid gap-[var(--space-4)] sm:grid-cols-3">
        <div>
          <Label htmlFor="lead-time">Lead time (min)</Label>
          <input
            id="lead-time"
            type="number"
            className="mt-[var(--space-2)] h-10 w-full rounded-md border border-border bg-transparent px-[var(--space-3)]"
            value={leadTime}
            onChange={(e) => setLeadTime(Number(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="cancel-window">Cancellation window (min)</Label>
          <input
            id="cancel-window"
            type="number"
            className="mt-[var(--space-2)] h-10 w-full rounded-md border border-border bg-transparent px-[var(--space-3)]"
            value={cancelWindow}
            onChange={(e) => setCancelWindow(Number(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="granularity">Slot granularity</Label>
          <select
            id="granularity"
            className="mt-[var(--space-2)] h-10 w-full rounded-md border border-border bg-transparent px-[var(--space-3)]"
            value={granularity}
            onChange={(e) => setGranularity(Number(e.target.value))}
          >
            {GRANULARITY_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value} min
              </option>
            ))}
          </select>
        </div>
      </section>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="button" disabled={isPending} onClick={save}>
        Save settings
      </Button>
    </div>
  );
}
