import { z } from "zod";

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const calendarSearchParamsSchema = z.object({
  date: isoDateSchema.optional(),
  view: z.enum(["day", "week"]).optional(),
  barber: z.string().uuid().optional(),
  mode: z.enum(["grid", "agenda"]).optional(),
});

export type CalendarSearchParams = z.infer<typeof calendarSearchParamsSchema>;

export function parseCalendarSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
  defaults: { date: string; view: "day" | "week"; barber?: string; mode?: "grid" | "agenda" },
): CalendarSearchParams & { date: string; view: "day" | "week"; mode: "grid" | "agenda" } {
  const raw = {
    date: typeof searchParams.date === "string" ? searchParams.date : undefined,
    view: typeof searchParams.view === "string" ? searchParams.view : undefined,
    barber: typeof searchParams.barber === "string" ? searchParams.barber : undefined,
    mode: typeof searchParams.mode === "string" ? searchParams.mode : undefined,
  };

  const parsed = calendarSearchParamsSchema.safeParse(raw);
  if (!parsed.success) {
    return { ...defaults, mode: defaults.mode ?? "grid" };
  }

  return {
    date: parsed.data.date ?? defaults.date,
    view: parsed.data.view ?? defaults.view,
    barber: parsed.data.barber ?? defaults.barber,
    mode: parsed.data.mode ?? defaults.mode ?? "grid",
  };
}

export function buildCalendarSearchParams(input: {
  date: string;
  view: "day" | "week";
  barber?: string | null;
  mode?: "grid" | "agenda";
}): string {
  const params = new URLSearchParams();
  params.set("date", input.date);
  params.set("view", input.view);
  if (input.barber) {
    params.set("barber", input.barber);
  }
  params.set("mode", input.mode ?? "grid");
  return params.toString();
}
