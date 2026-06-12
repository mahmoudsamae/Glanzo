export default function DashboardLoading() {
  return (
    <div className="mx-auto w-full max-w-[360px] flex-1 px-[var(--space-4)] py-[var(--space-8)] lg:max-w-none lg:px-[var(--space-8)] lg:py-[var(--space-12)]">
      <div className="max-w-xl animate-[shimmer-once_1.4s_var(--ease-enter)_1]">
        <div className="h-4 w-40 rounded bg-[var(--ink-2)]" />
        <div className="mt-[var(--space-3)] h-px w-full bg-[var(--ink-2)]" />
        <div className="mt-[var(--space-12)] space-y-[var(--space-4)]">
          <div className="h-10 w-56 max-w-full rounded bg-[var(--ink-2)]" />
          <div className="h-4 w-full max-w-sm rounded bg-[var(--ink-2)]" />
        </div>
      </div>
    </div>
  );
}
