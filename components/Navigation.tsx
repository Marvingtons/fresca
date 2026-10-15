"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cta, navLinks, site } from "@/content/site";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { useSmoothScroll } from "./SmoothScroll";
import Copy from "./Placeholder";

function Wordmark({ label, className = "" }: { label?: string; className?: string }) {
  return (
    <a href="#top" aria-label={label} className={`flex flex-col leading-none no-underline ${className}`}>
      <b className="font-serif text-[32px] font-normal italic">Fresca</b>{" "}
      <span className="mt-[3px] text-[9px] uppercase tracking-[.36em]">Interior Design</span>
    </a>
  );
}

export default function Navigation() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const { stop, start } = useSmoothScroll();
  const { contextSafe } = useGSAP({ scope: menuRef });
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const animateLinks = contextSafe(() => {
    if (prefersReducedMotion()) return;
    gsap.fromTo(".menu-link", { yPercent: 110 }, { yPercent: 0, duration: 0.9, stagger: 0.06, ease: "power3.out", delay: 0.25 });
  });

  const openMenu = () => {
    setOpen(true);
    stop();
    animateLinks();
  };

  const closeMenu = useCallback(
    (returnFocus: boolean) => {
      setOpen(false);
      start();
      if (returnFocus) menuBtnRef.current?.focus();
    },
    [start],
  );

  // React 18 has no `inert` prop; keep the attribute in sync by hand.
  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;
    menu.inert = !open;
    if (!open) return;
    const t = window.setTimeout(() => closeBtnRef.current?.focus(), 300);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu(true);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, closeMenu]);

  return (
    <>
      {/* Solid cream bar: readable at the top of the page and over the dark sections.
          A hairline appears once the page has scrolled. */}
      <header
        data-scrolled={scrolled || undefined}
        className="site-header fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-6 border-b border-transparent bg-ground px-pad py-4 text-ink transition-colors duration-300 data-[scrolled]:border-line"
      >
        <Wordmark label="Fresca Interior Design, home" className="wordmark" />
        <nav aria-label="Main" className="flex items-center gap-[clamp(20px,2.6vw,40px)] max-md:hidden">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="nav-link text-sm">
              {link.label}
            </a>
          ))}
          <a href={cta.href} className="nav-cta text-sm">
            {cta.label}
          </a>
        </nav>
        <button
          ref={menuBtnRef}
          type="button"
          className="hbtn md:hidden"
          aria-expanded={open}
          aria-controls="menu"
          onClick={openMenu}
        >
          <i aria-hidden="true" className="block h-px w-4 -translate-y-0.5 bg-current shadow-[0_5px_0_currentColor]" />
          Menu
        </button>
      </header>

      <div
        ref={menuRef}
        id="menu"
        // Rendered inert on the server too, before the effect above runs. React 18
        // only renders the attribute from a string, though the types say boolean.
        {...({ inert: "" } as object)}
        className={`fixed inset-0 z-[60] flex flex-col bg-navy px-pad pb-8 pt-5 text-ground transition-[clip-path] duration-[900ms] ease-curtain ${
          open ? "[clip-path:inset(0_0_0_0)]" : "[clip-path:inset(0_0_100%_0)]"
        }`}
      >
        <div className="flex items-center justify-between">
          <Wordmark />
          <button ref={closeBtnRef} type="button" className="hbtn" onClick={() => closeMenu(true)}>
            Close
          </button>
        </div>
        <nav aria-label="Menu" className="flex flex-1 flex-col justify-center gap-1 py-10">
          {navLinks.map((link, i) => (
            <span key={link.href} className="ln">
              <a
                href={link.href}
                onClick={() => closeMenu(false)}
                className="menu-link flex w-max items-baseline gap-6 font-serif text-[clamp(48px,8vw,112px)] leading-none no-underline hover:italic"
              >
                <small className="font-sans text-xs tracking-[.2em] text-on-dark">{String(i + 1).padStart(2, "0")}</small>
                {link.label}
              </a>
            </span>
          ))}
        </nav>
        <div className="flex flex-wrap justify-between gap-4 text-sm text-on-dark">
          <span>{site.location}</span>
          <span>
            <Copy text={site.phone.label} />
          </span>
          <span>
            <Copy text={site.email} />
          </span>
        </div>
      </div>
    </>
  );
}
