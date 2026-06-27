import { describe, expect, it } from "vitest";

import {
  bookingNavHrefForTemplate,
  resolveEffectiveNavLinks,
  usesDirectBookingNav,
} from "@/lib/minisite/nav-links";

describe("nav links", () => {
  it("forge uses direct booking nav", () => {
    expect(usesDirectBookingNav("forge")).toBe(true);
    expect(bookingNavHrefForTemplate("forge")).toBe("__book__");
  });

  it("nicoles keeps terminbuchung page", () => {
    expect(bookingNavHrefForTemplate("nicoles")).toBe("/terminbuchung");
  });

  it("normalizes saved forge nav book link", () => {
    const links = resolveEffectiveNavLinks("forge", {
      nav_links: [{ id: "nav-book", label: "Terminbuchung", href: "/terminbuchung", visible: true }],
    });
    expect(links[0]?.href).toBe("__book__");
  });
});
