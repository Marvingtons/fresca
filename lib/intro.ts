/** sessionStorage key: the opening (veil + wordmark travel) has played in this tab session. */
export const INTRO_KEY = "fresca-intro-played";

/**
 * Runs before first paint (inlined in <head>). With motion allowed it adds:
 * - `hero-in` on every visit: the hero starts in its pre-entrance state;
 * - `intro` on the first visit per session: the veil covers the page and the
 *   nav wordmark sits centered on it, from the very first painted frame.
 * It also stamps `__introT0` (the opening's time zero, just before first paint)
 * and, if the page script never takes over, drops both classes after 6s so a
 * failed load still shows the page.
 */
export const introScript = `try{var d=document.documentElement;window.__introT0=performance.now();if(!matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('hero-in');if(!sessionStorage.getItem('${INTRO_KEY}'))d.classList.add('intro');setTimeout(function(){if(!window.__introTakenOver)d.classList.remove('intro','hero-in')},6000)}}catch(e){}`;

declare global {
  interface Window {
    __introT0?: number;
    __introTakenOver?: boolean;
  }
}

export function introIsPlaying() {
  return typeof document !== "undefined" && document.documentElement.classList.contains("intro");
}

// ───────── hooks between the opening (Navigation) and the page beneath it.
// The opening never looks inside the hero: the hero registers its own entrance,
// and the opening places it on its timeline if one is registered.

type Reveal = () => gsap.core.Timeline | null;
let heroReveal: Reveal | null = null;

/** The hero's entrance (scale, headline rise). Returns an unregister function. */
export function registerHeroReveal(build: Reveal) {
  heroReveal = build;
  return () => {
    if (heroReveal === build) heroReveal = null;
  };
}

export function buildHeroReveal() {
  return heroReveal?.() ?? null;
}

const veilGoneListeners = new Set<() => void>();

/**
 * Called once the veil has fully faded (or right away on visits without the
 * veil). Unused for now: when the hero holds a video, it shows the poster during
 * the opening and calls `video.play()` from here, so playback starts on the
 * frame the veil is gone. Returns an unsubscribe function.
 */
export function onVeilGone(listener: () => void) {
  veilGoneListeners.add(listener);
  return () => {
    veilGoneListeners.delete(listener);
  };
}

export function notifyVeilGone() {
  veilGoneListeners.forEach((listener) => listener());
}
