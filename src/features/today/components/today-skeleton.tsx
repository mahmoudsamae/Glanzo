export function TodaySkeleton() {
  return (
    <div className="mx-auto w-full max-w-[360px] flex-1 animate-[shimmer-once_1.2s_ease-in-out_1] px-[var(--space-4)] py-[var(--space-8)]">
      <div className="h-6 w-40 rounded bg-[var(--ink-1)]" />
      <div className="mt-[var(--space-8)] h-16 w-48 rounded bg-[var(--ink-1)]" />
      <div className="mt-[var(--space-8)] space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-9 rounded bg-[var(--ink-1)]" />
        ))}
      </div>
    </div>
  );
}
