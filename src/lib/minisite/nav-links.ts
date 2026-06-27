import type { NavLink } from "@/lib/minisite/about-blocks";
import { defaultNavLinksForTemplate } from "@/lib/minisite/template-anchors";
import type { MinisiteContent, MinisiteTemplate } from "@/lib/validations/public-shop";

/** Forge opens booking directly (?book=1) — no /terminbuchung landing page. */
export function usesDirectBookingNav(template: MinisiteTemplate): boolean {
  return template === "forge";
}

export function bookingNavHrefForTemplate(template: MinisiteTemplate): string {
  if (usesDirectBookingNav(template)) {
    return "__book__";
  }
  if (template === "nicoles") {
    return "/terminbuchung";
  }
  return "__book__";
}

export function resolveEffectiveNavLinks(
  template: MinisiteTemplate,
  content: MinisiteContent,
): NavLink[] {
  const custom =
    content.nav_links?.filter((link) => link.visible !== false && link.label.trim()) ?? [];
  const base = custom.length > 0 ? custom : defaultNavLinksForTemplate(template);

  if (!usesDirectBookingNav(template)) {
    return base;
  }

  return base.map((link) => {
    if (link.id === "nav-book" || link.href === "/terminbuchung") {
      return { ...link, href: "__book__" };
    }
    return link;
  });
}
