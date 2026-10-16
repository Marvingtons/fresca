"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cta, hero } from "@/content/site";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { heroMedia } from "@/lib/media/hero";
import { MOTION, prefersReducedMotion } from "@/lib/motion";
import HeroMedia from "./HeroMedia";
import Preloader from "./Preloader";

const sceneAt = (t: number) => {
  let i = 0;
  hero.scenes.forEach((s, n) => {
    if (t >= s.from) i = n;
  });
  return i;
};

/**
 * The room name for the current shot, synced to the film's currentTime with a
 * requestVideoFrameCallback loop (timeupdate where that is missing). Labels
 * crossfade over 300ms with a 4px slide. Static text under reduced motion.
 */
function SceneLabel({ video }: { video: HTMLVideoElement | null }) {
  const a = useRef<HTMLSpanElement>(null);
  const b = useRef<HTMLSpanElement>(null);
  const [reduced, setReduced] = useState(false);
  useEffect(() => setReduced(prefersReducedMotion()), []);

  useEffect(() => {
    if (!video) return;
    let front = a.current!;
    let back = b.current!;
    let current = sceneAt(video.currentTime);
    front.textContent = hero.scenes[current].label;
    const change = (i: number) => {
      current = i;
      back.textContent = hero.scenes[i].label;
      gsap.killTweensOf([front, back]);
      gsap.to(front, { opacity: 0, y: -4, duration: 0.3, ease: "power1.inOut" });
      gsap.fromTo(back, { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: 0.3, ease: "power1.inOut" });
      [front, back] = [back, front];
    };
    const check = () => {
      const i = sceneAt(video.currentTime);
      if (i !== current) change(i);
    };
    let handle = 0;
    let stopped = false;
    // TypeScript's DOM types treat rVFC as always present; Firefox before 132 lacks it.
    if (typeof video.requestVideoFrameCallback === "function") {
      const loop = () => {
        if (stopped) return;
        check();
        handle = video.requestVideoFrameCallback(loop);
      };
      handle = video.requestVideoFrameCallback(loop);
      return () => {
        stopped = true;
        video.cancelVideoFrameCallback(handle);
      };
    }
    video.addEventListener("timeupdate", check);
    return () => video.removeEventListener("timeupdate", check);
  }, [video]);

  if (reduced) return <span className="block">{hero.staticScene}</span>;
  return (
    <span className="relative block">
      <span ref={a} className="block">
        {hero.scenes[0].label}
      </span>
      <span ref={b} className="absolute inset-x-0 top-0 block opacity-0" />
    </span>
  );
}

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  const onVideo = useCallback((v: HTMLVideoElement | null) => setVideo(v), []);

  useGSAP(
    () => {
      const html = document.documentElement;
      const heroEl = root.current!;
      // Nav colour, on every visit: bone over the hero, ink once it has scrolled out.
      // Depends only on the start, so it stays on at the very bottom of the page.
      const pastHero = ScrollTrigger.create({
        trigger: heroEl,
        start: "bottom top+=76",
        onEnter: () => html.classList.add("past-hero"),
        onLeaveBack: () => html.classList.remove("past-hero"),
        onRefresh: (self) => html.classList.toggle("past-hero", self.scroll() > self.start),
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
      return () => {
        mm.revert();
        pastHero.kill();
      };
    },
    { scope: root },
  );

  return (
    <section ref={root} id="top" aria-label="Fresca Interior Design" className="relative h-svh min-h-[520px] overflow-hidden bg-[#14110f] text-ground">
      {/* Media: full bleed, cover, parallax on this wrapper. */}
      <div className="hero-media absolute inset-0">
        <HeroMedia media={heroMedia} alt={hero.mediaAlt} onVideo={onVideo} />
      </div>
      {/* One shade at the bottom for the caption, the thin one at the top for the
          nav. Nothing in the middle of the frame. */}
      <div aria-hidden="true" className="hero-shade-top pointer-events-none absolute inset-x-0 top-0" />
      <div aria-hidden="true" className="hero-shade-bottom pointer-events-none absolute inset-x-0 bottom-0" />

      {/* Caption and CTA: 40px above the bottom edge, in the gutter, on one baseline. */}
      <div className="absolute inset-x-pad bottom-10 flex items-end justify-between gap-6">
        <div className="hero-caption min-w-0">
          <span className="mb-2 block text-[10px] uppercase tracking-[.3em] opacity-70">
            <SceneLabel video={video} />
          </span>
          <p className="text-[15px] leading-[1.35] tracking-[.02em]">{hero.caption}</p>
        </div>
        <a href={cta.href} className="hero-cta shrink-0 text-[15px] leading-[1.35] tracking-[.02em]">
          {cta.label} <span aria-hidden="true">→</span>
        </a>
      </div>

      <Preloader />
    </section>
  );
}
