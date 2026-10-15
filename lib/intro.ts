/** sessionStorage key: the opening has played in this tab session. */
export const INTRO_KEY = "fresca-intro-played";

/**
 * Runs before first paint (inlined in <head>). With motion allowed, on the
 * first visit per session, it adds `intro`: the navy field and the centered
 * wordmark are the first painted frame. If the page script never takes over,
 * the class drops after 6s so a failed load still shows the page.
 */
export const introScript = `try{var d=document.documentElement;if(!matchMedia('(prefers-reduced-motion: reduce)').matches){if(!sessionStorage.getItem('${INTRO_KEY}')){d.classList.add('intro');setTimeout(function(){if(!window.__introTakenOver)d.classList.remove('intro')},6000)}}}catch(e){}`;

declare global {
  interface Window {
    __introTakenOver?: boolean;
  }
}

export function introIsPlaying() {
  return typeof document !== "undefined" && document.documentElement.classList.contains("intro");
}
