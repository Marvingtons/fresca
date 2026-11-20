"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { showcase } from "@/content/site";
import { gsap, useGSAP } from "@/lib/gsap";
import { MOTION, prefersReducedMotion } from "@/lib/motion";

const { projects, labels } = showcase;
const pad2 = (n: number) => String(n).padStart(2, "0");
const wrap = (n: number) => (n + projects.length) % projects.length;
/** Slides worth having in the DOM when `n` is showing: it and its neighbours. */
const around = (n: number) => [n, wrap(n + 1), wrap(n - 1)];

/**
 * Every slide is cropped into one 4:3 frame. The frame is never wider than
 * FRAME_MAX, the widest 4:3 crop the narrowest source (1065px) can fill, so no
 * photo is shown larger than its own pixels (CLAUDE.md).
 */
const FRAME_MAX = 1065;

function Arrow({ dir, onClick }: { dir: "prev" | "next"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === "prev" ? "Previous project" : "Next project"}
      className="grid h-12 w-12 cursor-pointer place-items-center rounded-full border border-ground/50 bg-transparent text-ground transition-colors duration-300 hover:bg-ground hover:text-ink"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
        <path d={dir === "prev" ? "M10 3 5 8l5 5" : "m6 3 5 5-5 5"} />
      </svg>
    </button>
  );
}

export default function ProjectShowcase() {
  const root = useRef<HTMLElement>(null);
  const slides = useRef<(HTMLImageElement | null)[]>([]);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cur = useRef(0);
  const busy = useRef(false);
  const [shown, setShown] = useState(0); // project whose text is displayed
  // Slides rendered so far: only the current one and its neighbours load, and
  // once loaded a slide stays so going back is instant.
  const [loaded, setLoaded] = useState(() => new Set(around(0)));

  const { contextSafe } = useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION, () => {
        // Ground-colored blocks collapse as the section arrives.
        gsap.fromTo(".sc-chess-l", { height: "65vh" }, { height: 0, ease: "power2.out", scrollTrigger: { trigger: root.current, start: "top bottom", end: "top 30%", scrub: 0.8 } });
        gsap.fromTo(".sc-chess-r", { height: "25vh" }, { height: 0, ease: "power2.out", scrollTrigger: { trigger: root.current, start: "top bottom", end: "top 45%", scrub: 0.8 } });

        // The clipped frame opens to the full panel, then the details arrive.
        gsap
          .timeline({ scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: 0.8 } })
          .fromTo(".sc-media", { clipPath: "inset(24% 28% 24% 28%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 3, ease: "power2.out" }, 0)
          .fromTo(".sc-img", { scale: 1.4 }, { scale: 1, duration: 3, ease: "power2.out" }, 0)
          .fromTo(".sc-title-mask", { yPercent: -40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1 }, 1.9)
          .fromTo(".sc-fade", { opacity: 0, y: -24 }, { opacity: 1, y: 0, duration: 1, stagger: 0.15 }, 2.1);
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  // Prev/next: the incoming photo wipes across while the title swaps through its mask.
  const go = contextSafe((dir: 1 | -1) => {
    if (busy.current) return;
    const n = wrap(cur.current + dir);
    setLoaded((prev) => (around(n).every((i) => prev.has(i)) ? prev : new Set([...prev, ...around(n)])));
    const prev = slides.current[cur.current];
    const next = slides.current[n];
    cur.current = n;

    if (prefersReducedMotion()) {
      gsap.set(prev, { opacity: 0 });
      gsap.set(next, { opacity: 1 });
      setShown(n);
      return;
    }

    busy.current = true;
    gsap.set(next, { opacity: 1, zIndex: 2, clipPath: dir > 0 ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)" });
    gsap.to(next, {
      clipPath: "inset(0 0% 0 0%)",
      duration: 1.2,
      ease: "power3.inOut",
      onComplete: () => {
        gsap.set(prev, { opacity: 0, zIndex: 0 });
        gsap.set(next, { zIndex: 1, clearProps: "clipPath" });
        busy.current = false;
      },
    });
    gsap.fromTo(next, { scale: 1.15 }, { scale: 1, duration: 1.6, ease: "power3.out" });
    gsap.to(titleRef.current, {
      yPercent: -110,
      duration: 0.45,
      ease: "power2.in",
      onComplete: () => {
        setShown(n);
        gsap.fromTo(titleRef.current, { yPercent: 110 }, { yPercent: 0, duration: 0.8, ease: "power3.out" });
      },
    });
    gsap.fromTo(".sc-stats dd", { opacity: 1 }, { opacity: 0, duration: 0.3, yoyo: true, repeat: 1, repeatDelay: 0.25 });
  });

  const p = projects[shown];

  return (
    <section ref={root} id="work" aria-label="Selected projects" className="relative h-[280vh]">
      <div className="sticky top-0 h-svh">
        <div className="sc-text relative h-full overflow-hidden bg-panel text-ground">
          {/* One 4:3 photo rectangle, centered in the space below the fixed header
              (--hh: 72px, 88px on desktop), as large as the screen and FRAME_MAX allow. */}
          <div
            style={{ width: `min(${FRAME_MAX}px, calc(100vw - 2 * var(--pad)), calc((100svh - var(--hh) - 64px) * 4 / 3))` }}
            className="sc-media absolute left-1/2 top-[calc(50%+var(--hh)/2)] aspect-[4/3] -translate-x-1/2 -translate-y-1/2 overflow-hidden will-change-[clip-path] [--hh:72px] md:[--hh:88px]"
          >
            {projects.map((project, i) =>
              loaded.has(i) ? (
                <Image
                  key={project.title}
                  ref={(el) => {
                    slides.current[i] = el;
                  }}
                  src={project.image.src}
                  alt={project.image.alt}
                  fill
                  quality={85}
                  sizes={`min(${FRAME_MAX}px, 100vw)`}
                  style={project.image.focus ? { objectPosition: project.image.focus } : undefined}
                  className={`sc-img object-cover ${i === 0 ? "opacity-100" : "opacity-0"}`}
                />
              ) : null,
            )}
          </div>

          <div aria-hidden="true" className="sc-chess-l absolute left-0 top-0 z-[6] h-0 w-1/2 bg-ground" />
          <div aria-hidden="true" className="sc-chess-r absolute right-0 top-0 z-[6] h-0 w-1/2 bg-ground" />

          <div className="sc-fade absolute inset-x-0 top-0 z-[5] flex items-start justify-between px-[clamp(20px,3vw,48px)] pt-24 max-md:pt-[84px]">
            <h2 className="cap font-normal">{showcase.eyebrow}</h2>
            <span className="font-serif text-[22px] tabular-nums" aria-live="polite">
              {pad2(shown + 1)} / {pad2(projects.length)}
            </span>
          </div>

          <div className="absolute inset-x-0 bottom-0 z-[5] flex flex-wrap items-end justify-between gap-7 px-[clamp(20px,3vw,48px)] pb-[clamp(24px,4vh,44px)]">
            <div>
              <div className="sc-title-mask overflow-hidden">
                <h3 ref={titleRef} className="max-w-[780px] font-serif text-[clamp(44px,6vw,96px)] font-normal leading-[.95]">
                  {p.title}
                </h3>
              </div>
              <dl className="sc-stats sc-fade mt-6 flex flex-wrap gap-x-11 gap-y-5">
                {p.city && (
                  <div className="min-w-[96px]">
                    <dt className="text-[10px] uppercase tracking-[.22em] text-on-dark max-md:text-[12px]">{labels.city}</dt>
                    <dd className="mt-1.5 font-serif text-[30px] leading-none">{p.city}</dd>
                  </div>
                )}
              </dl>
            </div>
            <div className="sc-fade flex items-center gap-2.5">
              <Arrow dir="prev" onClick={() => go(-1)} />
              <Arrow dir="next" onClick={() => go(1)} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
