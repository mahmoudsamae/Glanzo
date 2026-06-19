import type {
  AvailabilitySlot,
  BarberAvailabilityInput,
  ComputeAvailabilityInput,
  MsInterval,
} from "./availability.types";
import {
  blocksAvailability,
  clipToDay,
  dayStartMs,
  intersectIntervals,
  localTimeOnDate,
  openingHoursInterval,
  shopWeekdayIndex,
  slotsFromWindows,
  subtractInterval,
} from "./time-windows";

function staffWindowsForDay(
  date: string,
  timezone: string,
  weekday: number,
  staffHours: BarberAvailabilityInput["staffHours"],
  shopOpen: MsInterval | null,
): MsInterval[] {
  if (!shopOpen) {
    return [];
  }

  const shifts = staffHours.filter((row) => row.weekday === weekday);
  if (shifts.length === 0 && shopOpen) {
    return [shopOpen];
  }

  const windows: MsInterval[] = [];

  for (const shift of shifts) {
    const shiftInterval = {
      startMs: localTimeOnDate(date, shift.startTime, timezone),
      endMs: localTimeOnDate(date, shift.endTime, timezone),
    };
    const clamped = intersectIntervals(shiftInterval, shopOpen);
    if (clamped) {
      windows.push(clamped);
    }
  }

  return windows;
}

function subtractBlocks(
  windows: MsInterval[],
  blocks: Array<{ startsAt: Date; endsAt: Date }>,
  date: string,
  timezone: string,
): MsInterval[] {
  let next = windows;
  for (const block of blocks) {
    const clipped = clipToDay(
      { startMs: block.startsAt.getTime(), endMs: block.endsAt.getTime() },
      date,
      timezone,
    );
    if (clipped) {
      next = subtractInterval(next, clipped);
    }
  }
  return next;
}

function computeBarberWindows(
  date: string,
  timezone: string,
  openingHours: ComputeAvailabilityInput["openingHours"],
  barber: BarberAvailabilityInput,
): MsInterval[] {
  const weekday = shopWeekdayIndex(date, timezone);
  const shopOpen = openingHoursInterval(date, openingHours, timezone);
  let windows = staffWindowsForDay(date, timezone, weekday, barber.staffHours, shopOpen);

  windows = subtractBlocks(
    windows,
    barber.timeOff.map((block) => ({ startsAt: block.startsAt, endsAt: block.endsAt })),
    date,
    timezone,
  );

  const blockingAppointments = barber.appointments.filter((apt) => blocksAvailability(apt.status));
  windows = subtractBlocks(
    windows,
    blockingAppointments.map((apt) => ({ startsAt: apt.startsAt, endsAt: apt.endsAt })),
    date,
    timezone,
  );

  return windows;
}

export function computeAvailabilitySlots(input: ComputeAvailabilityInput): AvailabilitySlot[] {
  const {
    timezone,
    date,
    serviceDurationMin,
    bookingLeadTimeMin,
    slotGranularityMin,
    openingHours,
    now,
    barbers,
    membershipId,
  } = input;

  const earliestStartMs = now.getTime() + bookingLeadTimeMin * 60_000;
  const gridOriginMs = dayStartMs(date, timezone);

  const selectedBarbers = membershipId
    ? barbers.filter((barber) => barber.membershipId === membershipId)
    : barbers;

  const slots: AvailabilitySlot[] = [];

  for (const barber of selectedBarbers) {
    const windows = computeBarberWindows(date, timezone, openingHours, barber);
    const starts = slotsFromWindows(
      windows,
      serviceDurationMin,
      slotGranularityMin,
      earliestStartMs,
      gridOriginMs,
    );

    for (const startsAt of starts) {
      slots.push({
        membershipId: barber.membershipId,
        startsAt,
        endsAt: new Date(startsAt.getTime() + serviceDurationMin * 60_000),
      });
    }
  }

  return slots.sort(
    (a, b) => a.startsAt.getTime() - b.startsAt.getTime() || a.membershipId.localeCompare(b.membershipId),
  );
}

/** Union of per-barber slots — same as computeAvailabilitySlots without membershipId filter. */
export function computeAnyBarberSlots(input: ComputeAvailabilityInput): AvailabilitySlot[] {
  return computeAvailabilitySlots({ ...input, membershipId: null });
}
