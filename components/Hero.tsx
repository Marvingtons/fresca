"use client";

import { useEffect, useRef, useState } from "react";
import { heroFilm } from "@/content/media";
import { hero, site } from "@/content/site";
import { useMotion } from "@/lib/gsap";
import { INTRO_KEY, INTRO_SIZES, introIsPlaying } from "@/lib/intro";
import { MOTION } from "@/lib/motion";
import HeroFilm from "./HeroFilm";
import Line from "./LineReveal";
import Lockup from "./Lockup";
import Photo from "./Photo";
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
  // The hero text stays hidden (CSS: html.intro .hero-content) and out of the
  // accessibility tree until the preloader's complete event. Server HTML has it
  // visible, so repeat visits, reduced motion and no-JS never hide it.
  const [textHidden, setTextHidden] = useState(false);
  useEffect(() => {
    if (introIsPlaying()) {
      setLaterFrames(true);
      setTextHidden(true);
    } else setIntroDone(true);
    // If the intro is abandoned (lib/intro.ts timeout drops html.intro), the text comes back.
    const html = document.documentElement;
    const watch = new MutationObserver(() => {
      if (!introIsPlaying()) setTextHidden(false);
    });
    watch.observe(html, { attributes: true, attributeFilter: ["class"] });
    return () => watch.disconnect();
  }, []);

  useMotion(
    ({ gsap, ScrollTrigger }) => {
      if (introIsPlaying() && !laterFrames) return; // build the intro once every frame is in the DOM
      if (!introIsPlaying()) setIntroDone(true); // the intro was skipped by its timeout (lib/intro.ts)
      const mm = gsap.matchMedia();
      mm.add(MOTION, (ctx) => {
        // Intro: photos cycle in a small frame while the counter runs, then it opens to full screen.
        if (introIsPlaying()) {
          window.scrollTo(0, 0);
          const html = document.documentElement;
          html.setAttribute("data-intro-run", ""); // stops the fallback in lib/intro.ts
          const header = document.querySelector(".site-header");
          const imgs = gsap.utils.toArray<HTMLElement>(".hero-media img");
          const counter = { v: 0 };

          // Take over from the pre-paint CSS (html.intro) with matching inline states.
          gsap.set(".hero-media", { clipPath: "inset(37% 41.5% 37% 41.5%)" });
          gsap.set(imgs, { autoAlpha: 0 });
          gsap.set(imgs[0], { autoAlpha: 1 });
          gsap.set(".hero-content", { visibility: "hidden" });
          gsap.set(".hero-ln > span", { y: 0, yPercent: 110 });
          gsap.set(".hero-fade", { autoAlpha: 0, y: 14 });
          gsap.set(".hero-shade", { opacity: 0 });
          gsap.set(header, { autoAlpha: 0 });

          // The preloader's complete event: the counter has reached 100 and faded. Only now
          // is the text layer shown and its reveal timeline created. Recorded in this
          // matchMedia context (ctx.add), so it is reverted with everything else.
          const onPreloaderComplete = ctx.add("onPreloaderComplete", () => {
            // Starts 0.5s later (2.95s into the intro), as the frame opens behind it.
            gsap
              .timeline({ delay: 0.5 })
              .set(".hero-content", { visibility: "visible" })
              .add(() => setTextHidden(false), 0)
              .to(".hero-ln > span", { yPercent: 0, duration: 1.2, stagger: 0.1, ease: "power4.out" }, 0)
              .to(".hero-fade", { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08, ease: "power2.out" }, 0.25);
          });

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
            .add(() => onPreloaderComplete(), 2.45)
            // Explicit start shape: the browser shortens the computed inset() to two
            // values, which would make the frame open from the bottom-left corner.
            .fromTo(
              ".hero-media",
              { clipPath: "inset(37% 41.5% 37% 41.5%)" },
              { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5 },
              2.1,
            )
            .fromTo(".hero-final", { scale: 1.35 }, { scale: 1.06, duration: 1.9, ease: "power3.out" }, 2.1)
            .to(".hero-shade", { opacity: 1, duration: 1, ease: "power1.out" }, 2.6)
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
      <div className="hero-media absolute inset-0 overflow-hidden">
        {/* Intro-only photos: display:none (and so never loaded) once the intro has played. */}
        {hero.cycle.map((src, i) => (
          <div key={src} className="hero-cycle absolute inset-0">
            {/* Each frame is a full-size photo clipped to the small intro window, so it
                needs full-width resolution. The first one paints before hydration; it is
                lazy (so never fetched while display:none) and preloaded by introScript
                only when the intro plays. */}
            {(i === 0 || laterFrames) && <Photo src={src} alt="" sizes={INTRO_SIZES} />}
          </div>
        ))}
        {/* Poster (the film's first frame, and the LCP image) with the film over it. The
            wrapper carries the intro zoom and the parallax so both layers move as one. */}
        <div className="hero-final absolute inset-0 scale-[1.06]">
          <picture>
            <source srcSet={heroFilm.poster.avif} type="image/avif" />
            <source srcSet={heroFilm.poster.webp} type="image/webp" />
            {/* eslint-disable-next-line @next/next/no-img-element -- poster in public/media, preloaded in the layout */}
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
        {/* Clear over the top 45% so the upper photo stays bright; darkens toward the type. */}
        <div className="hero-shade absolute inset-0 bg-[linear-gradient(to_bottom,rgba(20,18,16,0)_45%,rgba(20,18,16,.72)_100%)]" />
      </div>

      <div
        aria-hidden="true"
        className="intro-ui pointer-events-none absolute inset-0 z-[var(--z-preloader)] flex flex-col items-center justify-between pb-[18vh] pt-[24vh] text-ink"
      >
        <Lockup />
        <span ref={countRef} className="font-serif text-xl tabular-nums">
          000
        </span>
      </div>

      {/* The block's bottom edge sits 12% of the hero height above the bottom. */}
      <div
        aria-hidden={textHidden || undefined}
        className="hero-content absolute inset-x-0 bottom-[12%] flex flex-col items-center px-pad text-center text-white"
      >
        <h1 className="font-cormorant text-[clamp(44px,7.2vw,112px)] font-medium leading-[.95] tracking-[-.01em]">
          <span className="sr-only">{hero.srPrefix} </span>
          <Line reveal={false} className="hero-ln -mb-[.22em] pb-[.22em]">
            {hero.lines[0]}
          </Line>{" "}
          <Line reveal={false} className="hero-ln -mb-[.22em] pb-[.22em]">
            <em className="font-medium">{hero.lines[1]}</em>
          </Line>
        </h1>
        <p className="hero-fade mt-5 max-w-[34ch] font-outfit text-base font-light text-white/[.86] sm:text-[17px]">{hero.text}</p>
        <p className="hero-fade mt-4 font-outfit text-[12px] font-normal uppercase tracking-[.18em] text-white/70">{site.location}</p>
      </div>
    </section>
  );
}
