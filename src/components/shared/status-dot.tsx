import { cn } from "@/lib/utils";

type StatusDotProps = {
  label: string;
  tone?: "owner" | "barber" | "neutral";
};

const toneClass: Record<NonNullable<StatusDotProps["tone"]>, string> = {
  owner: "bg-[var(--brass)]",
  barber: "bg-[var(--text-2)]",
  neutral: "bg-[var(--text-2)]",
};

export function StatusDot({ label, tone = "neutral" }: StatusDotProps) {
  return (
    <span className="inline-flex items-center gap-[var(--space-2)] rounded-full border border-border px-[var(--space-2)] py-[var(--space-1)] text-xs text-[var(--text-1)]">
      <span className={cn("size-1.5 rounded-full", toneClass[tone])} aria-hidden />
      {label}
    </span>
  );
}
