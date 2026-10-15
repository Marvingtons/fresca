"use client";

import { useRef } from "react";
import { cta, hero } from "@/content/site";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { INTRO_KEY, markOpeningDone } from "@/lib/intro";
import { heroMedia } from "@/lib/media/hero";
import { MOTION } from "@/lib/motion";
import HeroMedia from "./HeroMedia";
import { useSmoothScroll } from "./SmoothScroll";

/** Resolves when web fonts are ready, or after 1.5s so a slow font never blocks the page. */
const fontsReady = () => Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise((r) => window.setTimeout(r, 1500))]);

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const { start } = useSmoothScroll();

  useGSAP(
    () => {
      const html = document.documentElement;
      const heroEl = root.current!;

      // Nav colour, on every visit and under reduced motion too: bone over the
      // hero, ink once it has scrolled out (html.past-hero).
      const pastHero = ScrollTrigger.create({
        trigger: heroEl,
        start: "bottom top+=76",
        end: "max",
        onToggle: (self) => html.classList.toggle("past-hero", self.isActive),
      });

      const mm = gsap.matchMedia();
      // Scroll: the media moves up at 0.85x scroll speed.
      mm.add(MOTION, () => {
        gsap.to(".hero-media", {
          y: () => heroEl.offsetHeight * 0.15,
          ease: "none",
          scrollTrigger: { trigger: heroEl, start: "top top", end: "bottom top", scrub: true, invalidateOnRefresh: true },
        });
      });

      // Opening (first visit per session, html.intro). Transforms and opacity only.
      // A navy veil with the wordmark centered at ~3.2x; after a 0.6s hold the
      // wordmark travels into the nav slot (FLIP onto the real nav wordmark, then a
      // same-frame swap) while the veil fades and the poster settles; the copy rises
      // in; the film starts only once everything has finished. Under 2s.
      mm.add(MOTION, () => {
        if (!html.classList.contains("intro")) return;
        window.__introTakenOver = true;
        window.scrollTo(0, 0);
        document.body.classList.add("scroll-lock");
        const copy = copyRef.current!;
        const veil = veilRef.current!;
        const navMark = document.querySelector<HTMLElement>(".site-header .wordmark")!;
        const navRest = document.querySelectorAll(".site-header nav a, .site-header .hbtn");
        const poster = heroEl.querySelector(".hero-poster");
        const lines = heroEl.querySelectorAll(".hero-ln");
        const moving = [copy, veil, navMark, poster, ...Array.from(lines), ".hero-sub", ".hero-btn", ...Array.from(navRest)];

        let tl: gsap.core.Timeline | null = null;
        let done = false;
        const finish = () => {
          if (done) return;
          done = true;
          window.removeEventListener("keydown", onKey);
          try {
            sessionStorage.setItem(INTRO_KEY, "1");
          } catch {}
          gsap.set(moving, { clearProps: "all" });
          html.classList.remove("intro"); // also drops the will-change hints
          document.body.classList.remove("scroll-lock");
          start();
          ScrollTrigger.refresh();
          markOpeningDone(); // the film may load and play now
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

          // FLIP. First: the copy as CSS shows it, centered at 3.2x. Last: the real
          // nav wordmark. Both measured against the copy's untransformed box.
          const first = copy.getBoundingClientRect();
          copy.style.transform = "none";
          const box = copy.getBoundingClientRect();
          copy.style.transform = "";
          const last = navMark.getBoundingClientRect();
          gsap.set(copy, {
            transformOrigin: "0 0",
            x: first.left - box.left,
            y: first.top - box.top,
            scale: first.width / box.width,
            autoRound: false,
          });

          const T = 0.6; // hold after fonts are ready
          const rise = { y: 0, opacity: 1, ease: "power3.out" };
          tl = gsap.timeline({ onComplete: finish });
          tl.to(copy, { x: last.left - box.left, y: last.top - box.top, scale: last.width / box.width, duration: 1, ease: "power3.inOut", autoRound: false }, T)
            // Same-frame swap: the copy now sits exactly on the nav wordmark.
            .set(copy, { opacity: 0 }, T + 1)
            .set(navMark, { opacity: 1 }, T + 1)
            .to(veil, { opacity: 0, duration: 0.8, ease: "power1.inOut" }, T + 0.15)
            .fromTo(poster, { scale: 1.04 }, { scale: 1, duration: 1.2, ease: "power2.out" }, T)
            .fromTo(lines, { y: 16, opacity: 0 }, { ...rise, duration: 0.5, stagger: 0.08 }, T + 0.5)
            .fromTo(".hero-sub", { y: 16, opacity: 0 }, { ...rise, duration: 0.45 }, T + 0.7)
            .fromTo(".hero-btn", { y: 16, opacity: 0 }, { ...rise, duration: 0.45 }, T + 0.8)
            .fromTo(navRest, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "power1.out" }, T + 0.9);
        });

        return () => {
          cancelled = true;
          tl?.kill();
          window.removeEventListener("keydown", onKey);
        };
      });
      return () => {
        mm.revert();
        pastHero.kill();
      };
    },
    { scope: root },
  );

  return (
    <section ref={root} id="top" className="relative h-svh min-h-[520px] overflow-hidden bg-[#14110f] text-ground">
      {/* Media: full bleed, cover, parallax on this wrapper. */}
      <div className="hero-media absolute inset-0">
        <HeroMedia media={heroMedia} alt={hero.mediaAlt} />
      </div>
      {/* Exactly two shades, warm near-black. The middle of the frame has none. */}
      <div aria-hidden="true" className="hero-shade-top pointer-events-none absolute inset-x-0 top-0" />
      <div aria-hidden="true" className="hero-shade-bottom pointer-events-none absolute inset-x-0 bottom-0" />

      {/* Copy: bottom left inside the gutter, 9vh above the bottom edge. */}
      <div className="absolute inset-x-pad bottom-[9vh]">
        <h1 className="font-serif text-[clamp(40px,5.2vw,84px)] font-normal leading-[.98] tracking-[-.015em]">
          {hero.lines.map((line, i) => (
            <span key={line} className="hero-ln block">
              {i === hero.lines.length - 1 ? <em>{line}</em> : line}
            </span>
          ))}
        </h1>
        <p className="hero-sub mt-5 max-w-[440px] text-base">{hero.text}</p>
        <a className="hero-btn pill pill-accent mt-8" href={cta.href}>
          {cta.label}
        </a>
      </div>

      {/* Opening veil and its centered wordmark: server-rendered, shown only under
          html.intro. The copy has the nav wordmark's exact markup and box. */}
      <div ref={veilRef} aria-hidden="true" className="intro-veil fixed inset-0 z-[60] bg-navy" />
      <div ref={copyRef} aria-hidden="true" className="intro-copy fixed z-[61] flex-col leading-none text-ground">
        <b className="font-serif text-[32px] font-normal italic">Fresca</b>
        <span className="mt-[3px] text-[9px] uppercase tracking-[.36em]">Interior Design</span>
      </div>
    </section>
  );
}
