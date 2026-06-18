import type { ShopPublicData } from "@/lib/validations/public-shop";

import { orderTeamMembers } from "../../../lib/team-order";
import { BookCta } from "../../../sections/book-cta";

type FluxTeamRailProps = {
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

export function FluxTeamRail({ data, bookHrefBase, preview = false }: FluxTeamRailProps) {
  if (data.minisite.content.show?.team === false) {
    return null;
  }

  const members = orderTeamMembers(data);
  if (members.length === 0) {
    return null;
  }

  const isSuspended = data.shop.status === "suspended";

  return (
    <section aria-label="Team" className="ms-flux-section border-y border-[color:var(--ms-border-subtle)] py-[var(--space-8)]">
      <div className="mb-[var(--space-4)] px-[var(--space-4)]">
        <p className="ms-flux-kicker">Team</p>
        <h2 className="font-display text-2xl uppercase tracking-tight text-[color:var(--ms-text)]">
          Barber wählen
        </h2>
      </div>

      <div className="ms-flux-rail-scroll flex gap-[var(--space-3)] overflow-x-auto overscroll-x-contain px-[var(--space-4)] pb-[var(--space-2)]">
        {members.map((member, index) => (
          <article
            key={member.membership_id}
            className="ms-flux-team-card snap-start shrink-0"
            style={{ ["--chip-i" as string]: index }}
          >
            <div className="ms-flux-team-avatar" aria-hidden>
              {memberInitials(member.display_name)}
            </div>
            <p className="mt-[var(--space-3)] font-display text-lg uppercase leading-none text-[color:var(--ms-text)]">
              {member.display_name}
            </p>
            <p className="mt-[var(--space-2)] text-xs uppercase tracking-[0.18em] text-[color:var(--ms-text-muted)]">
              Slot #{String(index + 1).padStart(2, "0")}
            </p>
            {preview ? (
              <span className="ms-flux-team-link mt-[var(--space-4)] inline-block text-xs uppercase tracking-wider text-[color:var(--ms-accent)]">
                Buchen
              </span>
            ) : (
              <BookCta
                href={`${bookHrefBase}&barber=${member.membership_id}`}
                label="Buchen"
                suspended={isSuspended}
                className="ms-flux-team-link mt-[var(--space-4)] !rounded-none !px-[var(--space-4)] !py-[var(--space-2)] text-xs uppercase tracking-wider"
              />
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
