"use client";

import Image from "next/image";
import { useRef } from "react";
import { cta, hero, site } from "@/content/site";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { INTRO_KEY } from "@/lib/intro";
import { MOTION } from "@/lib/motion";
import Line from "./LineReveal";
import { useSmoothScroll } from "./SmoothScroll";

/** Width of "FRESCA" in Instrument Serif caps, in em, after the F/A side-bearing
 *  corrections in globals.css (.wm). Must match the CSS. */
const WORD_EM = 2.693;
/** Size of the wordmark on the navy field, in px. */
const START_PX = 28;

/** Resolves when web fonts are ready, or after 1.5s so a slow font never blocks the page. */
const fontsReady = () => Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise((r) => window.setTimeout(r, 1500))]);

/**
 * Before first paint (inline, right after the wordmark): the start scale that
 * shows the full-size wordmark at ~28px on the navy field. It depends only on
 * the wordmark's font size, which is viewport-based, so no font is needed yet.
 */
const startScaleScript = `try{var w=document.querySelector('.wm');document.documentElement.style.setProperty('--wm-s',String(${START_PX}/parseFloat(getComputedStyle(w).fontSize)))}catch(e){}`;

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const wmRef = useRef<HTMLParagraphElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const { start } = useSmoothScroll();

  // Opening (first visit per session, html.intro): a navy field with the wordmark
  // centered at ~28px. After a 0.8s hold the wordmark tracks out to the gutters,
  // grows to its full size and drops onto the hero's bottom edge, where it stays.
  // Near the end the field wipes up and away; the nav fades in last. ~2.4s.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION, () => {
        const html = document.documentElement;
        if (!html.classList.contains("intro")) return;
        window.__introTakenOver = true;
        window.scrollTo(0, 0);
        document.body.classList.add("scroll-lock");
        const wm = wmRef.current!;
        const field = fieldRef.current!;
        const header = document.querySelector(".site-header");

        let tl: gsap.core.Timeline | null = null;
        let done = false;
        const finish = () => {
          if (done) return;
          done = true;
          window.removeEventListener("keydown", onKey);
          try {
            sessionStorage.setItem(INTRO_KEY, "1");
          } catch {}
          gsap.set([wm, field, header], { clearProps: "all" });
          html.classList.remove("intro");
          document.body.classList.remove("scroll-lock");
          start();
          ScrollTrigger.refresh();
        };
        const onKey = (e: KeyboardEvent) => {
          if (e.key !== "Escape") return;
          if (tl) tl.progress(1);
          else finish();
        };
        window.addEventListener("keydown", onKey);

        let cancelled = false;
        fontsReady().then(() => {
          if (cancelled || done) return;

          // End state is the wordmark's CSS layout in the hero. Measure it, then
          // start from the centered, small, lightly tracked state. Only
          // letter-spacing and transform animate; the font size never changes.
          const fs = parseFloat(getComputedStyle(wm).fontSize);
          const band = wm.parentElement!;
          const bandStyle = getComputedStyle(band);
          const avail = band.clientWidth - parseFloat(bandStyle.paddingLeft) - parseFloat(bandStyle.paddingRight);
          const lsEnd = (avail - WORD_EM * fs) / 5;
          wm.style.transform = "none";
          const rest = wm.getBoundingClientRect();
          wm.style.transform = "";
          gsap.set(wm, {
            letterSpacing: 0.04 * fs,
            x: 0,
            y: innerHeight / 2 - (rest.top + rest.height / 2),
            scale: START_PX / fs,
            transformOrigin: "50% 50%",
            autoRound: false,
          });

          // While the field wipes, the wordmark is bone above the field's edge and
          // ink below it (a hard stop in a text-clipped gradient, kept on the edge).
          const wipe = { p: 0 };
          const syncCut = () => {
            const edge = innerHeight * (1 - wipe.p);
            const r = wm.getBoundingClientRect();
            const sy = Number(gsap.getProperty(wm, "scaleY")) || 1;
            wm.style.setProperty("--cut", `${(edge - r.top) / sy}px`);
          };

          tl = gsap.timeline({ onComplete: finish });
          // autoRound off: the tween must end on the CSS's sub-pixel letter-spacing, or the
          // letters shift by a pixel when the inline style is cleared.
          tl.to(wm, { letterSpacing: lsEnd, y: 0, scale: 1, duration: 0.9, ease: "power3.inOut", autoRound: false, onUpdate: () => wipe.p > 0 && syncCut() }, 0.8)
            .to(
              wipe,
              {
                p: 1,
                duration: 0.7,
                ease: "power3.inOut",
                onUpdate: () => {
                  field.style.clipPath = `inset(0 0 ${wipe.p * 100}% 0)`;
                  syncCut();
                },
              },
              1.5,
            )
            .to(header, { autoAlpha: 1, duration: 0.3, ease: "power1.out" }, 2.2);
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
    <section ref={root} id="top" className="relative flex min-h-svh flex-col bg-ground pt-[clamp(96px,12vh,128px)]">
      <div className="grid w-full flex-1 items-end gap-x-[clamp(32px,5vw,80px)] gap-y-8 px-pad md:grid-cols-[minmax(0,1fr)_auto]">
        <div className="text-ink">
          <h1 className="font-serif text-[clamp(42px,4.3vw,72px)] font-normal leading-[.98] tracking-[-.015em]">
            {hero.lines.map((line, i) => (
              <Line key={line} reveal={false}>
                {i === hero.lines.length - 1 ? <em>{line}</em> : line}
              </Line>
            ))}
          </h1>
          <p className="mt-6 max-w-[420px] text-base text-body">{hero.text}</p>
          <a className="pill pill-accent mt-8" href={cta.href}>
            {cta.label}
          </a>
        </div>

        {/* Contained 4:3 frame: never wider than 944 CSS px (the original photo's
            width), and short enough to leave room for the wordmark band below. */}
        <div className="hero-media relative aspect-[4/3] overflow-hidden rounded-[3px] max-md:-order-1 max-md:w-full">
          <Image src={hero.image.src} alt={hero.image.alt} fill priority sizes="(min-width: 861px) min(944px, 52vw), 100vw" quality={85} className="object-cover" />
        </div>
      </div>

      {/* Wordmark band: permanent, on every visit. On a first visit this same
          element is the opening's centered wordmark (see globals.css, html.intro). */}
      <div className="wm-band px-pad pb-pad pt-[clamp(32px,5vh,52px)]">
        <p ref={wmRef} aria-hidden="true" className="wm font-serif">
          {"FRESCA".split("").map((ch, i) => (
            <span key={i}>{ch}</span>
          ))}
        </p>
        <script dangerouslySetInnerHTML={{ __html: startScaleScript }} />
      </div>

      {/* Opening field: server-rendered, shown only under html.intro. */}
      <div ref={fieldRef} aria-hidden="true" className="intro-field fixed inset-0 z-[45] bg-navy text-ground">
        <span className="absolute left-pad top-pad text-[11px] uppercase tracking-[.2em] opacity-60">Interior Design</span>
        <span className="absolute right-pad top-pad text-[11px] uppercase tracking-[.2em] opacity-60">{site.location.split(",")[0]}</span>
      </div>
    </section>
  );
}
