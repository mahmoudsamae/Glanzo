import Link from "next/link";

import { AuthLink, AuthShell } from "@/features/auth";
import { JoinInvitePanel, fetchInviteSummaryAction } from "@/features/staff";
import { getActor } from "@/server/modules/auth/get-actor";

type JoinPageProps = {
  params: Promise<{ token: string }>;
};

export default async function JoinPage({ params }: JoinPageProps) {
  const { token } = await params;
  const summary = await fetchInviteSummaryAction(token);
  const actor = await getActor();
  const next = `/join/${token}`;

  if (!summary.ok) {
    return (
      <AuthShell title="Einladung nicht verfügbar" subtitle="Der Link ist abgelaufen oder wurde bereits genutzt.">
        <p className="text-sm text-[var(--text-2)]">
          Bitte den Salon-Inhaber um einen neuen Einladungslink bitten.
        </p>
        <p className="mt-[var(--space-4)] text-sm">
          <AuthLink href="/login">Anmelden</AuthLink>
        </p>
      </AuthShell>
    );
  }

  if (!actor) {
    return (
      <AuthShell
        title={`${summary.data.shopName} beitreten`}
        subtitle={`Du wurdest als ${summary.data.role === "owner" ? "Inhaber" : "Barber"} eingeladen.`}
      >
        <p className="text-sm text-[var(--text-2)]">
          Melde dich an oder erstelle ein Konto, um die Einladung anzunehmen.
        </p>
        <div className="mt-[var(--space-6)] flex flex-col gap-[var(--space-3)]">
          <Link
            href={`/login?next=${encodeURIComponent(next)}`}
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-[var(--space-4)] text-md font-medium text-primary-foreground"
          >
            Anmelden
          </Link>
          <Link
            href={`/register?next=${encodeURIComponent(next)}`}
            className="text-center text-sm text-[var(--brass)] underline-offset-4 hover:underline"
          >
            Konto erstellen
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={`${summary.data.shopName} beitreten`}
      subtitle={`Einladung als ${summary.data.role === "owner" ? "Inhaber" : "Barber"} annehmen.`}
    >
      <JoinInvitePanel token={token} shopName={summary.data.shopName} />
    </AuthShell>
  );
}
