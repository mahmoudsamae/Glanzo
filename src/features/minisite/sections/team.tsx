import type { ShopPublicData } from "@/lib/validations/public-shop";

import { orderTeamMembers } from "../lib/team-order";

import { BookCta } from "./book-cta";

type TeamProps = {
  data: ShopPublicData;
  bookHrefBase: string;
  preview?: boolean;
};

export function TeamSection({ data, bookHrefBase, preview = false }: TeamProps) {
  if (data.minisite.content.show?.team === false) {
    return null;
  }

  const members = orderTeamMembers(data);
  if (members.length === 0) {
    return null;
  }

  const isSuspended = data.shop.status === "suspended";

  return (
    <section
      aria-label="Team"
      className="ms-cinema-section px-[var(--space-4)] py-[var(--space-8)]"
    >
      <div className="mx-auto flex w-full max-w-lg flex-col gap-[var(--space-6)]">
        <h2 className="text-center font-display text-xl text-[color:var(--ms-text)]">Team</h2>
        <ul className="ms-cinema-cascade flex flex-col gap-[var(--space-3)]">
          {members.map((member, index) => (
            <li
              key={member.membership_id}
              className="ms-cinema-team-card"
              style={{ ["--cascade-i" as string]: index }}
            >
              <div className="ms-cinema-team-inner flex items-center justify-between gap-[var(--space-4)] rounded-md border border-[color:var(--ms-border-subtle)] bg-[color:var(--ms-bg-elevated)] px-[var(--space-4)] py-[var(--space-4)]">
                <span className="font-display text-md text-[color:var(--ms-text)]">
                  {member.display_name}
                </span>
                {preview ? (
                  <span className="text-sm text-[color:var(--ms-text-muted)]">Buchen</span>
                ) : (
                  <BookCta
                    href={`${bookHrefBase}&barber=${member.membership_id}`}
                    label={`Buchen bei ${member.display_name.split(" ")[0] ?? member.display_name}`}
                    suspended={isSuspended}
                    className="ms-cinema-team-cta !px-[var(--space-4)] !py-[var(--space-2)] text-sm"
                  />
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
