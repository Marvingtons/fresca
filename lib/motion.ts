import type { Motion } from "./gsap";

/** Media queries for gsap.matchMedia(). Animations only run under MOTION. */
export const MOTION = "(prefers-reduced-motion: no-preference)";
export const DESKTOP_MOTION = "(min-width: 861px) and (prefers-reduced-motion: no-preference)";

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Masked line reveals: every `.ln.rv` inside root slides up when it enters. */
export function revealLines(gsap: Motion["gsap"], root: Element) {
  root.querySelectorAll<HTMLElement>(".rv").forEach((line) => {
    gsap.from(line.firstElementChild, {
      yPercent: 110,
      duration: 1.2,
      ease: "power4.out",
      scrollTrigger: { trigger: line, start: "top 88%" },
    });
  });
}
