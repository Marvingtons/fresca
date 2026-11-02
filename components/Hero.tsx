"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { heroFilm } from "@/content/media";
import { hero } from "@/content/site";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { INTRO_KEY, introIsPlaying } from "@/lib/intro";
import { MOTION } from "@/lib/motion";
import HeroFilm from "./HeroFilm";
import Line from "./LineReveal";
import { useSmoothScroll } from "./SmoothScroll";

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const { start } = useSmoothScroll();
  // Intro frames 2-5 are added after hydration (only when the intro plays), so
  // they download after first paint instead of competing with it. They're not
  // shown until 0.33s into the intro; if one is late, the previous frame stays.
  const [laterFrames, setLaterFrames] = useState(false);
  // The film only gets its sources once the preloader is done (right away when it doesn't play).
  const [introDone, setIntroDone] = useState(false);
  useEffect(() => {
    if (introIsPlaying()) setLaterFrames(true);
    else setIntroDone(true);
  }, []);

  useGSAP(
    () => {
      if (introIsPlaying() && !laterFrames) return; // build the intro once every frame is in the DOM
      const mm = gsap.matchMedia();
      mm.add(MOTION, () => {
        // Intro: photos cycle in a small frame while the counter runs, then it opens to full screen.
        if (introIsPlaying()) {
          window.scrollTo(0, 0);
          const html = document.documentElement;
          const header = document.querySelector(".site-header");
          const imgs = gsap.utils.toArray<HTMLElement>(".hero-media img");
          const counter = { v: 0 };

          // Take over from the pre-paint CSS (html.intro) with matching inline states.
          gsap.set(".hero-media", { clipPath: "inset(37% 41.5% 37% 41.5% round 3px)" });
          gsap.set(imgs, { autoAlpha: 0 });
          gsap.set(imgs[0], { autoAlpha: 1 });
          gsap.set(".hero-ln > span", { y: 0, yPercent: 110 });
          gsap.set(".hero-fade", { autoAlpha: 0, y: 14 });
          gsap.set(".hero-shade", { opacity: 0 });
          gsap.set(header, { autoAlpha: 0 });

          const intro = gsap.timeline({ defaults: { ease: "power3.inOut" } });
          intro.to(
            counter,
            {
              v: 100,
              duration: 2,
              ease: "power1.inOut",
              onUpdate: () => {
                if (countRef.current) countRef.current.textContent = String(Math.round(counter.v)).padStart(3, "0");
              },
            },
            0,
          );
          imgs.forEach((img, i) => {
            if (i) intro.set(img, { autoAlpha: 1 }, 0.33 * i);
          });
          intro
            .to(".intro-ui", { autoAlpha: 0, duration: 0.4, ease: "power1.out" }, 2.05)
            // Explicit start shape: the browser shortens the computed inset() to two
            // values, which would make the frame open from the bottom-left corner.
            .fromTo(
              ".hero-media",
              { clipPath: "inset(37% 41.5% 37% 41.5% round 3px)" },
              { clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 1.5 },
              2.1,
            )
            .fromTo(".hero-final", { scale: 1.35 }, { scale: 1.06, duration: 1.9, ease: "power3.out" }, 2.1)
            .to(".hero-shade", { opacity: 1, duration: 1, ease: "power1.out" }, 2.6)
            .to(".hero-ln > span", { yPercent: 0, duration: 1.2, stagger: 0.1, ease: "power4.out" }, 2.95)
            .to(".hero-fade", { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08, ease: "power2.out" }, 3.2)
            .to(header, { autoAlpha: 1, duration: 0.8, ease: "power1.out" }, 3.2)
            .add(() => {
              try {
                sessionStorage.setItem(INTRO_KEY, "1");
              } catch {}
              html.classList.remove("intro");
              start();
              setIntroDone(true);
            }, 3.4)
            // Recalculate triggers once everything has settled, not mid-animation.
            .eventCallback("onComplete", () => ScrollTrigger.refresh());
        }

        // Hero parallax: the photo sinks while the text rises and fades.
        gsap.to(".hero-final", {
          yPercent: 14,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
        });
        gsap.to(".hero-content", {
          yPercent: -40,
          opacity: 0,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "70% top", scrub: true },
        });
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [laterFrames] },
  );

  return (
    <section ref={root} id="top" className="relative h-svh min-h-[560px] overflow-hidden bg-ground">
      <div className="hero-media absolute inset-0 overflow-hidden will-change-[clip-path]">
        {/* Intro-only photos: display:none (and so never loaded) once the intro has played. */}
        {hero.cycle.map((src, i) => (
          <div key={src} className="hero-cycle absolute inset-0">
            {/* Each frame is a full-size photo clipped to the small intro window, so it
                needs full-width resolution. The first one paints before hydration and is
                the page's LCP, so it is preloaded (repeat visits skip the intro but are
                in the same session, so it's cached). */}
            {(i === 0 || laterFrames) && (
              <Image src={src} alt="" fill priority={i === 0} sizes="100vw" quality={85} className="object-cover" />
            )}
          </div>
        ))}
        {/* Poster (the film's first frame, and the LCP image) with the film over it. The
            wrapper carries the intro zoom and the parallax so both layers move as one. */}
        <div className="hero-final absolute inset-0 scale-[1.06]">
          <picture>
            <source srcSet={heroFilm.poster.webp} type="image/webp" />
            {/* eslint-disable-next-line @next/next/no-img-element -- remote poster, preloaded in the layout */}
            <img
              src={heroFilm.poster.jpg}
              alt={hero.image.alt}
              width={heroFilm.poster.width}
              height={heroFilm.poster.height}
              fetchPriority="high"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </picture>
          <HeroFilm ready={introDone} />
        </div>
        <div className="hero-shade absolute inset-0 bg-[rgba(18,17,15,.38)]" />
      </div>

      <div
        aria-hidden="true"
        className="intro-ui pointer-events-none absolute inset-0 flex flex-col items-center justify-between pb-[18vh] pt-[24vh] text-ink"
      >
        <span className="cap">{hero.introLabel}</span>
        <span ref={countRef} className="font-serif text-xl tabular-nums">
          000
        </span>
      </div>

      <div className="hero-content absolute inset-x-0 bottom-0 flex flex-col items-center px-pad pb-[9vh] text-center text-white">
        {/* The spec's `.hero-content p` rule outranks `.cap` here: 16px, white/86. */}
        <p className="cap hero-fade mb-5 max-w-[420px] !text-base text-white/[.86]">{hero.eyebrow}</p>
        <h1 className="font-serif text-[clamp(52px,7.4vw,124px)] font-normal leading-[.95] tracking-[-.015em]">
          <Line reveal={false} className="hero-ln">
            {hero.lines[0]}
          </Line>
          <Line reveal={false} className="hero-ln">
            <em>{hero.lines[1]}</em>
          </Line>
        </h1>
        <p className="hero-fade mt-[22px] max-w-[420px] text-base text-white/[.86]">{hero.text}</p>
      </div>

      <div aria-hidden="true" className="cap hero-fade absolute bottom-7 left-pad flex items-center gap-3 text-white">
        <i className="relative block h-9 w-px overflow-hidden bg-white/40 after:absolute after:left-0 after:top-[-100%] after:h-full after:w-px after:animate-cue after:bg-white after:content-['']" />
        Scroll
      </div>
    </section>
  );
}
