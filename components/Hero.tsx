"use client";

import Image from "next/image";
import { useRef } from "react";
import { cta, hero } from "@/content/site";
import { gsap, useGSAP } from "@/lib/gsap";
import { registerHeroReveal } from "@/lib/intro";
import { MOTION } from "@/lib/motion";
import Line from "./LineReveal";

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  // The hero's entrance: the photo settles from 1.03 and the headline rises.
  // The opening sequence (components/Navigation.tsx) places it on its own
  // timeline, after the veil on a first visit and straight away otherwise.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION, () =>
        registerHeroReveal(() => {
          const el = root.current;
          if (!el) return null;
          const tl = gsap.timeline();
          const photo = el.querySelector(".hero-final");
          if (photo) tl.fromTo(photo, { scale: 1.03 }, { scale: 1, duration: 1, ease: "power2.out", clearProps: "transform" }, 0);
          // y: 0 replaces the pre-paint translateY(110%), which GSAP would otherwise read as a px offset.
          tl.fromTo(el.querySelectorAll(".hero-ln > span"), { y: 0, yPercent: 110 }, { y: 0, yPercent: 0, duration: 0.65, stagger: 0.06, ease: "power3.out" }, 0.3);
          tl.fromTo(el.querySelectorAll(".hero-fade"), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.05, ease: "power2.out" }, 0.5);
          return tl;
        }),
      );
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="top" className="relative flex min-h-svh items-center bg-ground px-[clamp(16px,6vw,120px)] pb-20 pt-[clamp(104px,14vh,140px)]">
      <div className="mx-auto grid w-full max-w-[1280px] items-center gap-x-[clamp(32px,5vw,80px)] gap-y-9 md:grid-cols-[minmax(0,1fr)_auto]">
        <div className="hero-content text-ink">
          <h1 className="font-serif text-[clamp(42px,4.3vw,72px)] font-normal leading-[.98] tracking-[-.015em]">
            {hero.lines.map((line, i) => (
              <Line key={line} reveal={false} className="hero-ln">
                {i === hero.lines.length - 1 ? <em>{line}</em> : line}
              </Line>
            ))}
          </h1>
          <p className="hero-fade mt-6 max-w-[420px] text-base text-body">{hero.text}</p>
          <a className="pill pill-accent hero-fade mt-8" href={cta.href}>
            {cta.label}
          </a>
        </div>

        {/* Contained 4:3 frame. Never wider than 944 CSS px (the original photo's
            width) so the enhanced file is never stretched, and short enough to
            sit inside the first screen. A future video goes here: show its poster
            during the opening and start it from onVeilGone() in lib/intro.ts. */}
        <div className="hero-media relative aspect-[4/3] w-[min(944px,52vw,calc((100svh-220px)*4/3))] overflow-hidden rounded-[3px] max-md:w-full">
          <Image
            src={hero.image.src}
            alt={hero.image.alt}
            fill
            priority
            sizes="(min-width: 861px) min(944px, 52vw), 100vw"
            quality={85}
            className="hero-final object-cover"
          />
        </div>
      </div>

      <div aria-hidden="true" className="cap hero-fade absolute bottom-7 left-pad flex items-center gap-3 text-muted max-md:hidden">
        <i className="relative block h-9 w-px overflow-hidden bg-ink/20 after:absolute after:left-0 after:top-[-100%] after:h-full after:w-px after:animate-cue after:bg-ink after:content-['']" />
        Scroll
      </div>
    </section>
  );
}
