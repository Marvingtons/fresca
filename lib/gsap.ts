"use client";

import { useEffect, useRef, type RefObject } from "react";
import type { gsap as Gsap } from "gsap";
import type { ScrollTrigger as ScrollTriggerType } from "gsap/ScrollTrigger";

/**
 * GSAP and ScrollTrigger load after hydration, in their own chunk, so they are
 * never part of First Load JS (docs/PERF.md). Components use useMotion below
 * instead of importing gsap.
 */
export type Motion = { gsap: typeof Gsap; ScrollTrigger: typeof ScrollTriggerType };

let loading: Promise<Motion> | null = null;
let loaded: Motion | null = null;

export function loadMotion(): Promise<Motion> {
  loading ??= Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([g, st]) => {
    const { gsap } = g;
    const { ScrollTrigger } = st;
    gsap.registerPlugin(ScrollTrigger);
    // Mobile browsers resize the viewport as the address bar shows/hides; refreshing
    // on that mid-scroll makes sticky and pinned sections jump.
    ScrollTrigger.config({ ignoreMobileResize: true });
    loaded = { gsap, ScrollTrigger };
    return loaded;
  });
  return loading;
}

type Setup = (m: Motion) => void | (() => void);

/**
 * Runs `setup` once GSAP has loaded, inside a gsap.context scoped to `scope` (a
 * ref or an element id; selector text only matches inside it). Everything it
 * creates is reverted on unmount or when `dependencies` change; a function it
 * returns runs then too.
 * Returns `run`, which records later animations (event handlers) in the same
 * context, and returns false when GSAP has not loaded yet.
 */
export function useMotion(
  setup: Setup,
  { scope, dependencies = [] }: { scope?: RefObject<Element | null> | string; dependencies?: unknown[] } = {},
) {
  const ctx = useRef<gsap.Context | null>(null);
  const latest = useRef(setup);
  latest.current = setup;

  useEffect(() => {
    let cancelled = false;
    loadMotion().then((m) => {
      if (cancelled) return;
      const el = typeof scope === "string" ? document.getElementById(scope) : scope?.current;
      ctx.current = m.gsap.context(() => latest.current(m), el ?? undefined);
    });
    return () => {
      cancelled = true;
      ctx.current?.revert();
      ctx.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- like useGSAP: re-run only when `dependencies` change
  }, dependencies);

  const run = (fn: (m: Motion) => void) => {
    if (!ctx.current || !loaded) return false;
    const m = loaded;
    ctx.current.add(() => fn(m));
    return true;
  };
  return { run };
}
