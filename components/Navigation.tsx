"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cta, founder, navLinks, site } from "@/content/site";
import { useSmoothScroll } from "./SmoothScroll";

// Header and menu colors from the proposed brand palette (CLAUDE.md), used here only.
// Ivory #F3EFE8, ink #2A2521.

/** True once the hero has scrolled out from under the header (always true without a hero). */
function usePastHero(headerRef: React.RefObject<HTMLElement | null>) {
  const [past, setPast] = useState(false);
  useEffect(() => {
    const hero = document.getElementById("top");
    if (!hero) {
      setPast(true);
      return;
    }
    // A scroll check rather than an IntersectionObserver, so a scroll position the
    // browser restores on reload is picked up straight away too.
    const measure = () => setPast(hero.getBoundingClientRect().bottom <= (headerRef.current?.offsetHeight ?? 0));
    // At most one measurement per frame, however many scroll events arrive.
    let frame = 0;
    const check = () => {
      if (!frame)
        frame = requestAnimationFrame(() => {
          frame = 0;
          measure();
        });
    };
    measure();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    window.addEventListener("load", check);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
      window.removeEventListener("load", check);
    };
  }, [headerRef]);
  return past;
}

/** Index of the menu link for the section under the upper part of the viewport, or -1 (the hero). */
function currentSection() {
  const y = window.innerHeight * 0.4;
  return navLinks.findIndex((link) => {
    // Menu links are in-page anchors (#id); anything else matches nothing.
    const r = link.href.startsWith("#") ? document.getElementById(link.href.slice(1))?.getBoundingClientRect() : undefined;
    return !!r && r.top <= y && r.bottom > y;
  });
}

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

const contactRows = [
  { label: "Studio", value: site.location },
  { label: "Email", value: site.email, href: `mailto:${site.email}` },
  { label: "Phone", value: site.phone.label, href: site.phone.href },
  { label: "Instagram", value: `@${site.instagram.handle}`, href: site.instagram.href },
];

export default function Navigation() {
  const [open, setOpen] = useState(false);
  // The link shown at full strength: the hovered or focused one, else the current section's.
  // Faded text is ink at 55% for the large link words (3.4:1) and 68% for 11px type (5:1),
  // the lowest steps that pass WCAG AA contrast on ivory with a little margin.
  const [current, setCurrent] = useState(-1);
  const [pointed, setPointed] = useState<number | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { stop, start } = useSmoothScroll();
  const solid = usePastHero(headerRef);

  const openMenu = () => {
    setCurrent(currentSection());
    setPointed(null);
    setOpen(true);
    stop();
    document.documentElement.style.overflow = "hidden";
  };

  // Runs synchronously from a link click, so scrolling is unlocked before the
  // smooth-scroll handler moves to the section.
  const closeMenu = useCallback(
    (returnFocus: boolean) => {
      setOpen(false);
      document.documentElement.style.overflow = "";
      start();
      if (returnFocus) headerRef.current?.querySelector<HTMLElement>(".menu")?.focus();
    },
    [start],
  );

  // While open: Escape closes, and Tab cycles through the header row and the menu.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeMenu(true);
        return;
      }
      if (e.key !== "Tab" || !menuRef.current || !headerRef.current) return;
      const items = [
        ...headerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
        ...menuRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ];
      const first = items[0];
      const last = items[items.length - 1];
      const i = items.indexOf(document.activeElement as HTMLElement);
      if (e.shiftKey && i <= 0) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (i === -1 || i === items.length - 1)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, closeMenu]); // closeMenu is a stable useCallback, so this re-subscribes only on open

  // Ink type whenever the header sits on ivory: past the hero, or over the open menu.
  const ink = solid || open;
  const active = pointed ?? current;
  // Header links close the menu when it is open, then scroll as usual.
  const closeIfOpen = () => open && closeMenu(false);

  return (
    <>
      <header
        ref={headerRef}
        className={`site-header fixed inset-x-0 top-0 z-50 grid h-[72px] grid-cols-[1fr_auto_1fr] items-center px-6 transition-colors duration-200 motion-reduce:transition-none md:h-[88px] md:px-12 ${
          ink ? "text-[#2A2521]" : "text-white"
        }`}
      >
        {/* Scrim over the hero, so the header reads on bright photos. */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-0 top-0 -z-10 h-[160px] bg-[linear-gradient(rgba(20,18,16,.5),rgba(20,18,16,0))] transition-opacity duration-200 motion-reduce:transition-none ${
            ink ? "opacity-0" : "opacity-100"
          }`}
        />
        {/* Ivory bar with a hairline rule, past the hero. The open menu draws its own. */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 -z-10 border-b border-[rgba(42,37,33,.12)] bg-[#F3EFE8] transition-opacity duration-200 motion-reduce:transition-none ${
            solid && !open ? "opacity-100" : "opacity-0"
          }`}
        />

        <div className="relative justify-self-start">
          {/* Pulled left so the hairlines, not the hit area, line up with the side padding. */}
          <button
            type="button"
            className="menu -ml-[10px] grid h-11 w-11 cursor-pointer place-items-center"
            aria-label="Menu"
            aria-expanded={open}
            aria-controls="menu"
            onClick={() => (open ? closeMenu(true) : openMenu())}
          >
            <svg
              viewBox="0 0 36 36"
              width="36"
              height="36"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path className="l1" d="M6 15H30" />
              <path className="l2" d="M6 21H30" />
            </svg>
          </button>
          {/* Visual label beside the open icon. Outside the button so its accessible name stays
              "Menu" (with aria-expanded); clicking the word closes too, keyboard users have the button. */}
          <span
            aria-hidden="true"
            onClick={() => closeMenu(true)}
            className={`absolute left-[34px] top-1/2 flex h-11 -translate-y-1/2 cursor-pointer items-center whitespace-nowrap font-outfit text-[12px] font-normal uppercase leading-none tracking-[.2em] transition-opacity duration-200 motion-reduce:transition-none ${
              open ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            Close
          </span>
        </div>

        {/* TODO(logo): replace this text with the SVG lockups once they are in the repo:
            assets/brand/fresca-lockup-horizontal.svg in white, 40px tall (30px on phones),
            and assets/brand/fresca-mark.svg alone at 34px under 480px. */}
        <a
          href="#top"
          aria-label="Fresca Interior Design, home"
          onClick={closeIfOpen}
          className="inline-flex min-h-[44px] items-center font-cormorant text-[26px] font-medium uppercase leading-none tracking-[.22em] no-underline [margin-right:-.22em]"
        >
          Fresca
        </a>

        <a href={cta.href} onClick={closeIfOpen} className="cta-link justify-self-end inline-flex min-h-[44px] items-center no-underline">
          <span className="relative pb-[3px] font-outfit text-[12px] font-normal uppercase leading-none tracking-[.2em]">
            <span className="max-sm:hidden">{cta.label}</span>
            <span className="sm:hidden">{cta.short}</span>
          </span>
        </a>
      </header>

      {/* Same rows and side padding as the header, so the header row lines up with it exactly. */}
      <div
        ref={menuRef}
        id="menu"
        role="region"
        aria-label="Menu"
        inert={!open}
        data-open={open}
        className="menu-panel fixed inset-0 z-40 grid grid-rows-[72px_minmax(0,1fr)_72px] bg-[#F3EFE8] font-outfit text-[#2A2521] md:grid-rows-[88px_minmax(0,1fr)_72px]"
      >
        <div aria-hidden="true" className="border-b border-[rgba(42,37,33,.14)]" />

        <div className="overflow-y-auto px-6 md:px-12">
          <div className="grid min-h-full content-center gap-12 py-10 min-[1024px]:grid-cols-2 min-[1024px]:items-center">
            <nav aria-label="Main">
              <ul onMouseLeave={() => setPointed(null)}>
                {navLinks.map((link, i) => (
                  <li key={link.href} className="menu-item" style={{ "--i": i } as React.CSSProperties}>
                    <a
                      href={link.href}
                      aria-current={i === current ? "location" : undefined}
                      onClick={() => closeMenu(false)}
                      onMouseEnter={() => setPointed(i)}
                      onFocus={() => setPointed(i)}
                      onBlur={() => setPointed(null)}
                      className="grid h-16 w-max grid-cols-[48px_auto] items-center no-underline min-[1024px]:h-[84px]"
                    >
                      <span
                        className={`text-[11px] leading-none tracking-[.16em] transition-opacity duration-200 motion-reduce:transition-none ${
                          i === active ? "opacity-100" : "opacity-[.68]"
                        }`}
                      >{String(i + 1).padStart(2, "0")}</span>
                      <span
                        className={`font-cormorant text-[clamp(40px,9vw,56px)] font-medium leading-none transition-opacity duration-200 motion-reduce:transition-none min-[1024px]:text-[64px] ${
                          i === active ? "italic opacity-100" : "opacity-[.55]"
                        }`}
                      >
                        {link.label}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <dl className="menu-table w-full border-b border-[rgba(42,37,33,.14)] min-[1024px]:max-w-[420px] min-[1024px]:justify-self-end">
              {contactRows.map((row) => (
                <div key={row.label} className="grid grid-cols-[120px_1fr] items-baseline border-t border-[rgba(42,37,33,.14)] py-[18px]">
                  <dt className="text-[11px] uppercase leading-none tracking-[.16em] opacity-[.68]">{row.label}</dt>
                  <dd className="text-[13px] leading-[1.4]">
                    {row.href ? (
                      <a
                        href={row.href}
                        className="underline decoration-[rgba(42,37,33,.35)] decoration-1 underline-offset-[3px] transition-[text-decoration-color] duration-200 hover:decoration-current"
                      >
                        {row.value}
                      </a>
                    ) : (
                      row.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="menu-foot flex flex-col justify-center gap-2 border-t border-[rgba(42,37,33,.14)] px-6 text-[11px] uppercase leading-none tracking-[.14em] opacity-[.68] md:px-12 min-[1024px]:flex-row min-[1024px]:items-center min-[1024px]:justify-between">
          <p>{site.legalName}</p>
          <p>
            {founder.name}, {founder.role}
          </p>
        </div>
      </div>
    </>
  );
}
