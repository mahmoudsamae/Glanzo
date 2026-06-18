"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import {
  isBookNavLink,
  navHrefTarget,
  resolveNavLinks,
  type NavLink,
} from "@/lib/minisite/about-blocks";
import type { MinisiteContent } from "@/lib/validations/public-shop";

import { shopMediaPublicUrl } from "../../lib/media-url";

type BoutiqueNavProps = {
  shopName: string;
  content: MinisiteContent;
  bookHref: string;
  preview?: boolean;
  basePath?: string;
};

function scrollToAnchor(href: string) {
  const id = href.startsWith("#") ? href.slice(1) : href;
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function resolvePageHref(href: string | undefined, basePath: string): string | null {
  if (!href || href === "__book__") return null;
  if (!href.startsWith("#")) return null;
  const anchor = href.slice(1);
  if (anchor === "ms-boutique-top") return basePath;
  if (anchor === "ms-boutique-about") return `${basePath}/about`;
  if (anchor === "ms-boutique-prices" || anchor === "ms-boutique-services") return `${basePath}/leistungen`;
  return `${basePath}${href}`;
}

export function BoutiqueNav({ shopName, content, bookHref, preview = false, basePath }: BoutiqueNavProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("ms-boutique-top");
  const pathname = usePathname();
  const logoUrl = content.logo_path ? shopMediaPublicUrl(content.logo_path) : null;
  const links = useMemo(() => resolveNavLinks(content), [content]);

  const scrollLinks = useMemo(
    () =>
      links.filter((link) => !isBookNavLink(link)).map((link) => ({
        ...link,
        targetId: navHrefTarget(link.href, "ms-boutique-about"),
      })),
    [links],
  );

  useEffect(() => {
    if (basePath) return;
    const sections = scrollLinks
      .map((link) => document.getElementById(link.targetId))
      .filter(Boolean);
    if (sections.length === 0) {
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) {
          setActive(visible.target.id);
        }
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.2, 0.5] },
    );

    sections.forEach((section) => io.observe(section!));
    return () => io.disconnect();
  }, [scrollLinks, basePath]);

  function isLinkActive(link: NavLink): boolean {
    if (isBookNavLink(link)) return false;
    if (basePath) {
      const pageHref = resolvePageHref(link.href, basePath);
      if (!pageHref) return false;
      if (pageHref === basePath) return pathname === basePath;
      return pathname.startsWith(pageHref);
    }
    const targetId = navHrefTarget(link.href, "ms-boutique-about");
    return active === targetId;
  }

  function onNav(link: NavLink) {
    setOpen(false);
    if (isBookNavLink(link)) return;
    if (!basePath) {
      scrollToAnchor(link.href ?? "#ms-boutique-about");
    }
  }

  function renderLink(link: NavLink, className: string) {
    const activeClass = isLinkActive(link) ? "ms-boutique-nav-link--active" : "";

    if (isBookNavLink(link)) {
      return preview ? (
        <span className={`${className} ms-boutique-nav-cta`}>{link.label}</span>
      ) : (
        <Link href={bookHref} className={`${className} ms-boutique-nav-cta`}>
          {link.label}
        </Link>
      );
    }

    if (basePath) {
      const pageHref = resolvePageHref(link.href, basePath);
      if (pageHref) {
        return (
          <Link href={pageHref} className={`${className} ${activeClass}`} onClick={() => setOpen(false)}>
            {link.label}
          </Link>
        );
      }
    }

    return (
      <button type="button" className={`${className} ${activeClass}`} onClick={() => onNav(link)}>
        {link.label}
      </button>
    );
  }

  return (
    <header className="ms-boutique-nav sticky top-0 z-40">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-[var(--space-3)] px-[var(--space-4)] py-[var(--space-3)]">
        {basePath ? (
          <Link
            href={basePath}
            className="ms-boutique-nav-brand flex min-w-0 items-center gap-[var(--space-2)] text-left"
          >
            {logoUrl ? (
              <span className="relative block size-9 shrink-0 overflow-hidden rounded-full border border-[color:var(--ms-accent)]">
                <Image src={logoUrl} alt="" fill sizes="36px" className="object-cover" />
              </span>
            ) : (
              <span className="ms-boutique-about-sparkle shrink-0 text-[color:var(--ms-accent)]" aria-hidden>
                ✦
              </span>
            )}
            <span className="min-w-0 truncate">
              <span className="block font-display text-sm uppercase tracking-[0.18em] text-[color:var(--ms-boutique-nav-text)]">
                {shopName}
              </span>
            </span>
          </Link>
        ) : (
          <button
            type="button"
            className="ms-boutique-nav-brand flex min-w-0 items-center gap-[var(--space-2)] text-left"
            onClick={() => scrollToAnchor("#ms-boutique-top")}
          >
            {logoUrl ? (
              <span className="relative block size-9 shrink-0 overflow-hidden rounded-full border border-[color:var(--ms-accent)]">
                <Image src={logoUrl} alt="" fill sizes="36px" className="object-cover" />
              </span>
            ) : (
              <span className="ms-boutique-about-sparkle shrink-0 text-[color:var(--ms-accent)]" aria-hidden>
                ✦
              </span>
            )}
            <span className="min-w-0 truncate">
              <span className="block font-display text-sm uppercase tracking-[0.18em] text-[color:var(--ms-boutique-nav-text)]">
                {shopName}
              </span>
            </span>
          </button>
        )}

        <button
          type="button"
          className="ms-boutique-nav-menu-btn lg:hidden"
          aria-expanded={open}
          aria-label="Menü"
          onClick={() => setOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className="hidden items-center gap-[var(--space-3)] lg:flex" aria-label="Hauptnavigation">
          {links.map((link) => (
            <span key={link.id}>{renderLink(link, "ms-boutique-nav-link")}</span>
          ))}
        </nav>
      </div>

      {open ? (
        <nav className="ms-boutique-nav-drawer lg:hidden" aria-label="Mobile Navigation">
          {links.map((link) => (
            <span key={link.id}>
              {isBookNavLink(link)
                ? renderLink(link, "ms-boutique-nav-drawer-link ms-boutique-nav-cta ms-boutique-nav-cta--block")
                : renderLink(link, "ms-boutique-nav-drawer-link")}
            </span>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
