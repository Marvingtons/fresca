"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cta, navLinks, site } from "@/content/site";
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
    const check = () => setPast(hero.getBoundingClientRect().bottom <= (headerRef.current?.offsetHeight ?? 0));
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    window.addEventListener("load", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
      window.removeEventListener("load", check);
    };
  }, [headerRef]);
  return past;
}

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Navigation() {
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const { stop, start } = useSmoothScroll();
  const solid = usePastHero(headerRef);

  const openMenu = () => {
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
      if (returnFocus) menuBtnRef.current?.focus();
    },
    [start],
  );

  // While open: Escape closes, and Tab cycles between the menu icon and the overlay's links.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeMenu(true);
        return;
      }
      if (e.key !== "Tab" || !menuRef.current || !menuBtnRef.current) return;
      const items = [menuBtnRef.current, ...menuRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
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
  }, [open, closeMenu]);

  // Ink type whenever the header sits on ivory: past the hero, or over the open menu.
  const ink = solid || open;

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
        {/* Ivory bar with a hairline rule, past the hero. */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 -z-10 border-b border-[rgba(42,37,33,.12)] bg-[#F3EFE8] transition-opacity duration-200 motion-reduce:transition-none ${
            solid && !open ? "opacity-100" : "opacity-0"
          }`}
        />

        <div className="justify-self-start">
          {/* Pulled left so the hairlines, not the hit area, line up with the side padding. */}
          <button
            ref={menuBtnRef}
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
        </div>

        {/* TODO(logo): replace this text with the SVG lockups once they are in the repo:
            assets/brand/fresca-lockup-horizontal.svg in white, 40px tall (30px on phones),
            and assets/brand/fresca-mark.svg alone at 34px under 480px. */}
        <a
          href="#top"
          aria-label="Fresca Interior Design, home"
          inert={open}
          className="inline-flex min-h-[44px] items-center font-cormorant text-[26px] font-medium uppercase leading-none tracking-[.22em] no-underline [margin-right:-.22em]"
        >
          Fresca
        </a>

        <a
          href={cta.href}
          inert={open}
          className={`cta-link justify-self-end inline-flex min-h-[44px] items-center no-underline transition-opacity duration-200 motion-reduce:transition-none ${
            open ? "opacity-0" : ""
          }`}
        >
          <span className="relative pb-[3px] font-outfit text-[12px] font-normal uppercase leading-none tracking-[.2em]">
            <span className="max-sm:hidden">{cta.label}</span>
            <span className="sm:hidden">{cta.short}</span>
          </span>
        </a>
      </header>

      <div
        ref={menuRef}
        id="menu"
        inert={!open}
        className={`fixed inset-0 z-40 flex flex-col justify-center bg-[#F3EFE8] px-6 pb-12 pt-[72px] text-[#2A2521] transition-[opacity,visibility] duration-300 motion-reduce:transition-none md:px-12 md:pt-[88px] ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <nav aria-label="Main">
          <ul>
            {navLinks.map((link, i) => (
              <li key={link.href}>
                <a href={link.href} onClick={() => closeMenu(false)} className="flex w-max items-baseline gap-5 no-underline md:gap-8">
                  <span className="w-[4ch] font-outfit text-[12px] tracking-[.12em]">({String(i + 1).padStart(2, "0")})</span>
                  <span className="font-cormorant text-[clamp(40px,6vw,72px)] font-medium leading-[1.15]">{link.label}</span>
                </a>
              </li>
            ))}
          </ul>
          <ul className="mt-12 flex flex-col gap-1 font-outfit text-[13px]">
            <li>
              <a className="inline-flex min-h-[44px] items-center no-underline" href={`mailto:${site.email}`}>
                {site.email}
              </a>
            </li>
            <li>
              <a className="inline-flex min-h-[44px] items-center no-underline" href={site.phone.href}>
                {site.phone.label}
              </a>
            </li>
            <li>
              <a className="inline-flex min-h-[44px] items-center no-underline" href={site.instagram.href}>
                @{site.instagram.handle}
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
}
