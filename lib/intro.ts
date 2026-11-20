/** sessionStorage key: the intro has played in this tab session. */
export const INTRO_KEY = "fresca-intro-played";

/**
 * Runs before first paint (inlined in <head>). Adds `html.intro` when the intro
 * will play, so CSS can hide the finished hero instead of flashing it.
 *
 * It also preloads whichever image is the first paint (the LCP image): the
 * intro's first frame when the intro plays, otherwise the hero poster. On
 * repeat visits and under reduced motion the frame stays display:none and lazy,
 * so it is never downloaded; during the intro the poster loads at its normal
 * priority, well before the frame opens up at 2.1s.
 */
export function introScript(frame: { srcSet: string; sizes: string }, poster: string) {
  const preload = (attrs: string) =>
    `var l=document.createElement('link');l.rel='preload';l.as='image';l.type='image/avif';l.setAttribute('fetchpriority','high');${attrs}document.head.appendChild(l);`;
  const framePreload = preload(`l.setAttribute('imagesrcset',${JSON.stringify(frame.srcSet)});l.setAttribute('imagesizes',${JSON.stringify(frame.sizes)});`);
  const posterPreload = preload(`l.href=${JSON.stringify(poster)};`);
  // If the intro has not started within INTRO_TIMEOUT (GSAP is a separate chunk,
  // lib/gsap.ts, and could be slow or fail), drop the class so the hero shows.
  const fallback = `setTimeout(function(){var h=document.documentElement;if(!h.hasAttribute('data-intro-run'))h.classList.remove('intro')},${INTRO_TIMEOUT});`;
  return `try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&!sessionStorage.getItem('${INTRO_KEY}')){document.documentElement.classList.add('intro');${framePreload}${fallback}}else{${posterPreload}}}catch(e){${posterPreload}}`;
}

/** ms the intro may wait for GSAP before the page gives up on it. */
const INTRO_TIMEOUT = 5000;

/** `sizes` shared by the intro frames and the preload above, so the URLs match. */
export const INTRO_SIZES = "100vw";

export function introIsPlaying() {
  return typeof document !== "undefined" && document.documentElement.classList.contains("intro");
}
