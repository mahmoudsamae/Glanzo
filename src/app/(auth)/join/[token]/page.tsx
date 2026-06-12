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
      <AuthShell title="Invite unavailable" subtitle="This link may have expired or already been used.">
        <p className="text-sm text-[var(--text-2)]">
          Ask the shop owner for a new invite link.
        </p>
        <p className="mt-[var(--space-4)] text-sm">
          <AuthLink href="/login">Sign in</AuthLink>
        </p>
      </AuthShell>
    );
  }

  if (!actor) {
    return (
      <AuthShell
        title={`Join ${summary.data.shopName}`}
        subtitle={`You've been invited as ${summary.data.role}.`}
      >
        <p className="text-sm text-[var(--text-2)]">
          Sign in or create an account to accept this invite.
        </p>
        <div className="mt-[var(--space-6)] flex flex-col gap-[var(--space-3)]">
          <Link
            href={`/login?next=${encodeURIComponent(next)}`}
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-[var(--space-4)] text-md font-medium text-primary-foreground"
          >
            Sign in
          </Link>
          <Link
            href={`/register?next=${encodeURIComponent(next)}`}
            className="text-center text-sm text-[var(--brass)] underline-offset-4 hover:underline"
          >
            Create account
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={`Join ${summary.data.shopName}`}
      subtitle={`Accept invitation as ${summary.data.role}.`}
    >
      <JoinInvitePanel token={token} shopName={summary.data.shopName} />
    </AuthShell>
  );
}
