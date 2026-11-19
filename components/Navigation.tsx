"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cta, navLinks, site } from "@/content/site";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { useSmoothScroll } from "./SmoothScroll";

function Wordmark({ label }: { label?: string }) {
  return (
    <a href="#top" aria-label={label} className="flex flex-col leading-none no-underline">
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

  // While open: focus the close button and close on Escape.
  useEffect(() => {
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
      {/* Difference blend keeps the header legible on any background. */}
      <header className="site-header pointer-events-none fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-4 px-pad py-5 text-white mix-blend-difference [&>*]:pointer-events-auto">
        <Wordmark label="Fresca Interior Design, home" />
        <div className="flex items-center gap-2.5">
          <button
            ref={menuBtnRef}
            type="button"
            className="hbtn"
            aria-expanded={open}
            aria-controls="menu"
            onClick={openMenu}
          >
            <i aria-hidden="true" className="block h-px w-4 -translate-y-0.5 bg-current shadow-[0_5px_0_currentColor]" />
            Menu
          </button>
          <a className="hbtn max-md:hidden" href={cta.href}>
            {cta.label}
          </a>
        </div>
      </header>

      <div
        ref={menuRef}
        id="menu"
        inert={!open}
        className={`fixed inset-0 z-[60] flex flex-col bg-ink px-pad pb-8 pt-5 text-ground transition-[clip-path] duration-[900ms] ease-curtain ${
          open ? "[clip-path:inset(0_0_0_0)]" : "[clip-path:inset(0_0_100%_0)]"
        }`}
      >
        <div className="flex items-center justify-between">
          <Wordmark />
          <button ref={closeBtnRef} type="button" className="hbtn" onClick={() => closeMenu(true)}>
            Close
          </button>
        </div>
        <nav aria-label="Main" className="flex flex-1 flex-col justify-center gap-1 py-10">
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
          <a className="no-underline" href={site.phone.href}>
            {site.phone.label}
          </a>
          <a className="no-underline" href={`mailto:${site.email}`}>
            {site.email}
          </a>
        </div>
      </div>
    </>
  );
}
