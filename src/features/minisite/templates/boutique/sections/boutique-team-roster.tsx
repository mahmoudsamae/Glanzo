import { BOUTIQUE_SECTION_META, getBoutiqueSectionField } from "@/lib/minisite/boutique-sections";
import type { ShopPublicData } from "@/lib/validations/public-shop";

import { orderTeamMembers } from "../../../lib/team-order";
import { BookCta } from "../../../sections/book-cta";

import { BoutiqueSectionShell } from "../boutique-section-shell";

type BoutiqueTeamRosterProps = {
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

export function BoutiqueTeamRoster({ data, bookHrefBase, preview = false }: BoutiqueTeamRosterProps) {
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

  const eyebrow = getBoutiqueSectionField(
    data.minisite.content,
    "team",
    "eyebrow",
    BOUTIQUE_SECTION_META.team.defaults.eyebrow ?? "Meister",
  );
  const title = getBoutiqueSectionField(
    data.minisite.content,
    "team",
    "title",
    BOUTIQUE_SECTION_META.team.defaults.title ?? "Unser Team",
  );

  return (
    <section
      id="ms-boutique-team"
      aria-label="Team"
      className="ms-boutique-band ms-boutique-band--cream ms-boutique-section ms-cinema-section px-[var(--space-4)] py-[var(--space-10)]"
    >
      <BoutiqueSectionShell>
        <header className="mb-[var(--space-6)] text-center">
          <p className="ms-boutique-eyebrow">{eyebrow}</p>
          <h2 className="font-display text-2xl text-[color:var(--ms-text)]">{title}</h2>
        </header>

        <ul className={`ms-cinema-cascade grid gap-[var(--space-4)] ${gridClass}`}>
          {members.map((member, index) => (
            <li
              key={member.membership_id}
              className="ms-boutique-team-card ms-cinema-team-card"
              style={{ ["--cascade-i" as string]: index }}
            >
              <div className="ms-boutique-card ms-boutique-team-inner ms-cinema-team-inner flex h-full flex-col items-center gap-[var(--space-4)] text-center">
                <div className="ms-boutique-team-avatar">{memberInitials(member.display_name)}</div>
                <p className="font-display text-lg text-[color:var(--ms-text)]">{member.display_name}</p>
                {preview ? (
                  <span className="text-sm text-[color:var(--ms-text-muted)]">Termin buchen</span>
                ) : (
                  <BookCta
                    href={`${bookHrefBase}&barber=${member.membership_id}`}
                    label="Termin buchen"
                    suspended={isSuspended}
                    cinema
                    className="ms-boutique-book-cta rounded-full text-sm"
                  />
                )}
              </div>
            </li>
          ))}
        </ul>
      </BoutiqueSectionShell>
    </section>
  );
}
