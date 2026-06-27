"use client";

import { Button } from "@/components/ui/button";

type AuthErrorProps = {
  reset: () => void;
};

export default function AuthError({ reset }: AuthErrorProps) {
  return (
    <div className="mx-auto flex w-full max-w-[360px] flex-1 flex-col justify-center px-[var(--space-4)] py-[var(--space-8)]">
      <h1 className="font-display text-2xl text-[var(--text-0)]">Etwas ist schiefgelaufen.</h1>
      <p className="mt-[var(--space-4)] text-base text-[var(--text-2)]">
        Diese Seite konnte nicht geladen werden.
      </p>
      <Button
        type="button"
        onClick={reset}
        className="mt-[var(--space-8)] w-full bg-primary text-primary-foreground"
      >
        Erneut versuchen
      </Button>
    </div>
  );
}
