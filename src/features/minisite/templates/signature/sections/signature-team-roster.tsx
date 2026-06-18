import type { ShopPublicData } from "@/lib/validations/public-shop";

import { orderTeamMembers } from "../../../lib/team-order";
import { BookCta } from "../../../sections/book-cta";

import { SignatureSectionShell } from "../signature-section-shell";

type SignatureTeamRosterProps = {
  data: ShopPublicData;
  bookHrefBase: string;
  preview?: boolean;
};

function memberInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function SignatureTeamRoster({ data, bookHrefBase, preview = false }: SignatureTeamRosterProps) {
  if (data.minisite.content.show?.team === false) {
    return null;
  }

  const members = orderTeamMembers(data);
  if (members.length === 0) {
    return null;
  }

  const isSuspended = data.shop.status === "suspended";
  const gridClass =
    members.length === 1 ? "grid-cols-1" : "grid-cols-1 min-[480px]:grid-cols-2";

  return (
    <section
      id="ms-sig-team"
      aria-label="Team"
      className="ms-signature-band ms-signature-band--cream ms-signature-section ms-cinema-section px-[var(--space-4)] py-[var(--space-10)]"
    >
      <SignatureSectionShell>
        <header className="mb-[var(--space-6)] text-center">
          <p className="ms-signature-eyebrow">Meister</p>
          <h2 className="font-display text-2xl text-[color:var(--ms-text)]">Unser Team</h2>
        </header>

        <ul className={`ms-cinema-cascade grid gap-[var(--space-4)] ${gridClass}`}>
          {members.map((member, index) => (
            <li
              key={member.membership_id}
              className="ms-signature-team-card ms-cinema-team-card"
              style={{ ["--cascade-i" as string]: index }}
            >
              <div className="ms-signature-card ms-signature-team-inner ms-cinema-team-inner flex h-full flex-col items-center gap-[var(--space-4)] text-center">
                <div className="ms-signature-team-avatar">{memberInitials(member.display_name)}</div>
                <p className="font-display text-lg text-[color:var(--ms-text)]">{member.display_name}</p>
                {preview ? (
                  <span className="text-sm text-[color:var(--ms-text-muted)]">Termin buchen</span>
                ) : (
                  <BookCta
                    href={`${bookHrefBase}&barber=${member.membership_id}`}
                    label="Termin buchen"
                    suspended={isSuspended}
                    cinema
                    className="ms-signature-book-cta rounded-full text-sm"
                  />
                )}
              </div>
            </li>
          ))}
        </ul>
      </SignatureSectionShell>
    </section>
  );
}
