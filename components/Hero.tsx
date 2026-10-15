"use client";

import Image from "next/image";
import { useRef } from "react";
import { cta, hero, site } from "@/content/site";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { INTRO_KEY, introIsPlaying } from "@/lib/intro";
import { MOTION } from "@/lib/motion";
import Line from "./LineReveal";
import { useSmoothScroll } from "./SmoothScroll";

/** Intro thumbnail width: the hero frame starts at this size, centered, then expands. */
const THUMB_WIDTH = "clamp(140px, 17vw, 260px)";

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const { start } = useSmoothScroll();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION, () => {
        // Intro (1.2s): wordmark fades in, a thumbnail of the hero photo appears,
        // then expands into the contained hero frame (FLIP: the frame itself is scaled
        // down to the thumbnail and animated back to identity, so the thumbnail is
        // always the final crop) and the headline arrives as it lands.
        if (introIsPlaying()) {
          window.scrollTo(0, 0);
          const html = document.documentElement;
          const header = document.querySelector(".site-header");
          const media = root.current!.querySelector<HTMLElement>(".hero-media")!;

          // First/Last: the frame's final box and the thumbnail box, centered in the viewport.
          const last = media.getBoundingClientRect();
          const thumbW = thumbRef.current!.getBoundingClientRect().width;
          const scale = thumbW / last.width;
          const first = {
            x: innerWidth / 2 - (last.left + last.width / 2),
            y: innerHeight / 2 - (last.top + last.height / 2),
          };

          gsap.set(media, { x: first.x, y: first.y, scale, transformOrigin: "50% 50%", borderRadius: 3 / scale, autoAlpha: 0 });
          gsap.set(".hero-ln > span", { y: 0, yPercent: 110 });
          gsap.set(".hero-fade", { autoAlpha: 0, y: 14 });
          gsap.set(header, { autoAlpha: 0 });

          const finish = () => {
            try {
              sessionStorage.setItem(INTRO_KEY, "1");
            } catch {}
            html.classList.remove("intro");
            window.removeEventListener("keydown", onKey);
            start();
          };
          const intro = gsap.timeline({ onComplete: () => ScrollTrigger.refresh() });
          const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") intro.progress(1);
          };
          window.addEventListener("keydown", onKey);

          intro
            .fromTo(".intro-mark", { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" }, 0)
            .to(media, { autoAlpha: 1, duration: 0.2, ease: "power1.out" }, 0.15)
            .to(media, { x: 0, y: 0, scale: 1, borderRadius: 3, duration: 0.7, ease: "power3.inOut" }, 0.35)
            .fromTo(".hero-final", { scale: 1.08 }, { scale: 1, duration: 0.85, ease: "power3.out", clearProps: "transform" }, 0.35)
            .to(".intro-mark", { autoAlpha: 0, duration: 0.2, ease: "power1.in" }, 0.4)
            .to(".hero-ln > span", { yPercent: 0, duration: 0.4, stagger: 0.035, ease: "power3.out" }, 0.7)
            .to(".hero-fade", { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.04, ease: "power2.out" }, 0.8)
            .to(header, { autoAlpha: 1, duration: 0.35, ease: "power1.out" }, 0.85)
            .set(media, { clearProps: "transform,borderRadius" }, 1.2)
            .add(finish, 1.2);
        }
      });
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
            sit inside the first screen. */}
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

      {/* Intro only: the wordmark, and an invisible box that sets the thumbnail size. */}
      <div aria-hidden="true" className="intro-ui pointer-events-none absolute inset-0 grid place-items-center text-ink">
        <span className="intro-mark mb-[clamp(150px,22vw,260px)] flex flex-col items-center leading-none">
          <b className="font-serif text-[40px] font-normal italic">{site.shortName}</b>
          <span className="mt-1 text-[10px] uppercase tracking-[.36em]">Interior Design</span>
        </span>
        <div ref={thumbRef} className="invisible absolute" style={{ width: THUMB_WIDTH }} />
      </div>

      <div aria-hidden="true" className="cap hero-fade absolute bottom-7 left-pad flex items-center gap-3 text-muted max-md:hidden">
        <i className="relative block h-9 w-px overflow-hidden bg-ink/20 after:absolute after:left-0 after:top-[-100%] after:h-full after:w-px after:animate-cue after:bg-ink after:content-['']" />
        Scroll
      </div>
    </section>
  );
}
