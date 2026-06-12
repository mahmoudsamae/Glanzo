export function CalendarSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-[var(--space-4)] px-[var(--space-4)] py-[var(--space-4)] lg:px-[var(--space-8)]">
      <div className="h-8 w-48 animate-[shimmer-once_1.2s_ease-in-out_1] rounded bg-[var(--ink-1)]" />
      <div className="flex flex-1 gap-[var(--space-4)]">
        <div className="w-11 shrink-0 space-y-8">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="h-3 w-8 animate-[shimmer-once_1.2s_ease-in-out_1] rounded bg-[var(--ink-1)]"
            />
          ))}
        </div>
        <div className="flex flex-1 gap-[var(--space-2)]">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="h-96 flex-1 animate-[shimmer-once_1.2s_ease-in-out_1] rounded bg-[var(--ink-1)]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
