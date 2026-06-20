"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import { navHrefTarget, type NavLink } from "@/lib/minisite/about-blocks";
import { defaultNavLinksForTemplate, getMinisiteAnchors } from "@/lib/minisite/template-anchors";
import type { MinisiteContent } from "@/lib/validations/public-shop";

type MeccaNavProps = {
  shopName: string;
  content: MinisiteContent | null;
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

function MeccaCrownIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="ms-mecca-nav-crown">
      <path
        d="M4 17.5 6.2 8.8l3.3 2.8L12 6l2.5 5.6 3.3-2.8L20 17.5H4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 17.5h11M8 20.5h8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MeccaNav({
  shopName,
  content,
  bookHref,
  preview = false,
  basePath,
}: MeccaNavProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const anchors = getMinisiteAnchors("nicoles");
  const [active, setActive] = useState<string>(anchors.top);

  const links = useMemo(() => {
    const custom =
      content?.nav_links?.filter((link) => link.visible !== false && link.label.trim()) ?? [];
    if (custom.length > 0) {
      return custom;
    }
    return defaultNavLinksForTemplate("nicoles");
  }, [content]);

  const navLinks = useMemo(() => links.filter((link) => !isTerminNavLink(link)), [links]);

  const scrollLinks = useMemo(
    () =>
      navLinks.map((link) => ({
        ...link,
        targetId: navHrefTarget(link.href, anchors.about),
      })),
    [navLinks, anchors.about],
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
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

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  function isLinkActive(link: NavLink): boolean {
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
    if (link.href === "/kontakt" || link.href?.endsWith("/kontakt")) {
      return pathname.endsWith("/kontakt");
    }

    return active === navHrefTarget(link.href, anchors.about);
  }

  function onNav(link: NavLink) {
    setOpen(false);
    if (!basePath) {
      scrollToAnchor(link.href ?? `#${anchors.about}`);
    }
  }

  function renderLink(link: NavLink, className: string) {
    const activeClass = isLinkActive(link)
      ? className.includes("drawer")
        ? "ms-mecca-nav-drawer-link--active"
        : "ms-mecca-nav-link--active"
      : "";

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
      <MeccaCrownIcon />
      <span className="ms-mecca-nav-logo truncate">{shopName}</span>
    </>
  );

  return (
    <header className={`ms-mecca-nav ${scrolled ? "ms-mecca-nav--scrolled" : ""}`}>
      <div className="ms-mecca-nav-inner">
        {basePath && !preview ? (
          <Link href={basePath} className="ms-mecca-nav-brand" onClick={() => setOpen(false)}>
            {brandInner}
          </Link>
        ) : (
          <button
            type="button"
            className="ms-mecca-nav-brand"
            onClick={() => {
              setOpen(false);
              scrollToAnchor(`#${anchors.top}`);
            }}
          >
            {brandInner}
          </button>
        )}

        <nav className="ms-mecca-nav-desktop" aria-label="Hauptnavigation">
          {navLinks.map((link) => (
            <span key={link.id}>{renderLink(link, "ms-mecca-nav-link")}</span>
          ))}
        </nav>

        <div className="ms-mecca-nav-actions">
          {preview ? null : (
            <Link href={bookHref} scroll={false} className="ms-mecca-nav-cta">
              Buchen
            </Link>
          )}
        </div>

        <button
          type="button"
          className={`ms-mecca-nav-menu-btn ${open ? "ms-mecca-nav-menu-btn--open" : ""}`}
          aria-expanded={open}
          aria-label={open ? "Menü schließen" : "Menü öffnen"}
          onClick={() => setOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {open ? (
        <nav className="ms-mecca-nav-drawer lg:hidden" aria-label="Mobile Navigation">
          {navLinks.map((link) => (
            <span key={link.id}>{renderLink(link, "ms-mecca-nav-drawer-link")}</span>
          ))}
          {preview ? null : (
            <Link
              href={bookHref}
              scroll={false}
              className="ms-mecca-nav-cta ms-mecca-nav-cta--drawer"
              onClick={() => setOpen(false)}
            >
              Buchen
            </Link>
          )}
        </nav>
      ) : null}
    </header>
  );
}
