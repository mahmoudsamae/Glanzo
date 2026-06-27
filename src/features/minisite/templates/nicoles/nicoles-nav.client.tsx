"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import {
  navHrefTarget,
  type NavLink,
} from "@/lib/minisite/about-blocks";
import { resolveEffectiveNavLinks } from "@/lib/minisite/nav-links";
import { getMinisiteAnchors } from "@/lib/minisite/template-anchors";
import type { MinisiteContent, MinisiteTemplate } from "@/lib/validations/public-shop";

import { shopMediaPublicUrl } from "../../lib/media-url";
import { NicolesLogoIcon } from "./nicoles-logo-icon";

type NicolesNavProps = {
  shopName: string;
  content: MinisiteContent;
  bookHref: string;
  preview?: boolean;
  basePath?: string;
  template?: MinisiteTemplate;
};

function scrollToAnchor(href: string) {
  const id = href.startsWith("#") ? href.slice(1) : href;
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function resolvePageHref(href: string | undefined, basePath: string): string | null {
  if (!href || href === "__book__") return null;
  if (href === "/about") return `${basePath}/about`;
  if (href === "/leistungen") return `${basePath}/leistungen`;
  if (href === "/terminbuchung") return `${basePath}/terminbuchung`;
  if (href === "/kontakt") return `${basePath}/kontakt`;
  if (!href.startsWith("#")) return null;

  const anchor = href.slice(1);
  if (anchor === "ms-nicoles-top") return basePath;
  if (anchor === "ms-nicoles-about") return `${basePath}/about`;
  if (anchor === "ms-nicoles-prices" || anchor === "ms-nicoles-services") {
    return `${basePath}/leistungen`;
  }
  if (anchor === "ms-nicoles-contact") {
    return `${basePath}/kontakt`;
  }
  return `${basePath}${href}`;
}

function isTerminNavLink(link: NavLink): boolean {
  return link.href === "__book__" || link.href === "/terminbuchung";
}

export function NicolesNav({
  shopName,
  content,
  bookHref,
  preview = false,
  basePath,
  template = "nicoles",
}: NicolesNavProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const anchors = getMinisiteAnchors("nicoles");
  const [active, setActive] = useState<string>(anchors.top);
  const logoUrl = content.logo_path ? shopMediaPublicUrl(content.logo_path) : null;
  const tagline = content.sections?.nav?.text?.trim() || "friseur- & barbershop";
  const links = useMemo(() => resolveEffectiveNavLinks(template, content), [template, content]);
  const isForge = template === "forge";
  const drawerNavLinks = useMemo(
    () => links.filter((link) => !isTerminNavLink(link)),
    [links],
  );
  const drawerBookLink = useMemo(
    () => links.find((link) => isTerminNavLink(link)),
    [links],
  );

  const scrollLinks = useMemo(
    () =>
      links.filter((link) => !isTerminNavLink(link)).map((link) => ({
        ...link,
        targetId: navHrefTarget(link.href, anchors.about),
      })),
    [links, anchors.about],
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (basePath) return;

    const sections = scrollLinks
      .map((link) => document.getElementById(link.targetId))
      .filter(Boolean);
    if (sections.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.2, 0.5] },
    );

    sections.forEach((section) => io.observe(section!));
    return () => io.disconnect();
  }, [scrollLinks, basePath]);

  function isLinkActive(link: NavLink): boolean {
    if (isTerminNavLink(link)) {
      return pathname.endsWith("/terminbuchung");
    }

    if (basePath) {
      const pageHref = resolvePageHref(link.href, basePath);
      if (!pageHref) return false;
      if (pageHref === basePath) return pathname === basePath;
      const pagePath = pageHref.split("#")[0] ?? pageHref;
      if (pathname === pagePath) return true;
      return pathname.startsWith(pagePath);
    }

    if (link.href === "/about" || link.href?.endsWith("/about")) {
      return pathname.endsWith("/about");
    }
    if (link.href === "/leistungen" || link.href?.endsWith("/leistungen")) {
      return pathname.endsWith("/leistungen");
    }
    if (link.href === "/terminbuchung" || link.href?.endsWith("/terminbuchung")) {
      return pathname.endsWith("/terminbuchung");
    }
    if (link.href === "/kontakt" || link.href?.endsWith("/kontakt")) {
      return pathname.endsWith("/kontakt");
    }

    return active === navHrefTarget(link.href, anchors.about);
  }

  function onNav(link: NavLink) {
    setOpen(false);
    if (!isTerminNavLink(link) && !basePath) {
      scrollToAnchor(link.href ?? `#${anchors.about}`);
    }
  }

  function renderLink(link: NavLink, className: string) {
    const activeClass = isLinkActive(link) ? "ms-nicoles-nav-link--active" : "";

    if (isTerminNavLink(link)) {
      if (preview) {
        return <span className={`${className} ms-nicoles-nav-cta`}>{link.label}</span>;
      }

      const href =
        link.href === "__book__"
          ? bookHref
          : basePath
            ? `${basePath}/terminbuchung`
            : bookHref;
      return (
        <Link href={href} className={`${className} ms-nicoles-nav-cta`} onClick={() => setOpen(false)}>
          {link.label}
        </Link>
      );
    }

    if (basePath && !preview) {
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

  const brandInner = (
    <>
      {logoUrl ? (
        <span className="relative block size-10 shrink-0 overflow-hidden rounded-full border border-[color:var(--ms-accent)]">
          <Image src={logoUrl} alt="" fill sizes="40px" className="object-cover" />
        </span>
      ) : (
        <NicolesLogoIcon className="ms-nicoles-nav-logo-icon size-8 shrink-0 text-[color:var(--ms-nicoles-nav-text)]" />
      )}
      <span className="min-w-0 text-left">
        <span className="block font-display text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--ms-nicoles-nav-text)]">
          {shopName}
        </span>
        <span className="block text-[0.65rem] lowercase tracking-[0.06em] text-[color:color-mix(in_oklch,var(--ms-nicoles-nav-text)_78%,transparent)]">
          {tagline}
        </span>
      </span>
    </>
  );

  return (
    <header className={`ms-nicoles-nav ${scrolled ? "ms-nicoles-nav--scrolled" : ""}`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-[var(--space-3)] px-[var(--space-4)] py-[var(--space-3)]">
        {basePath && !preview ? (
          <Link
            href={basePath}
            className={`ms-nicoles-nav-brand ${scrolled ? "ms-nicoles-nav-brand--compact" : ""}`}
          >
            {brandInner}
          </Link>
        ) : (
          <button
            type="button"
            className={`ms-nicoles-nav-brand ${scrolled ? "ms-nicoles-nav-brand--compact" : ""}`}
            onClick={() => scrollToAnchor(`#${anchors.top}`)}
          >
            {brandInner}
          </button>
        )}

        <button
          type="button"
          className="ms-nicoles-nav-menu-btn lg:hidden"
          aria-expanded={open}
          aria-label="Menü"
          onClick={() => setOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className="ms-nicoles-nav-desktop hidden items-center gap-[var(--space-4)] lg:flex" aria-label="Hauptnavigation">
          {links.map((link) => (
            <span key={link.id}>{renderLink(link, "ms-nicoles-nav-link")}</span>
          ))}
        </nav>
      </div>

      {open ? (
        <nav
          className={`ms-nicoles-nav-drawer lg:hidden${isForge ? " ms-nicoles-nav-drawer--forge" : ""}`}
          aria-label="Mobile Navigation"
        >
          {isForge ? (
            <>
              <div className="ms-nicoles-nav-drawer-links">
                {drawerNavLinks.map((link) => (
                  <span key={link.id}>{renderLink(link, "ms-nicoles-nav-drawer-link")}</span>
                ))}
              </div>
              {drawerBookLink ? (
                <div className="ms-nicoles-nav-drawer-cta">
                  {renderLink(drawerBookLink, "ms-nicoles-nav-drawer-link ms-nicoles-nav-drawer-cta-btn")}
                </div>
              ) : null}
            </>
          ) : (
            links.map((link) => (
              <span key={link.id}>
                {isTerminNavLink(link)
                  ? renderLink(link, "ms-nicoles-nav-drawer-link ms-nicoles-nav-cta ms-nicoles-nav-cta--block")
                  : renderLink(link, "ms-nicoles-nav-drawer-link")}
              </span>
            ))
          )}
        </nav>
      ) : null}
    </header>
  );
}
