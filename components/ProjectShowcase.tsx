"use client";

import { useRef, useState } from "react";
import { showcase } from "@/content/site";
import { gsap, useGSAP } from "@/lib/gsap";
import { MOTION, prefersReducedMotion } from "@/lib/motion";
import Photo from "./Photo";

const { projects } = showcase;
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
/** Height kept free around the frame: eyebrow above, caption row below, breathing room. */
const CHROME = 216;

function Arrow({ dir, onClick }: { dir: "prev" | "next"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === "prev" ? "Previous project" : "Next project"}
      className="grid h-11 w-11 cursor-pointer place-items-center rounded-full border border-ink/40 bg-transparent text-ink transition-colors duration-300 hover:bg-ink hover:text-ground"
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
        // The clipped frame opens to the full photo, then the caption row arrives.
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
    gsap.fromTo(".sc-city", { opacity: 1 }, { opacity: 0, duration: 0.3, yoyo: true, repeat: 1, repeatDelay: 0.25 });
  });

  const p = projects[shown];

  return (
    <section ref={root} id="work" aria-label="Selected projects" className="relative h-[280vh]">
      {/* The page ground shows around the slide: no backdrop, nothing drawn over the photo.
          Header height --hh: 72px, 88px on desktop. */}
      <div className="sticky top-0 flex h-svh items-center justify-center pt-[var(--hh)] [--hh:72px] md:[--hh:88px]">
        {/* Eyebrow, one 4:3 slide, caption row: all the width of the slide, which is as
            large as the screen and FRAME_MAX allow. */}
        <div style={{ width: `min(${FRAME_MAX}px, calc(100vw - 2 * var(--pad)), calc((100svh - var(--hh) - ${CHROME}px) * 4 / 3))` }}>
          <h2 className="cap sc-fade mb-4 text-muted">{showcase.eyebrow}</h2>

          <div className="sc-media relative aspect-[4/3] overflow-hidden will-change-[clip-path]">
            {projects.map((project, i) =>
              loaded.has(i) ? (
                <Photo
                  key={project.title}
                  ref={(el) => {
                    slides.current[i] = el;
                  }}
                  src={project.image.src}
                  alt={project.image.alt}
                  sizes={`min(${FRAME_MAX}px, 100vw)`}
                  style={project.image.focus ? { objectPosition: project.image.focus } : undefined}
                  className={`sc-img ${i === 0 ? "opacity-100" : "opacity-0"}`}
                />
              ) : null,
            )}
          </div>

          {/* Caption row. Phones: title on its own line, then location with the counter
              and arrows. Desktop: title over location on the left, counter and arrows right. */}
          <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-1">
            <div className="sc-title-mask overflow-hidden max-md:col-span-2 max-md:min-h-[65px]">
              <h3 ref={titleRef} className="font-cormorant text-[28px] font-medium leading-[1.15]">
                {p.title}
              </h3>
            </div>
            <p className="sc-city sc-fade col-start-1 font-outfit text-[12px] uppercase tracking-[.16em] text-ink/55 md:row-start-2">
              {p.city}
            </p>
            <div className="sc-fade col-start-2 flex items-center gap-4 md:row-span-2 md:row-start-1">
              <span className="font-outfit text-[12px] tabular-nums" aria-live="polite">
                {pad2(shown + 1)} / {pad2(projects.length)}
              </span>
              <div className="flex items-center gap-2">
                <Arrow dir="prev" onClick={() => go(-1)} />
                <Arrow dir="next" onClick={() => go(1)} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
