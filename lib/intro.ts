/** sessionStorage key: the opening has played in this tab session. */
export const INTRO_KEY = "fresca-intro-played";

/**
 * Runs before first paint (inlined in <head>). With motion allowed, on the
 * first visit per session, it adds `intro`: the preloader (ivory field, label,
 * 000 counter and the first still) is the first painted frame. If the page
 * script never takes over, the class drops after 6s so a failed load still
 * shows the page.
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

// ───────── opening done: the preloader has swapped to the poster (or there was none).
// The hero video waits for this so its first frame is the first one seen.

let openingDone = false;
const openingDoneListeners = new Set<() => void>();

/** Called by the preloader at the swap to the poster (and again, harmlessly, on skip). */
export function markOpeningDone() {
  if (openingDone) return;
  openingDone = true;
  openingDoneListeners.forEach((listener) => listener());
  openingDoneListeners.clear();
}

/** Runs `listener` once the opening is done, right away if there is none. Returns an unsubscribe function. */
export function onOpeningDone(listener: () => void) {
  if (openingDone || !introIsPlaying()) {
    listener();
    return () => {};
  }
  openingDoneListeners.add(listener);
  return () => {
    openingDoneListeners.delete(listener);
  };
}
