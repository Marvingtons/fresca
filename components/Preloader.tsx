"use client";

import { useRef } from "react";
import { preloaderStills } from "@/content/preloader";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { INTRO_KEY, markOpeningDone } from "@/lib/intro";
import { MOTION } from "@/lib/motion";
import { useSmoothScroll } from "./SmoothScroll";

/** Hold per still, in seconds, 01 → 06 (pacing accelerates); 07 holds while the counter finishes. */
const HOLDS = [0.52, 0.42, 0.34, 0.28, 0.24, 0.22];
const LAST_HOLD = 0.45;

type Still = { w: number; h: number };

/**
 * Frame geometry. The frame is a viewport-sized wrapper scaled non-uniformly to
 * (fw, fh); each still is drawn at its own "cover the viewport" size, centred,
 * and counter-scaled so it is never distorted and always covers the frame.
 * At the end of the expand both scales are exactly 1, so the last still is drawn
 * exactly as the hero poster's object-fit: cover. Self-contained so it can also
 * run inline before first paint (see BEFORE_PAINT).
 */
function geometry(vw: number, vh: number, stills: Still[]) {
  const phone = vw <= 480;
  const boxW = phone ? vw * 0.72 : Math.min(vw * 0.34, 520);
  const boxH = phone ? vh * 0.36 : Math.min(vh * 0.42, 440);
  return stills.map((s) => {
    const c = Math.max(vw / s.w, vh / s.h);
    const fit = Math.min(boxW / s.w, boxH / s.h);
    return { cw: s.w * c, ch: s.h * c, fw: s.w * fit, fh: s.h * fit };
  });
}

/** Applies the frame size (fw, fh) and the current still's counter-scale. Transforms only. */
function apply(frame: HTMLElement, img: HTMLElement, vw: number, vh: number, g: { cw: number; ch: number }, fw: number, fh: number) {
  const sx = fw / vw;
  const sy = fh / vh;
  const m = Math.max(fw / g.cw, fh / g.ch); // the still covers the frame
  frame.style.transform = `scale(${sx}, ${sy})`;
  img.style.transform = `scale(${m / sx}, ${m / sy})`;
}

// Runs inline right after the markup, before first paint: sizes every still and
// shows still 01 in its frame, so the first painted frame is final.
const BEFORE_PAINT = `try{(function(){var geometry=${geometry.toString()};var apply=${apply.toString()};var vw=innerWidth,vh=innerHeight;var g=geometry(vw,vh,${JSON.stringify(preloaderStills.map(({ w, h }) => ({ w, h })))});var f=document.querySelector('.pl-frame');var imgs=f.querySelectorAll('img');imgs.forEach(function(el,i){el.style.width=g[i].cw+'px';el.style.height=g[i].ch+'px';el.style.marginLeft=-g[i].cw/2+'px';el.style.marginTop=-g[i].ch/2+'px'});apply(f,imgs[0],vw,vh,g[0],g[0].fw,g[0].fh)})()}catch(e){}`;

/** Resolves when web fonts are ready, or after 1.5s so a slow font never blocks the page. */
const fontsReady = () => Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise((r) => window.setTimeout(r, 1500))]);

/** Resolves once two consecutive frames run under 20ms (the page may still be hydrating), or after `cap` ms. */
const quietFrames = (cap = 800) =>
  new Promise<void>((resolve) => {
    const t0 = performance.now();
    let last = t0;
    let calm = 0;
    const tick = (now: number) => {
      calm = now - last < 20 ? calm + 1 : 0;
      last = now;
      if (calm >= 2 || now - t0 > cap) resolve();
      else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

/**
 * The image-flash preloader (first visit per session, html.intro). An ivory
 * field with the label and a 000 → 100 counter; the stills cut in hard inside
 * one frame that resizes to each image; the last still (the film's first frame)
 * expands into the full-bleed hero (FLIP onto the real poster) and swaps to it
 * in the same frame. Then the nav, then the caption and the CTA. Transforms and
 * opacity only. The film is not created until the swap.
 */
export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const { start } = useSmoothScroll();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION, () => {
        const html = document.documentElement;
        if (!html.classList.contains("intro")) return;
        window.__introTakenOver = true;
        window.scrollTo(0, 0);
        document.body.classList.add("scroll-lock");

        const el = root.current!;
        const field = el.querySelector<HTMLElement>(".pl-field")!;
        const frame = el.querySelector<HTMLElement>(".pl-frame")!;
        const imgs = Array.from(frame.querySelectorAll<HTMLImageElement>("img"));
        const counter = el.querySelector<HTMLElement>(".pl-count")!;
        const fades = el.querySelectorAll(".pl-label, .pl-count");
        const poster = document.querySelector<HTMLImageElement>(".hero-poster")!;
        const header = document.querySelector(".site-header");
        const shades = document.querySelectorAll(".hero-shade-top, .hero-shade-bottom");
        const caption = document.querySelectorAll(".hero-caption");
        const cta = document.querySelectorAll(".hero-cta");

        let tl: gsap.core.Timeline | null = null;
        let done = false;
        const finish = () => {
          if (done) return;
          done = true;
          window.removeEventListener("keydown", onKey);
          try {
            sessionStorage.setItem(INTRO_KEY, "1");
          } catch {}
          gsap.set([header, shades, caption, cta], { clearProps: "all" });
          html.classList.remove("intro"); // hides the preloader, drops will-change
          document.body.classList.remove("scroll-lock");
          start();
          ScrollTrigger.refresh();
        };
        const onKey = (e: KeyboardEvent) => {
          if (e.key !== "Escape") return;
          if (tl) tl.progress(1);
          else {
            markOpeningDone();
            finish();
          }
        };
        window.addEventListener("keydown", onKey);

        let cancelled = false;
        // Every still decoded before anything moves, so nothing pops in mid-flash.
        Promise.all([fontsReady(), ...imgs.map((img) => img.decode().catch(() => {}))])
          .then(() => quietFrames())
          .then(() => {
            if (cancelled || done) return;
            const vw = innerWidth;
            const vh = innerHeight;
            const g = geometry(vw, vh, preloaderStills);
            // FLIP target: the real poster's box (the full-bleed hero at scroll 0).
            const target = poster.getBoundingClientRect();
            const last = imgs.length - 1;
            const size = { fw: g[0].fw, fh: g[0].fh };
            let shown = 0;
            const draw = () => apply(frame, imgs[shown], vw, vh, g[shown], size.fw, size.fh);
            const show = (i: number) => {
              imgs[shown].style.opacity = "0";
              shown = i;
              imgs[i].style.opacity = "1";
              draw();
            };

            tl = gsap.timeline({ onComplete: finish });
            // Flashes: hard cuts; the frame eases to each still's size.
            let t = HOLDS[0];
            for (let i = 1; i <= last; i++) {
              tl.add(() => show(i), t);
              tl.to(size, { fw: g[i].fw, fh: g[i].fh, duration: Math.min(0.2, (HOLDS[i] ?? LAST_HOLD) * 0.6), ease: "power2.out", onUpdate: draw }, t);
              t += HOLDS[i] ?? LAST_HOLD;
            }
            // Counter: eases with the pacing to ~85 as still 06 ends, then 100.
            const count = { v: 0 };
            const paint = () => (counter.textContent = String(Math.round(count.v)).padStart(3, "0"));
            const flashEnd = HOLDS.reduce((a, b) => a + b, 0);
            tl.to(count, { v: 85, duration: flashEnd, ease: "power1.in", onUpdate: paint }, 0).to(count, { v: 100, duration: LAST_HOLD, ease: "power2.out", onUpdate: paint }, flashEnd);

            // Expand: the frame grows onto the poster's box.
            const T = flashEnd + LAST_HOLD;
            tl.to(fades, { opacity: 0, duration: 0.25, ease: "power1.out" }, T)
              .to(size, { fw: target.width, fh: target.height, duration: 1.1, ease: "power3.inOut", onUpdate: draw }, T)
              // Same-frame swap to the poster (identical pixels), then the film.
              .add(() => {
                field.style.opacity = "0";
                frame.style.opacity = "0";
                markOpeningDone();
              }, T + 1.1)
              .fromTo(shades, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: "power1.inOut" }, T + 1.1)
              .fromTo(header, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: "power1.out" }, T + 1.1)
              .fromTo(caption, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }, T + 1.3)
              .fromTo(cta, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }, T + 1.4);
          });

        return () => {
          cancelled = true;
          tl?.kill();
          window.removeEventListener("keydown", onKey);
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} aria-hidden="true" className="preloader">
      <div className="pl-field fixed inset-0 z-[60] bg-plaster text-ink">
        {/* The lockup, ink on ivory, above the flashes; it fades with the counter. */}
        {/* eslint-disable-next-line @next/next/no-img-element -- static SVG logo, part of the first painted frame */}
        <img src="/brand/fresca-lockup-ink.svg" alt="" width={220} height={84} fetchPriority="high" className="pl-label absolute left-1/2 top-[clamp(28px,6vh,56px)] h-auto w-[220px] -translate-x-1/2 max-md:w-[180px]" />
        <span className="pl-count absolute inset-x-0 bottom-[clamp(28px,6vh,56px)] text-center font-serif text-xl tabular-nums">000</span>
      </div>
      <div className="pl-frame fixed inset-0 z-[61] overflow-hidden">
        {preloaderStills.map((s, i) => (
          // eslint-disable-next-line @next/next/no-img-element -- plain img: sized before first paint, decoded up front
          <img key={s.src} src={s.src} alt="" width={s.w} height={s.h} decoding="sync" fetchPriority={i === 0 || i === preloaderStills.length - 1 ? "high" : "auto"} className="pl-still" style={{ opacity: i === 0 ? 1 : 0 }} />
        ))}
      </div>
      {/* Server and client stringify the helpers from different bundles; the
          script has already run by hydration, so its text never matters. */}
      <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: BEFORE_PAINT }} />
    </div>
  );
}
