"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { OpeningHoursEditor } from "@/components/shared/opening-hours-editor";
import { DashboardPanel, DashboardPrimaryButton } from "@/components/dashboard";
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
    booking_auto_assign_barber: boolean;
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
  const [autoAssignBarber, setAutoAssignBarber] = useState(shop.booking_auto_assign_barber);
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
        bookingAutoAssignBarber: autoAssignBarber,
      });
      if (!result.ok) {
        setError("Could not save settings.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-[var(--space-4)]">
      <DashboardPanel title="Shop identity" description="Public name and locked mini-site slug.">
        <p className="text-sm text-[var(--text-2)]">
          <span className="font-medium text-[var(--text-0)]">{shop.name}</span> ·{" "}
          <span className="text-data">{shop.slug}</span>
        </p>
        <p className="mt-[var(--space-2)] text-xs text-[var(--text-2)]">
          Slug is locked — it powers your public mini-site URL and cannot change without breaking links.
        </p>
      </DashboardPanel>

      <DashboardPanel title="Opening hours">
        <OpeningHoursEditor value={openingHours} onChange={setOpeningHours} />
      </DashboardPanel>

      <DashboardPanel title="Booking rules">
        <div className="grid gap-[var(--space-4)] sm:grid-cols-3">
          <div>
            <Label htmlFor="lead-time">Lead time (min)</Label>
            <input
              id="lead-time"
              type="number"
              className="salon-dash-search mt-[var(--space-2)] h-10 w-full rounded-md px-[var(--space-3)]"
              value={leadTime}
              onChange={(e) => setLeadTime(Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="cancel-window">Cancellation window (min)</Label>
            <input
              id="cancel-window"
              type="number"
              className="salon-dash-search mt-[var(--space-2)] h-10 w-full rounded-md px-[var(--space-3)]"
              value={cancelWindow}
              onChange={(e) => setCancelWindow(Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="granularity">Slot granularity</Label>
            <select
              id="granularity"
              className="salon-dash-search mt-[var(--space-2)] h-10 w-full rounded-md px-[var(--space-3)]"
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
        </div>
        <label className="mt-[var(--space-4)] flex cursor-pointer items-start gap-[var(--space-3)] rounded-md border border-[color-mix(in_oklch,var(--brass)_8%,var(--ink-3))] px-[var(--space-4)] py-[var(--space-3)]">
          <input
            type="checkbox"
            className="mt-1"
            checked={autoAssignBarber}
            onChange={(e) => setAutoAssignBarber(e.target.checked)}
          />
          <span>
            <span className="block text-sm font-medium text-[var(--text-0)]">
              Direkt buchen (ohne Barber-Auswahl)
            </span>
            <span className="mt-[var(--space-1)] block text-xs text-[var(--text-2)]">
              Gäste wählen nur Service und Uhrzeit — der nächste freie Barber wird automatisch zugewiesen.
            </span>
          </span>
        </label>
      </DashboardPanel>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <DashboardPrimaryButton type="button" disabled={isPending} onClick={save}>
        Save settings
      </DashboardPrimaryButton>
    </div>
  );
}
