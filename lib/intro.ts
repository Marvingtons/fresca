/** sessionStorage key: the intro has played in this tab session. */
export const INTRO_KEY = "fresca-intro-played";

/**
 * Runs before first paint (inlined in <head>). Adds `html.intro` when the intro
 * will play, so CSS can hide the finished hero instead of flashing it, and only
 * then preloads the intro's first frame. On repeat visits and under reduced
 * motion the frame stays display:none and lazy, so it is never downloaded.
 */
export function introScript(frame: { srcSet?: string; sizes?: string }) {
  const preload = frame.srcSet
    ? `var l=document.createElement('link');l.rel='preload';l.as='image';l.setAttribute('imagesrcset',${JSON.stringify(frame.srcSet)});l.setAttribute('imagesizes',${JSON.stringify(frame.sizes ?? "100vw")});l.type='image/avif';l.setAttribute('fetchpriority','high');document.head.appendChild(l);`
    : "";
  return `try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&!sessionStorage.getItem('${INTRO_KEY}')){document.documentElement.classList.add('intro');${preload}}}catch(e){}`;
}

/** `sizes` shared by the intro frames and the preload above, so the URLs match. */
export const INTRO_SIZES = "100vw";

export function introIsPlaying() {
  return typeof document !== "undefined" && document.documentElement.classList.contains("intro");
}
