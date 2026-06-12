export function BookingInactive() {
  return (
    <main className="mx-auto flex min-h-[50vh] w-full max-w-md flex-col items-center justify-center gap-[var(--space-4)] px-[var(--space-4)] py-[var(--space-12)] text-center">
      <h1 className="font-display text-2xl text-[color:var(--text-0)]">Link ungültig.</h1>
      <p className="text-base text-[var(--text-2)]">
        Dieser Buchungslink ist abgelaufen oder wurde bereits verwendet.
      </p>
    </main>
  );
}
