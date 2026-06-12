export default function AuthLoading() {
  return (
    <div className="mx-auto flex w-full max-w-[360px] flex-1 flex-col justify-center px-[var(--space-4)] py-[var(--space-8)]">
      <div className="animate-[shimmer-once_1.4s_var(--ease-enter)_1] space-y-[var(--space-4)]">
        <div className="mx-auto h-8 w-40 rounded bg-[var(--ink-2)]" />
        <div className="h-4 w-56 max-w-full rounded bg-[var(--ink-2)]" />
        <div className="h-10 w-full rounded bg-[var(--ink-2)]" />
        <div className="h-10 w-full rounded bg-[var(--ink-2)]" />
        <div className="h-10 w-full rounded bg-[var(--ink-2)]" />
      </div>
    </div>
  );
}
