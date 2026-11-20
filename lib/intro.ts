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
  return `try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&!sessionStorage.getItem('${INTRO_KEY}')){document.documentElement.classList.add('intro');${framePreload}}else{${posterPreload}}}catch(e){${posterPreload}}`;
}

/** `sizes` shared by the intro frames and the preload above, so the URLs match. */
export const INTRO_SIZES = "100vw";

export function introIsPlaying() {
  return typeof document !== "undefined" && document.documentElement.classList.contains("intro");
}
