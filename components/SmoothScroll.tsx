"use client";

import Lenis from "lenis";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { introIsPlaying } from "@/lib/intro";
import { prefersReducedMotion } from "@/lib/motion";

type ScrollApi = {
  /** Smooth-scroll to an element, a selector like "#faq", or a y position. */
  scrollTo: (target: string | HTMLElement | number) => void;
  /** Pause / resume scrolling (intro, open menu). */
  stop: () => void;
  start: () => void;
};

const ScrollContext = createContext<ScrollApi>({ scrollTo: () => {}, stop: () => {}, start: () => {} });

export const useSmoothScroll = () => useContext(ScrollContext);

/** Where an anchor link should land. #work lands at the end of the showcase's opening animation. */
function destination(el: HTMLElement) {
  if (el.id === "work" && !prefersReducedMotion()) {
    const top = el.getBoundingClientRect().top + window.scrollY;
    return top + el.offsetHeight - window.innerHeight;
  }
  return el;
}

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    let lenis: Lenis | null = null;
    let tick: ((time: number) => void) | null = null;

    if (!prefersReducedMotion()) {
      lenis = new Lenis({ lerp: 0.09, autoRaf: false });
      lenis.on("scroll", ScrollTrigger.update);
      tick = (time: number) => lenis!.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      if (introIsPlaying()) lenis.stop();
      lenisRef.current = lenis;
    }

    // Recalculate trigger positions once fonts and images have settled.
    let timer: number | undefined;
    const refresh = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => ScrollTrigger.refresh(), 150);
    };
    const onLoadCapture = (e: Event) => {
      if (e.target instanceof HTMLImageElement) refresh();
    };
    document.fonts?.ready.then(refresh);
    if (document.readyState === "complete") refresh();
    else window.addEventListener("load", refresh, { once: true });
    document.addEventListener("load", onLoadCapture, true);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("load", refresh);
      document.removeEventListener("load", onLoadCapture, true);
      if (tick) gsap.ticker.remove(tick);
      lenis?.destroy();
      lenisRef.current = null;
    };
  }, []);

  const scrollTo = useCallback((target: string | HTMLElement | number) => {
    const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
    if (el == null) return;
    const dest = typeof el === "number" ? el : destination(el);
    if (lenisRef.current) lenisRef.current.scrollTo(dest, { duration: 1.6 });
    else if (typeof dest === "number") window.scrollTo({ top: dest });
    else dest.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }, []);

  // Every in-page link (#section) goes through scrollTo.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element).closest?.('a[href^="#"]');
      const hash = a?.getAttribute("href");
      if (!hash || hash.length < 2) return;
      const el = document.getElementById(hash.slice(1));
      if (!el) return;
      e.preventDefault();
      scrollTo(el);
      // Move focus too (skip link, keyboard users), without a second scroll jump.
      if (el.hasAttribute("tabindex")) el.focus({ preventScroll: true });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [scrollTo]);

  const api = useMemo<ScrollApi>(
    () => ({
      scrollTo,
      stop: () => lenisRef.current?.stop(),
      start: () => lenisRef.current?.start(),
    }),
    [scrollTo],
  );

  return <ScrollContext.Provider value={api}>{children}</ScrollContext.Provider>;
}
