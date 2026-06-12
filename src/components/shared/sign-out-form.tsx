type SignOutFormProps = {
  signOutAction: () => Promise<void>;
  className?: string;
  label?: string;
};

export function SignOutForm({
  signOutAction,
  className,
  label = "Sign out",
}: SignOutFormProps) {
  return (
    <form action={signOutAction} className={className}>
      <button
        type="submit"
        className="min-h-11 w-full rounded-md px-[var(--space-3)] py-[var(--space-2)] text-left text-base text-[var(--text-1)] transition-colors hover:bg-[var(--ink-2)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ink-1)]"
      >
        {label}
      </button>
    </form>
  );
}
