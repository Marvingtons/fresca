"use client";

import { useRef } from "react";
import { cta, hero, site } from "@/content/site";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { INTRO_KEY, markOpeningDone } from "@/lib/intro";
import { heroMedia } from "@/lib/media/hero";
import { MOTION } from "@/lib/motion";
import HeroMedia from "./HeroMedia";
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

  useGSAP(
    () => {
      const html = document.documentElement;
      const hero = root.current!;

      // Nav state, on every visit and under reduced motion too: bone over the hero,
      // ink once it has scrolled out (html.past-hero); the nav wordmark appears only
      // once the FRESCA band has faded (html.band-gone), so the name never shows twice.
      const flag = (cls: string, start: string) =>
        ScrollTrigger.create({
          trigger: hero,
          start,
          end: "max",
          onToggle: (self) => html.classList.toggle(cls, self.isActive),
        });
      const flags = [flag("band-gone", "50% top"), flag("past-hero", "bottom top+=76")];

      const mm = gsap.matchMedia();
      mm.add(MOTION, () => {
        // Scroll: the media moves up at 0.85x scroll speed; the band is gone by the
        // time half the hero is.
        gsap.to(".hero-media", {
          y: () => hero.offsetHeight * 0.15,
          ease: "none",
          scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true, invalidateOnRefresh: true },
        });
        gsap.to(".wm-band", { autoAlpha: 0, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "50% top", scrub: true } });
      });

      // Opening (first visit per session, html.intro): a navy field with the wordmark
      // centered at ~28px. After a 0.8s hold the wordmark tracks out to the gutters,
      // grows to its full size and drops onto the hero's bottom edge, where it stays.
      // Near the end the field wipes up to reveal the media; the nav fades in last.
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
          markOpeningDone();
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

          const wipe = { p: 0 };
          tl = gsap.timeline({ onComplete: finish });
          // autoRound off: the tween must end on the CSS's sub-pixel letter-spacing, or the
          // letters shift by a pixel when the inline style is cleared.
          tl.to(wm, { letterSpacing: lsEnd, y: 0, scale: 1, duration: 0.9, ease: "power3.inOut", autoRound: false }, 0.8)
            .to(
              wipe,
              {
                p: 1,
                duration: 0.7,
                ease: "power3.inOut",
                onUpdate: () => {
                  field.style.clipPath = `inset(0 0 ${wipe.p * 100}% 0)`;
                },
              },
              1.5,
            )
            // A hero video starts here, so its first frame is the first one seen.
            .add(markOpeningDone, 2.2)
            .to(header, { autoAlpha: 1, duration: 0.3, ease: "power1.out" }, 2.2);
        });

        return () => {
          cancelled = true;
          tl?.kill();
          window.removeEventListener("keydown", onKey);
        };
      });
      return () => {
        mm.revert();
        flags.forEach((t) => t.kill());
      };
    },
    { scope: root },
  );

  return (
    <section ref={root} id="top" className="relative h-svh min-h-[520px] overflow-hidden bg-navy text-ground">
      {/* Media: full bleed, cover, parallax on this wrapper. */}
      <div className="hero-media absolute inset-0 will-change-transform">
        <HeroMedia media={heroMedia} alt={hero.mediaAlt} />
      </div>
      {/* Legibility: navy, not black. Top for the nav on the bright ceiling, bottom
          for the type. Stops are tuned so every line passes against the kitchen's
          brightest pixels (see .hero-scrim in globals.css). */}
      <div aria-hidden="true" className="hero-scrim-top pointer-events-none absolute inset-x-0 top-0" />
      <div aria-hidden="true" className="hero-scrim-bottom pointer-events-none absolute inset-x-0 bottom-0" />

      {/* No z-index here: the wordmark (z-46) must stay above the opening field. */}
      <div className="relative flex h-full flex-col justify-end">
        <div className="hero-copy px-pad pb-[clamp(16px,3vh,32px)]">
          <h1 className="font-serif text-[clamp(40px,5.2vw,84px)] font-normal leading-[.98] tracking-[-.015em]">
            {hero.lines.map((line, i) => (
              <Line key={line} reveal={false}>
                {i === hero.lines.length - 1 ? <em>{line}</em> : line}
              </Line>
            ))}
          </h1>
          <p className="mt-4 max-w-[440px] text-base">{hero.text}</p>
          <a className="pill pill-accent mt-6" href={cta.href}>
            {cta.label}
          </a>
        </div>

        {/* Wordmark band: permanent, on every visit. On a first visit this same
            element is the opening's centered wordmark (see globals.css, html.intro). */}
        <div className="wm-band px-pad pb-pad">
          <p ref={wmRef} aria-hidden="true" className="wm font-serif">
            {"FRESCA".split("").map((ch, i) => (
              <span key={i}>{ch}</span>
            ))}
          </p>
          <script dangerouslySetInnerHTML={{ __html: startScaleScript }} />
        </div>
      </div>

      {/* Opening field: server-rendered, shown only under html.intro. */}
      <div ref={fieldRef} aria-hidden="true" className="intro-field fixed inset-0 z-[45] bg-navy text-ground">
        <span className="absolute left-pad top-pad text-[11px] uppercase tracking-[.2em] opacity-60">Interior Design</span>
        <span className="absolute right-pad top-pad text-[11px] uppercase tracking-[.2em] opacity-60">{site.location.split(",")[0]}</span>
      </div>
    </section>
  );
}
