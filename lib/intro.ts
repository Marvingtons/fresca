/** sessionStorage key: the preloader has played in this tab session. */
export const INTRO_KEY = "fresca-intro-played";

/**
 * Runs before first paint (inlined in <head>). With motion allowed it adds:
 * - `hero-in` on every visit: the hero starts in its pre-entrance state;
 * - `intro` on the first visit per session: the preloader (label, 000 counter,
 *   first thumbnail) is what the first painted frame shows.
 * If the page script never takes over, both classes drop after 6s so a failed
 * load still shows the page.
 */
export const introScript = `try{var d=document.documentElement;if(!matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('hero-in');if(!sessionStorage.getItem('${INTRO_KEY}'))d.classList.add('intro');setTimeout(function(){if(!window.__introTakenOver)d.classList.remove('intro','hero-in')},6000)}}catch(e){}`;

declare global {
  interface Window {
    __introTakenOver?: boolean;
  }
}

export function introIsPlaying() {
  return typeof document !== "undefined" && document.documentElement.classList.contains("intro");
}
