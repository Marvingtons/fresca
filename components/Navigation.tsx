"use client";

import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { cta, navLinks, site } from "@/content/site";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { buildHeroReveal, INTRO_KEY, notifyVeilGone } from "@/lib/intro";
import { prefersReducedMotion } from "@/lib/motion";
import { useSmoothScroll } from "./SmoothScroll";
import Copy from "./Placeholder";

const Wordmark = forwardRef<HTMLAnchorElement, { label?: string; className?: string }>(function Wordmark({ label, className = "" }, ref) {
  return (
    <a ref={ref} href="#top" aria-label={label} className={`flex flex-col leading-none no-underline ${className}`}>
      {/* elementtiming: lets the browser report when the wordmark first paints. */}
      <b className="font-serif text-[32px] font-normal italic" {...{ elementtiming: "wordmark" }}>
        Fresca
      </b>{" "}
      <span className="mt-[3px] text-[9px] uppercase tracking-[.36em]">Interior Design</span>
    </a>
  );
});

/** Resolves when web fonts are ready, or after 1.5s so a slow font never blocks the page. */
const fontsReady = () => Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise((r) => window.setTimeout(r, 1500))]);

export default function Navigation() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const { stop, start } = useSmoothScroll();
  const { contextSafe } = useGSAP({ scope: menuRef });
  const [scrolled, setScrolled] = useState(false);
  const wordmarkRef = useRef<HTMLAnchorElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const restRef = useRef<HTMLDivElement>(null);

  // Opening sequence. html.intro (first visit per session, set before first
  // paint by lib/intro.ts) has the cream veil over the laid-out page and this
  // wordmark centered on it at 1.6x. After a 0.5s hold the wordmark travels to
  // its place in the bar (FLIP), the veil fades, the hero entrance plays
  // beneath it, and the rest of the bar fades in last: ~1.8s from first paint.
  // html.hero-in alone (later visits): just the hero entrance. Reduced motion:
  // neither class, so everything is final on first paint.
  useGSAP(() => {
    const html = document.documentElement;
    if (!html.classList.contains("hero-in")) {
      // Client-side return to the page: no veil, the hero entrance still plays.
      if (!prefersReducedMotion()) buildHeroReveal()?.play();
      return;
    }
    window.__introTakenOver = true;
    const veiled = html.classList.contains("intro");
    if (veiled) document.body.classList.add("scroll-lock");

    let master: gsap.core.Timeline | null = null;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      window.removeEventListener("keydown", onKey);
      if (veiled) {
        try {
          sessionStorage.setItem(INTRO_KEY, "1");
        } catch {}
        gsap.set([wordmarkRef.current, veilRef.current, restRef.current], { clearProps: "all" });
        document.body.classList.remove("scroll-lock");
        start();
      }
      html.classList.remove("intro", "hero-in");
      ScrollTrigger.refresh();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (master) master.progress(1);
      else finish();
    };
    window.addEventListener("keydown", onKey);

    let cancelled = false;
    // The headline must not reveal on fallback metrics, so nothing starts before fonts.
    fontsReady().then(() => {
      if (cancelled || done) return;
      master = gsap.timeline({ onComplete: finish });
      const hero = buildHeroReveal();

      if (!veiled) {
        if (hero) master.add(hero, 0);
        master.add(notifyVeilGone, 0);
        return;
      }

      // FLIP: First is the wordmark as CSS centers it on the veil; Last is its
      // place in the bar. Animate the inverse back to identity.
      const wm = wordmarkRef.current!;
      const first = wm.getBoundingClientRect();
      wm.style.transform = "none";
      const last = wm.getBoundingClientRect();
      wm.style.transform = "";
      gsap.set(wm, {
        x: first.left + first.width / 2 - (last.left + last.width / 2),
        y: first.top + first.height / 2 - (last.top + last.height / 2),
        scale: first.width / last.width,
        transformOrigin: "50% 50%",
      });

      // Hold until 0.5s after first paint (less whatever loading already used).
      const t = Math.max(0, 0.5 - (performance.now() - (window.__introT0 ?? 0)) / 1000);
      master
        .to(wm, { x: 0, y: 0, scale: 1, duration: 0.8, ease: "power3.inOut" }, t)
        .to(veilRef.current, { autoAlpha: 0, duration: 0.7, ease: "power1.inOut" }, t + 0.15)
        .add(notifyVeilGone, t + 0.85)
        .fromTo(restRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: "power1.out" }, t + 1);
      if (hero) master.add(hero, t + 0.15);
    });

    return () => {
      cancelled = true;
      master?.kill();
      window.removeEventListener("keydown", onKey);
    };
  }, []);

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
        {/* Opening veil: server-rendered, shown only under html.intro. The header is
            its own stacking context, so the wordmark can sit above it. */}
        <div ref={veilRef} aria-hidden="true" className="intro-veil pointer-events-none fixed inset-0 bg-ground" />
        <Wordmark ref={wordmarkRef} label="Fresca Interior Design, home" className="wordmark relative z-[1]" />
        <div ref={restRef} className="nav-rest flex items-center">
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
        </div>
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
