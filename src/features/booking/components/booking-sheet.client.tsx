"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";

import { CutLine } from "@/components/shared/cut-line";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { PublicApiAlternativeSlot, PublicApiEnvelope } from "@/lib/api/public-response";
import {
  BARBER_FIRST,
  bookingStepProgress,
  buildBookingSearchParams,
  normalizeBookingSlotParam,
  parseBookingUrlState,
  previousBookingSearchParams,
} from "@/lib/booking/booking-steps";
import { readCustomerPrefill, writeCustomerPrefill } from "@/lib/booking/customer-prefill";
import {
  notifyCustomerBookingSaved,
  upsertSavedCustomerBooking,
} from "@/lib/booking/customer-saved-bookings";
import {
  clearBookingIdempotencyKey,
  getOrCreateBookingIdempotencyKey,
} from "@/lib/booking/idempotency";
import { downloadBookingIcs, generateBookingIcs } from "@/lib/booking/ics";
import { bookingErrorMessageDe } from "@/lib/booking/messages-de";
import {
  bookingSheetCssVars,
  bookingSheetThemeClass,
} from "@/lib/booking/booking-sheet-theme";
import {
  digitsFromPhoneInput,
  formatGermanPhoneVisual,
  germanPhoneRawFromDigits,
} from "@/lib/booking/phone-display";
import {
  formatBookingSummaryDate,
  formatDayChipLabel,
  formatSlotTime,
  nextDaysInTimezone,
  todayInTimezone,
} from "@/lib/booking/slot-days";
import { groupSlotsByPeriod } from "@/lib/booking/slot-groups";
import { formatPriceCents } from "@/lib/minisite/format-price";
import { normalizePhoneToE164 } from "@/lib/phone/normalize-e164";
import type { ShopPublicData } from "@/lib/validations/public-shop";
import { isBookingErrorCode } from "@/lib/booking/errors";
import { bookingContactFallback, resolveMinisiteLinks } from "@/lib/validations/minisite-links";
import { cn } from "@/lib/utils";

type BookingLocale = "de" | "en";

const BOOKING_STRINGS = {
  de: {
    back: "Zurück",
    stepService: "Service wählen",
    stepBarber: "Barber wählen",
    stepSlot: "Termin wählen",
    stepDetails: "Deine Daten",
    serviceSubtitle: "Wähle eine Leistung — danach siehst du sofort freie Termine.",
    firstAvailable: "Erstverfügbar",
    chosen: "Gewählt",
    dayLabel: "Tag",
    autoAssign: "Nächster freier Termin",
    noSlots: "Keine freien Termine",
    noSlotsDesc: "An diesem Tag ist nichts frei. Wähle einen anderen Tag oder kontaktiere uns direkt.",
    nextDay: (label: string) => `Nächster Tag mit Terminen: ${label}`,
    nameLabel: "Name",
    phoneLabel: "Telefon",
    emailLabel: "E-Mail (optional)",
    emailPlaceholder: "für deine Bestätigung",
    submitBtn: "Termin bestätigen",
    submitting: "Wird gebucht…",
    suspended: "Online-Buchung pausiert",
    suspendedDesc: (shopName: string) => `${shopName} nimmt gerade keine Online-Termine an.`,
    validationError: "Bitte Name und gültige Telefonnummer angeben.",
    slotError: "Bitte wähle einen Termin erneut.",
    networkError: "Verbindung fehlgeschlagen.",
    retry: "Erneut versuchen",
    duplicateWarning: (time: string, svcName: string) =>
      `Du hast heute schon einen Termin um ${time} Uhr (${svcName}). Noch einen buchen?`,
    cancel: "Abbrechen",
    bookAnyway: "Trotzdem buchen",
    durMin: "Min.",
    clock: " Uhr",
    icsFilename: "termin.ics",
    icsServiceFallback: "Termin",
    periodLabels: { morning: "Vormittag", afternoon: "Nachmittag", evening: "Abend" } as Record<string, string>,
    confirm: {
      title: "Gebucht.",
      when: "Wann",
      service: "Service",
      barber: "Barber",
      price: "Preis",
      salon: "Salon",
      address: "Adresse",
      saveIcs: "In Kalender speichern (.ics)",
      manage: "Termin verwalten",
      copy: "Link kopieren",
      copied: "Link kopiert",
      done: "Fertig",
      hint: "Nach «Fertig» findest du deinen Termin jederzeit über «Dein Termin» auf der Seite.",
    },
  },
  en: {
    back: "Back",
    stepService: "Choose a Service",
    stepBarber: "Choose a Team Member",
    stepSlot: "Pick a Time",
    stepDetails: "Your Details",
    serviceSubtitle: "Pick a service — available times appear right away.",
    firstAvailable: "First available",
    chosen: "Selected",
    dayLabel: "Day",
    autoAssign: "First available",
    noSlots: "No available times",
    noSlotsDesc: "Nothing free today. Choose another day or contact us directly.",
    nextDay: (label: string) => `Next day with availability: ${label}`,
    nameLabel: "Name",
    phoneLabel: "Phone",
    emailLabel: "Email (optional)",
    emailPlaceholder: "for your confirmation",
    submitBtn: "Confirm Booking",
    submitting: "Booking…",
    suspended: "Online booking paused",
    suspendedDesc: (shopName: string) => `${shopName} is not accepting online bookings right now.`,
    validationError: "Please enter your name and a valid phone number.",
    slotError: "Please select a time again.",
    networkError: "Connection failed.",
    retry: "Try again",
    duplicateWarning: (time: string, svcName: string) =>
      `You already have an appointment today at ${time} (${svcName}). Book another?`,
    cancel: "Cancel",
    bookAnyway: "Book anyway",
    durMin: "min",
    clock: "",
    icsFilename: "booking.ics",
    icsServiceFallback: "Appointment",
    periodLabels: { morning: "Morning", afternoon: "Afternoon", evening: "Evening" } as Record<string, string>,
    confirm: {
      title: "Booked.",
      when: "When",
      service: "Service",
      barber: "Artist",
      price: "Price",
      salon: "Salon",
      address: "Address",
      saveIcs: "Save to calendar (.ics)",
      manage: "Manage booking",
      copy: "Copy link",
      copied: "Copied",
      done: "Done",
      hint: "You can always find your booking via 'My Booking' on the page.",
    },
  },
} satisfies Record<BookingLocale, unknown>;

type AvailabilitySlot = PublicApiAlternativeSlot;

type ConfirmationState = {
  manageUrl: string;
  startsAt: string;
  endsAt: string;
  membershipId: string;
};

type BookingSheetClientProps = {
  shopSlug: string;
  data: ShopPublicData;
};

export function BookingSheetClient({ shopSlug, data }: BookingSheetClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const autoAssignBarber = data.shop.booking_auto_assign_barber !== false;
  const flowOptions = useMemo(
    () => ({ autoAssignBarber }),
    [autoAssignBarber],
  );

  const urlState = useMemo(
    () => parseBookingUrlState(new URLSearchParams(searchParams.toString()), flowOptions),
    [searchParams, flowOptions],
  );

  const effectiveBarberId =
    urlState.barberId ?? (autoAssignBarber && urlState.serviceId ? BARBER_FIRST : null);

  const timezone = data.shop.timezone;
  const isSuspended = data.shop.status === "suspended";
  const locale = ((data.minisite.content.locale ?? "de") as BookingLocale);
  const s = BOOKING_STRINGS[locale];
  const currency = data.minisite.content.currency;

  function getBookingError(code: string): string {
    if (locale === "en") {
      const map: Record<string, string> = {
        SLOT_TAKEN: "This time was just taken. Please choose another slot.",
        SHOP_SUSPENDED: "This salon isn't accepting bookings right now.",
        INVALID_INPUT: "Please check your details and try again.",
        DUPLICATE_BOOKING: "You already have a booking at this time.",
        SERVICE_NOT_FOUND: "This service is no longer available.",
        MEMBERSHIP_NOT_FOUND: "This team member is currently unavailable.",
      };
      return map[code] ?? "Something went wrong. Please try again.";
    }
    return bookingErrorMessageDe(isBookingErrorCode(code) ? code : "INVALID_INPUT");
  }
  const today = useMemo(() => todayInTimezone(timezone), [timezone]);
  const dayOptions = useMemo(() => nextDaysInTimezone(timezone, 7), [timezone]);

  const [selectedDate, setSelectedDate] = useState(today);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [suggestedDate, setSuggestedDate] = useState<string | null>(null);
  const [alternatives, setAlternatives] = useState<AvailabilitySlot[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [networkError, setNetworkError] = useState(false);
  const [confirmation, setConfirmation] = useState<ConfirmationState | null>(null);
  const [copyDone, setCopyDone] = useState(false);
  const [duplicatePrompt, setDuplicatePrompt] = useState<{
    startsAt: string;
    serviceName: string;
  } | null>(null);

  const [name, setName] = useState("");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [email, setEmail] = useState("");

  const selectedService = data.services.find((s) => s.id === urlState.serviceId) ?? null;
  const selectedBarber =
    urlState.barberId && urlState.barberId !== BARBER_FIRST
      ? data.team.find((m) => m.membership_id === urlState.barberId) ?? null
      : null;

  const resolvedSlot = useMemo(() => {
    if (!urlState.slotStartsAt) {
      return null;
    }
    return (
      slots.find((s) => s.startsAt === urlState.slotStartsAt) ?? {
        membershipId:
          urlState.barberId && urlState.barberId !== BARBER_FIRST
            ? urlState.barberId
            : "",
        startsAt: urlState.slotStartsAt,
        endsAt: urlState.slotStartsAt,
      }
    );
  }, [slots, urlState.barberId, urlState.slotStartsAt]);

  const barberNameForSlot = useMemo(() => {
    const membershipId =
      resolvedSlot?.membershipId ||
      (urlState.barberId !== BARBER_FIRST ? urlState.barberId : null);
    if (!membershipId) {
      return "Team";
    }
    return data.team.find((m) => m.membership_id === membershipId)?.display_name ?? "Team";
  }, [data.team, resolvedSlot?.membershipId, urlState.barberId]);

  const pushParams = useCallback(
    (next: URLSearchParams) => {
      const query = next.toString();
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  const buildParams = useCallback(
    (base: URLSearchParams, patch: Parameters<typeof buildBookingSearchParams>[1]) =>
      buildBookingSearchParams(base, patch, flowOptions),
    [flowOptions],
  );

  const closeSheet = useCallback(() => {
    setConfirmation(null);
    setAlternatives([]);
    setError(null);
    setDuplicatePrompt(null);
    pushParams(buildParams(new URLSearchParams(searchParams.toString()), { open: false }));
  }, [buildParams, pushParams, searchParams]);

  const goBack = useCallback(() => {
    if (confirmation) {
      return;
    }
    const prev = previousBookingSearchParams(
      new URLSearchParams(searchParams.toString()),
      flowOptions,
    );
    if (!parseBookingUrlState(prev).open) {
      closeSheet();
      return;
    }
    pushParams(prev);
  }, [closeSheet, confirmation, flowOptions, pushParams, searchParams]);

  const loadSlotsForDate = useCallback(
    async (date: string): Promise<AvailabilitySlot[]> => {
      if (!urlState.serviceId || !effectiveBarberId) {
        return [];
      }
      const membershipQuery =
        effectiveBarberId === BARBER_FIRST
          ? ""
          : `&membershipId=${encodeURIComponent(effectiveBarberId)}`;
      const response = await fetch(
        `/api/public/shops/${shopSlug}/availability?serviceId=${urlState.serviceId}&date=${date}${membershipQuery}`,
      );
      const body = (await response.json()) as PublicApiEnvelope<{ slots: AvailabilitySlot[] }>;
      if ("error" in body) {
        if (body.error.code === "SHOP_SUSPENDED") {
          setError(getBookingError("SHOP_SUSPENDED"));
        } else {
          setError(body.error.message);
        }
        return [];
      }
      return body.data.slots;
    },
    [effectiveBarberId, shopSlug, urlState.serviceId],
  );

  useEffect(() => {
    if (urlState.step !== "slot" || !urlState.serviceId || !effectiveBarberId) {
      return;
    }

    let cancelled = false;

    async function loadDaySlots() {
      setSlotsLoading(true);
      setNetworkError(false);
      setError(null);
      setSuggestedDate(null);

      try {
        const loaded = await loadSlotsForDate(selectedDate);
        if (cancelled) {
          return;
        }
        setSlots(loaded);
        if (loaded.length === 0) {
          for (const day of dayOptions) {
            if (day === selectedDate) {
              continue;
            }
            const alt = await loadSlotsForDate(day);
            if (cancelled) {
              return;
            }
            if (alt.length > 0) {
              setSuggestedDate(day);
              break;
            }
          }
        }
      } catch {
        if (!cancelled) {
          setNetworkError(true);
          setSlots([]);
        }
      } finally {
        if (!cancelled) {
          setSlotsLoading(false);
        }
      }
    }

    void loadDaySlots();

    return () => {
      cancelled = true;
    };
  }, [
    dayOptions,
    loadSlotsForDate,
    selectedDate,
    urlState.step,
    effectiveBarberId,
  ]);

  const groupedSlots = useMemo(
    () => groupSlotsByPeriod(slots, timezone),
    [slots, timezone],
  );

  function selectService(serviceId: string) {
    pushParams(
      buildParams(new URLSearchParams(searchParams.toString()), {
        open: true,
        serviceId,
      }),
    );
  }

  function selectBarber(barberId: string) {
    pushParams(
      buildParams(new URLSearchParams(searchParams.toString()), {
        barberId,
      }),
    );
  }

  const applyCustomerPrefill = useCallback(() => {
    const prefill = readCustomerPrefill(localStorage);
    if (!prefill) {
      return;
    }
    setName((current) => current || prefill.name);
    const digits = digitsFromPhoneInput(prefill.phone.replace(/^\+49/, ""));
    setPhoneDigits((current) => current || digits);
  }, []);

  useEffect(() => {
    if (urlState.step !== "details") {
      return;
    }
    queueMicrotask(() => applyCustomerPrefill());
  }, [applyCustomerPrefill, urlState.slotStartsAt, urlState.step]);

  useEffect(() => {
    if (urlState.open) {
      document.body.classList.add("ms-booking-open");
    } else {
      document.body.classList.remove("ms-booking-open");
    }
    return () => document.body.classList.remove("ms-booking-open");
  }, [urlState.open]);

  function selectSlot(slot: AvailabilitySlot) {
    pushParams(
      buildParams(new URLSearchParams(searchParams.toString()), {
        slotStartsAt: slot.startsAt,
        ...(autoAssignBarber && !urlState.barberId ? { barberId: BARBER_FIRST } : {}),
      }),
    );
  }

  function pickAlternative(slot: AvailabilitySlot) {
    setAlternatives([]);
    setError(null);
    const next = buildParams(new URLSearchParams(searchParams.toString()), {
      barberId:
        effectiveBarberId === BARBER_FIRST || autoAssignBarber ? BARBER_FIRST : slot.membershipId,
      slotStartsAt: slot.startsAt,
    });
    pushParams(next);
  }

  async function submitBooking(forceDuplicate = false) {
    const startsAt = normalizeBookingSlotParam(urlState.slotStartsAt);
    if (!urlState.serviceId || !startsAt || isPending) {
      return;
    }

    const phoneRaw = germanPhoneRawFromDigits(phoneDigits);
    const phone = normalizePhoneToE164(phoneRaw);
    if (!name.trim() || name.trim().length < 2 || !phone) {
      setError(s.validationError);
      return;
    }

    const membershipId =
      effectiveBarberId === BARBER_FIRST
        ? (resolvedSlot?.membershipId ||
            slots.find((s) => s.startsAt === startsAt)?.membershipId ||
            null)
        : effectiveBarberId;

    if (!membershipId) {
      setError(s.slotError);
      return;
    }

    if (!forceDuplicate) {
      try {
        const checkParams = new URLSearchParams({
          phone,
          name: name.trim(),
          startsAt,
        });
        const checkResponse = await fetch(
          `/api/public/shops/${shopSlug}/bookings/duplicate-check?${checkParams.toString()}`,
        );
        const checkBody = (await checkResponse.json()) as PublicApiEnvelope<{
          duplicate: boolean;
          existing?: { startsAt: string; serviceName: string };
        }>;

        if ("data" in checkBody && checkBody.data.duplicate && checkBody.data.existing) {
          setDuplicatePrompt(checkBody.data.existing);
          setError(null);
          return;
        }
      } catch {
        // Non-blocking — proceed with booking if duplicate check fails.
      }
    }

    setDuplicatePrompt(null);

    startTransition(async () => {
      setError(null);
      setAlternatives([]);
      setNetworkError(false);

      const idempotencyKey = getOrCreateBookingIdempotencyKey(shopSlug, sessionStorage);

      try {
        const response = await fetch(`/api/public/shops/${shopSlug}/bookings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Idempotency-Key": idempotencyKey,
          },
          body: JSON.stringify({
            serviceId: urlState.serviceId,
            membershipId,
            startsAt,
            name: name.trim(),
            phone,
            email: email.trim() || null,
          }),
        });

        const body = (await response.json()) as PublicApiEnvelope<{
          manageUrl: string;
          startsAt: string;
          endsAt: string;
        }>;

        if ("error" in body) {
          const code = isBookingErrorCode(body.error.code) ? body.error.code : "INVALID_INPUT";
          setError(getBookingError(code));
          if (code === "SLOT_TAKEN" && body.error.alternatives?.length) {
            setAlternatives(body.error.alternatives);
          }
          return;
        }

        clearBookingIdempotencyKey(shopSlug, sessionStorage);
        writeCustomerPrefill(localStorage, { name: name.trim(), phone });
        upsertSavedCustomerBooking(localStorage, {
          shopSlug,
          shopName: data.shop.name,
          manageUrl: body.data.manageUrl,
          startsAt: body.data.startsAt,
          endsAt: body.data.endsAt,
          serviceName: selectedService?.name ?? "",
          customerName: name.trim(),
        });
        notifyCustomerBookingSaved();
        setConfirmation({
          manageUrl: body.data.manageUrl,
          startsAt: body.data.startsAt,
          endsAt: body.data.endsAt,
          membershipId,
        });
      } catch {
        setNetworkError(true);
      }
    });
  }

  function confirmBooking() {
    void submitBooking(false);
  }

  const progress = bookingStepProgress(urlState.step, autoAssignBarber);
  const contactLinks = resolveMinisiteLinks(
    data.minisite.content.links,
    data.minisite.content.instagram,
  );
  const contactFallback = bookingContactFallback(contactLinks);
  const bookingThemeClass = bookingSheetThemeClass(data.minisite.template);
  const bookingStyle = bookingSheetCssVars(data.minisite.template, data.minisite.accent_hex);

  return (
    <Sheet
      open={urlState.open}
      onOpenChange={(open) => {
        if (!open) {
          closeSheet();
        }
      }}
    >
      <SheetContent
        overlayClassName="ms-booking-overlay"
        style={bookingStyle}
        className={cn(
          "ms-booking-sheet minisite-font",
          bookingThemeClass,
          "max-h-[92dvh] overflow-y-auto text-[color:var(--ms-text)] lg:max-h-none",
          "lg:inset-y-0 lg:right-0 lg:left-auto lg:top-0 lg:bottom-0 lg:w-full lg:max-w-md",
          "lg:rounded-none lg:border-t-0 lg:border-l",
          "data-[state=open]:duration-[var(--t-smooth)] data-[state=closed]:duration-[var(--t-fast)]",
        )}
        aria-describedby={undefined}
      >
        <div className="ms-booking-sheet__header flex items-center gap-[var(--space-3)] pr-8">
          {!confirmation && urlState.step !== "service" ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="-ml-2 text-[color:var(--ms-text-muted)] hover:bg-[color-mix(in_oklch,var(--ms-accent)_12%,transparent)] hover:text-[color:var(--ms-text)]"
              onClick={goBack}
            >
              {s.back}
            </Button>
          ) : (
            <span className="w-14" />
          )}
          <div className="flex-1">
            <div className={confirmation ? "ms-booking-celebrate" : undefined}>
              <CutLine progress={confirmation ? 1 : progress} />
            </div>
          </div>
        </div>

        {confirmation ? (
          <ConfirmationView
            shopName={data.shop.name}
            serviceName={selectedService?.name ?? ""}
            barberName={barberNameForSlot}
            priceCents={selectedService?.price_cents}
            currency={currency}
            timezone={timezone}
            confirmation={confirmation}
            address={data.minisite.content.address}
            copyDone={copyDone}
            strings={s.confirm}
            clock={s.clock}
            onCopy={() => {
              const url = `${window.location.origin}${confirmation.manageUrl}`;
              void navigator.clipboard.writeText(url).then(() => setCopyDone(true));
            }}
            onDownloadIcs={() => {
              const ics = generateBookingIcs({
                shopName: data.shop.name,
                serviceName: selectedService?.name ?? s.icsServiceFallback,
                startsAt: confirmation.startsAt,
                endsAt: confirmation.endsAt,
                location: data.minisite.content.address,
              });
              downloadBookingIcs(s.icsFilename, ics);
            }}
            onClose={closeSheet}
          />
        ) : isSuspended ? (
          <div className="flex flex-col gap-[var(--space-4)] pt-[var(--space-4)]">
            <SheetHeader>
              <SheetTitle>{s.suspended}</SheetTitle>
            </SheetHeader>
            <p className="text-md text-[color:var(--ms-text-muted)]">
              {s.suspendedDesc(data.shop.name)}
            </p>
            {contactFallback.href ? (
              <p className="text-sm text-[color:var(--ms-text-muted)]">
                <a
                  href={contactFallback.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline-offset-4 hover:underline"
                >
                  {contactFallback.label}
                </a>
              </p>
            ) : null}
          </div>
        ) : (
          <div key={urlState.step} className="ms-booking-step">
            <SheetHeader className="pt-[var(--space-2)]">
              <SheetTitle className="ms-booking-sheet__title">
                {urlState.step === "service" && s.stepService}
                {urlState.step === "barber" && s.stepBarber}
                {urlState.step === "slot" && s.stepSlot}
                {urlState.step === "details" && s.stepDetails}
              </SheetTitle>
              {urlState.step === "service" ? (
                <p className="ms-booking-sheet__subtitle">
                  {s.serviceSubtitle}
                </p>
              ) : null}
            </SheetHeader>

            {urlState.step === "service" ? (
              <ul className="flex flex-col gap-[var(--space-3)]">
                {data.services.map((service) => (
                  <li key={service.id}>
                    <button
                      type="button"
                      className="ms-booking-service-card group"
                      onClick={() => selectService(service.id)}
                    >
                      <span className="flex min-w-0 flex-1 flex-col gap-[var(--space-1)]">
                        <span className="font-display text-base leading-snug">{service.name}</span>
                        <span className="text-sm text-[color:var(--ms-text-muted)]">
                          {service.duration_min} {s.durMin}
                        </span>
                      </span>
                      <span className="ms-booking-service-card__price">
                        {formatPriceCents(service.price_cents, currency)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}

            {urlState.step === "barber" && !autoAssignBarber ? (
              <ul className="flex flex-col gap-[var(--space-2)]">
                <li>
                  <button
                    type="button"
                    className="ms-booking-service-card font-display text-md"
                    onClick={() => selectBarber(BARBER_FIRST)}
                  >
                    {s.firstAvailable}
                  </button>
                </li>
                {data.team.map((member) => (
                  <li key={member.membership_id}>
                    <button
                      type="button"
                      className="ms-booking-service-card font-display text-md"
                      onClick={() => selectBarber(member.membership_id)}
                    >
                      {member.display_name}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}

            {urlState.step === "slot" ? (
              <div className="flex flex-col gap-[var(--space-5)]">
                {selectedService ? (
                  <div className="ms-booking-summary">
                    <p className="text-xs uppercase tracking-[0.12em] text-[color:var(--ms-text-muted)]">
                      {s.chosen}
                    </p>
                    <p className="mt-[var(--space-1)] font-display text-base">{selectedService.name}</p>
                    <p className="text-sm text-[color:var(--ms-text-muted)]">
                      {selectedService.duration_min} {s.durMin} · {formatPriceCents(selectedService.price_cents, currency)}
                      {autoAssignBarber ? ` · ${s.autoAssign}` : null}
                    </p>
                  </div>
                ) : null}

                <div>
                  <p className="mb-[var(--space-2)] text-xs uppercase tracking-[0.12em] text-[color:var(--ms-text-muted)]">
                    {s.dayLabel}
                  </p>
                  <div className="flex gap-[var(--space-2)] overflow-x-auto pb-1">
                    {dayOptions.map((date) => (
                      <button
                        key={date}
                        type="button"
                        className={cn(
                          "ms-booking-day-chip",
                          date === selectedDate && "ms-booking-day-chip--active",
                          date === suggestedDate &&
                            date !== selectedDate &&
                            "ms-booking-day-chip--suggested",
                        )}
                        onClick={() => setSelectedDate(date)}
                      >
                        {formatDayChipLabel(date, timezone, today)}
                      </button>
                    ))}
                  </div>
                </div>

                {slotsLoading ? (
                  <SlotGridSkeleton />
                ) : slots.length > 0 ? (
                  <div className="flex flex-col gap-[var(--space-5)]">
                    {groupedSlots.map((group) => (
                      <div key={group.period}>
                        <p className="mb-[var(--space-3)] text-xs uppercase tracking-[0.12em] text-[color:var(--ms-text-muted)]">
                          {s.periodLabels[group.period] ?? group.label}
                        </p>
                        <div className="grid grid-cols-3 gap-[var(--space-2)] sm:grid-cols-4">
                          {group.slots.map((slot, slotIndex) => (
                            <button
                              key={`${slot.membershipId}-${slot.startsAt}`}
                              type="button"
                              className={cn(
                                "ms-booking-slot-chip ms-slot-chip",
                                urlState.slotStartsAt === slot.startsAt && "ms-booking-slot-chip--active",
                              )}
                              style={{ ["--slot-i" as string]: slotIndex }}
                              onClick={() => selectSlot(slot)}
                            >
                              {formatSlotTime(slot.startsAt, timezone)}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="ms-booking-empty">
                    <p className="font-display text-base">{s.noSlots}</p>
                    <p className="mt-[var(--space-2)] text-sm text-[color:var(--ms-text-muted)]">
                      {s.noSlotsDesc}
                    </p>
                  </div>
                )}

                {suggestedDate && suggestedDate !== selectedDate ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedDate(suggestedDate)}
                  >
                    {s.nextDay(formatDayChipLabel(suggestedDate, timezone, today))}
                  </Button>
                ) : null}
              </div>
            ) : null}

            {urlState.step === "details" && selectedService ? (
              <div className="flex flex-col gap-[var(--space-4)]">
                <div className="ms-booking-summary">
                  <p className="font-display text-md">{selectedService.name}</p>
                  <p className="text-[color:var(--ms-text-muted)]">
                    {urlState.slotStartsAt
                      ? `${formatBookingSummaryDate(urlState.slotStartsAt, timezone)}, ${formatSlotTime(urlState.slotStartsAt, timezone)}${s.clock}`
                      : null}
                    {selectedBarber ? ` · ${selectedBarber.display_name}` : ` · ${s.firstAvailable}`}
                  </p>
                  <p className="text-data tabular-nums text-[color:var(--ms-accent-on-bg)]">
                    {formatPriceCents(selectedService.price_cents, currency)}
                  </p>
                </div>

                <div className="flex flex-col gap-[var(--space-2)]">
                  <Label htmlFor="booking-name">{s.nameLabel}</Label>
                  <Input
                    id="booking-name"
                    value={name}
                    autoComplete="name"
                    disabled={isPending}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-[var(--space-2)]">
                  <Label htmlFor="booking-phone">{s.phoneLabel}</Label>
                  <div className="flex items-center gap-[var(--space-2)] rounded-md border border-input bg-transparent px-[var(--space-3)] py-[var(--space-2)] focus-within:ring-1 focus-within:ring-ring">
                    <span className="text-sm text-[color:var(--ms-text-muted)]">+49</span>
                    <Input
                      id="booking-phone"
                      className="border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="170 1234567"
                      value={formatGermanPhoneVisual(phoneDigits)}
                      disabled={isPending}
                      onChange={(e) => setPhoneDigits(digitsFromPhoneInput(e.target.value))}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-[var(--space-2)]">
                  <Label htmlFor="booking-email">{s.emailLabel}</Label>
                  <Input
                    id="booking-email"
                    type="email"
                    autoComplete="email"
                    placeholder={s.emailPlaceholder}
                    value={email}
                    disabled={isPending}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {error ? <p className="text-sm text-destructive">{error}</p> : null}

                {alternatives.length > 0 ? (
                  <div className="flex flex-col gap-[var(--space-2)]">
                    <p className="text-sm text-[color:var(--ms-text-muted)]">{error}</p>
                    <div className="flex flex-wrap gap-[var(--space-2)]">
                      {alternatives.map((slot) => (
                        <Button
                          key={`${slot.membershipId}-${slot.startsAt}`}
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isPending}
                          onClick={() => pickAlternative(slot)}
                        >
                          {formatSlotTime(slot.startsAt, timezone)}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {duplicatePrompt ? (
                  <div className="ms-booking-summary flex flex-col gap-[var(--space-3)] border-[color:var(--ms-accent)]">
                    <p className="text-sm text-[color:var(--ms-text)]">
                      {s.duplicateWarning(
                        `${formatSlotTime(duplicatePrompt.startsAt, timezone)}${s.clock}`,
                        duplicatePrompt.serviceName,
                      )}
                    </p>
                    <div className="flex flex-col gap-[var(--space-2)] sm:flex-row">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        disabled={isPending}
                        onClick={() => setDuplicatePrompt(null)}
                      >
                        {s.cancel}
                      </Button>
                      <Button
                        type="button"
                        className="flex-1"
                        disabled={isPending}
                        onClick={() => void submitBooking(true)}
                      >
                        {s.bookAnyway}
                      </Button>
                    </div>
                  </div>
                ) : null}

                {networkError ? (
                  <div className="flex flex-col gap-[var(--space-2)]">
                    <p className="text-sm text-[color:var(--ms-text-muted)]">
                      {s.networkError}{" "}
                      {contactFallback.href ? (
                        <a
                          href={contactFallback.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline-offset-4 hover:underline"
                        >
                          {contactFallback.label}
                        </a>
                      ) : (
                        contactFallback.label
                      )}
                    </p>
                    <Button type="button" variant="outline" onClick={() => confirmBooking()}>
                      {s.retry}
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    className="w-full active:scale-[0.98] transition-transform duration-[var(--t-instant)]"
                    disabled={isPending || Boolean(duplicatePrompt)}
                    onClick={confirmBooking}
                  >
                    {isPending ? s.submitting : s.submitBtn}
                  </Button>
                )}
              </div>
            ) : null}

            {error && urlState.step !== "details" ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : null}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function SlotGridSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-[var(--space-2)] sm:grid-cols-4" aria-hidden>
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="h-10 animate-pulse rounded-md bg-[color:var(--ms-border-subtle)]"
        />
      ))}
    </div>
  );
}

type ConfirmationViewProps = {
  shopName: string;
  serviceName: string;
  barberName: string;
  priceCents?: number;
  currency?: string | null;
  timezone: string;
  confirmation: ConfirmationState;
  address?: string;
  copyDone: boolean;
  strings: typeof BOOKING_STRINGS.de.confirm;
  clock: string;
  onCopy: () => void;
  onDownloadIcs: () => void;
  onClose: () => void;
};

function ConfirmationView({
  shopName,
  serviceName,
  barberName,
  priceCents,
  currency,
  timezone,
  confirmation,
  address,
  copyDone,
  strings: cs,
  clock,
  onCopy,
  onDownloadIcs,
  onClose,
}: ConfirmationViewProps) {
  return (
    <div className="ms-booking-celebrate ms-booking-confirmation flex flex-col gap-[var(--space-6)] pt-[var(--space-4)]">
      <header className="text-center">
        <h2 className="font-display text-2xl text-[color:var(--ms-text)]">{cs.title}</h2>
        <div className="ms-booking-celebrate__shimmer mx-auto mt-[var(--space-3)] h-px w-24 bg-[color:var(--ms-accent-on-bg)]" aria-hidden />
      </header>

      <dl className="flex flex-col gap-[var(--space-3)] rounded-md border border-[color:var(--ms-border-subtle)] bg-[color:var(--ms-bg-elevated)] px-[var(--space-4)] py-[var(--space-4)] text-sm">
        <div className="flex justify-between gap-[var(--space-4)]">
          <dt className="text-[color:var(--ms-text-muted)]">{cs.when}</dt>
          <dd className="text-right text-data tabular-nums ms-booking-confirmation__accent">
            {formatBookingSummaryDate(confirmation.startsAt, timezone)}
            <br />
            {formatSlotTime(confirmation.startsAt, timezone)}{clock}
          </dd>
        </div>
        <div className="flex justify-between gap-[var(--space-4)]">
          <dt className="text-[color:var(--ms-text-muted)]">{cs.service}</dt>
          <dd>{serviceName}</dd>
        </div>
        <div className="flex justify-between gap-[var(--space-4)]">
          <dt className="text-[color:var(--ms-text-muted)]">{cs.barber}</dt>
          <dd>{barberName}</dd>
        </div>
        {priceCents !== undefined ? (
          <div className="flex justify-between gap-[var(--space-4)]">
            <dt className="text-[color:var(--ms-text-muted)]">{cs.price}</dt>
            <dd className="text-data tabular-nums ms-booking-confirmation__accent">{formatPriceCents(priceCents, currency)}</dd>
          </div>
        ) : null}
        <div className="flex justify-between gap-[var(--space-4)]">
          <dt className="text-[color:var(--ms-text-muted)]">{cs.salon}</dt>
          <dd>{shopName}</dd>
        </div>
        {address ? (
          <div className="flex justify-between gap-[var(--space-4)]">
            <dt className="text-[color:var(--ms-text-muted)]">{cs.address}</dt>
            <dd className="text-right">{address}</dd>
          </div>
        ) : null}
      </dl>

      <div className="flex flex-col gap-[var(--space-2)]">
        <Button type="button" variant="outline" onClick={onDownloadIcs}>
          {cs.saveIcs}
        </Button>
        <Button type="button" variant="outline" asChild>
          <a href={confirmation.manageUrl}>{cs.manage}</a>
        </Button>
        <Button type="button" variant="secondary" onClick={onCopy}>
          {copyDone ? cs.copied : cs.copy}
        </Button>
        <p className="text-center text-xs text-[color:var(--ms-text-muted)]">
          {cs.hint}
        </p>
        <Button type="button" onClick={onClose}>
          {cs.done}
        </Button>
      </div>
    </div>
  );
}
