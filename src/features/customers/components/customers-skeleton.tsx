export function CustomersSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[360px] animate-[shimmer-once_1.2s_ease-in-out_1] px-[var(--space-4)] py-[var(--space-8)]">
      <div className="mb-4 h-8 w-32 rounded bg-[var(--ink-1)]" />
      <div className="mb-4 h-10 rounded bg-[var(--ink-1)]" />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-9 rounded bg-[var(--ink-1)]" />
        ))}
      </div>
    </div>
  );
}
