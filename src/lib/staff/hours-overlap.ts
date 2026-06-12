export type StaffShiftInput = {
  startTime: string;
  endTime: string;
};

/** HH:MM strings sort lexicographically in chronological order. */
function isValidShift(shift: StaffShiftInput): boolean {
  return /^\d{2}:\d{2}$/.test(shift.startTime) && shift.endTime > shift.startTime;
}

/** True when two half-open shifts [start, end) overlap. Touching boundaries are allowed. */
export function staffShiftsOverlap(a: StaffShiftInput, b: StaffShiftInput): boolean {
  if (!isValidShift(a) || !isValidShift(b)) {
    return false;
  }
  return a.startTime < b.endTime && b.startTime < a.endTime;
}

export function findOverlappingShiftIndex(
  shifts: StaffShiftInput[],
  candidate: StaffShiftInput,
  ignoreIndex?: number,
): number {
  return shifts.findIndex((shift, index) => {
    if (ignoreIndex === index) return false;
    return staffShiftsOverlap(shift, candidate);
  });
}

export function assertNoOverlappingShifts(shifts: StaffShiftInput[]): string | null {
  for (let i = 0; i < shifts.length; i += 1) {
    const shift = shifts[i]!;
    if (!isValidShift(shift)) {
      return "Each shift needs a valid start and end time (end after start).";
    }
    if (findOverlappingShiftIndex(shifts, shift, i) !== -1) {
      return "Shifts on the same day cannot overlap.";
    }
  }
  return null;
}
