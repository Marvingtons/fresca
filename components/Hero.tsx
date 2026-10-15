"use client";

import Image from "next/image";
import { useRef } from "react";
import { cta, hero } from "@/content/site";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { INTRO_KEY } from "@/lib/intro";
import { MOTION } from "@/lib/motion";
import Line from "./LineReveal";
import { useSmoothScroll } from "./SmoothScroll";

/** The hero image's `sizes`. The preloader's last thumbnail uses the same value,
 *  so both load the same file and the handoff swaps identical pixels. */
const HERO_SIZES = "(min-width: 861px) min(944px, 52vw), 100vw";

/** Resolves when web fonts are ready, or after 1.5s so a slow font never blocks the page. */
const fontsReady = () => Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise((r) => window.setTimeout(r, 1500))]);

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const { start } = useSmoothScroll();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION, () => {
        const html = document.documentElement;
        if (!html.classList.contains("hero-in")) return; // client-side return: render final
        window.__introTakenOver = true;
        const preloader = html.classList.contains("intro");
        const el = root.current!;
        const media = el.querySelector<HTMLElement>(".hero-media")!;
        const photo = el.querySelector(".hero-final");
        const lines = el.querySelectorAll(".hero-ln > span");
        const fades = el.querySelectorAll(".hero-fade");
        const header = document.querySelector(".site-header");
        if (preloader) {
          window.scrollTo(0, 0);
          document.body.classList.add("scroll-lock");
        }

        let tl: gsap.core.Timeline | null = null;
        let done = false;
        const finish = () => {
          if (done) return;
          done = true;
          window.removeEventListener("keydown", onKey);
          if (preloader) {
            try {
              sessionStorage.setItem(INTRO_KEY, "1");
            } catch {}
            gsap.set([media, header, thumbRef.current], { clearProps: "all" });
            document.body.classList.remove("scroll-lock");
            start();
          }
          html.classList.remove("intro", "hero-in");
          ScrollTrigger.refresh();
        };
        const onKey = (e: KeyboardEvent) => {
          if (e.key !== "Escape") return;
          if (tl) tl.progress(1);
          else finish();
        };
        window.addEventListener("keydown", onKey);

        let cancelled = false;
        // The headline must not reveal on fallback metrics, so nothing starts before fonts.
        fontsReady().then(() => {
          if (cancelled || done) return;
          tl = gsap.timeline({ onComplete: finish });
          // y: 0 replaces the pre-paint translateY(110%), which GSAP would otherwise read as a px offset.
          const rise = { y: 0, yPercent: 0, duration: 0.4, stagger: 0.035, ease: "power3.out" };
          const fadeIn = { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.04, ease: "power2.out" };

          if (!preloader) {
            // Later visits this session: no preloader, just the hero entrance.
            if (photo) tl.fromTo(photo, { scale: 1.03 }, { scale: 1, duration: 1, ease: "power2.out", clearProps: "transform" }, 0);
            tl.fromTo(lines, { y: 0, yPercent: 110 }, { ...rise, duration: 0.65, stagger: 0.06 }, 0.3);
            tl.fromTo(fades, { autoAlpha: 0, y: 14 }, { ...fadeIn, duration: 0.5 }, 0.5);
            return;
          }

          // Preloader (2.2s): the counter eases 000 → 100 while kept photos cycle in the
          // thumbnail, ~0.3s each, ending on the hero photo. Then the thumbnail expands
          // into the hero frame and hands off to the real hero image.
          const thumb = thumbRef.current!;
          const frames = thumb.querySelectorAll<HTMLElement>(".intro-frame");
          const counter = { v: 0 };
          tl.to(
            counter,
            {
              v: 100,
              duration: 1.45,
              ease: "power2.inOut",
              onUpdate: () => {
                if (countRef.current) countRef.current.textContent = String(Math.round(counter.v)).padStart(3, "0");
              },
            },
            0,
          );
          frames.forEach((frame, i) => {
            if (i) tl!.set(frame, { autoAlpha: 1 }, 0.3 * i);
          });

          // FLIP. Last: the hero frame's real box. First: the thumbnail as it sits now.
          // The thumbnail takes the hero frame's box and is transformed back down to
          // where it was (no visible change), so the expand animates the transform to
          // identity and ends exactly on the hero frame. Same 4:3 ratio, so the scale
          // is uniform and the crop never changes.
          const first = thumb.getBoundingClientRect();
          const last = media.getBoundingClientRect();
          const scale = first.width / last.width;
          gsap.set(thumb, {
            left: last.left,
            top: last.top,
            width: last.width,
            height: last.height,
            xPercent: 0,
            yPercent: 0,
            x: first.left - last.left,
            y: first.top - last.top,
            scale,
            transformOrigin: "0 0",
            borderRadius: 3 / scale,
            autoRound: false, // sub-pixel box, so it lands exactly on the hero frame
          });

          tl.to(".intro-text", { autoAlpha: 0, duration: 0.3, ease: "power1.out" }, 1.45)
            .to(thumb, { x: 0, y: 0, scale: 1, borderRadius: 3, duration: 0.6, ease: "power3.inOut" }, 1.45)
            // Handoff: identical box, image file and crop, so the swap is invisible.
            .set(media, { autoAlpha: 1 }, 2.05)
            .set(thumb, { autoAlpha: 0 }, 2.05)
            .fromTo(lines, { y: 0, yPercent: 110 }, rise, 1.7)
            .fromTo(fades, { autoAlpha: 0, y: 14 }, { ...fadeIn, duration: 0.32, stagger: 0.03 }, 1.8)
            .to(header, { autoAlpha: 1, duration: 0.35, ease: "power1.out" }, 1.85);
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
          <Image src={hero.image.src} alt={hero.image.alt} fill priority sizes={HERO_SIZES} quality={85} className="hero-final object-cover" />
        </div>
      </div>

      {/* Preloader, server-rendered so the label, counter and first thumbnail are the
          first painted frame. Shown only under html.intro. */}
      <div aria-hidden="true" className="intro-ui pointer-events-none fixed inset-0 z-[45] text-ink">
        <div className="intro-text absolute inset-0 flex flex-col items-center justify-between pb-[18vh] pt-[24vh]">
          <span className="cap">{hero.introLabel}</span>
          <span ref={countRef} className="font-serif text-xl tabular-nums">
            000
          </span>
        </div>
        <div
          ref={thumbRef}
          className="intro-thumb fixed left-1/2 top-1/2 aspect-[4/3] w-[clamp(140px,17vw,260px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[3px]"
        >
          {[...hero.cycle, hero.image.src].map((src, i, all) => {
            const isHero = i === all.length - 1;
            return (
              <div key={src} className="intro-frame absolute inset-0">
                {/* Earlier frames only ever show at thumbnail size. The last is the hero
                    photo at the hero's own sizes, so it lands as the same pixels. */}
                <Image src={src} alt="" fill priority={i === 0 || isHero} sizes={isHero ? HERO_SIZES : "260px"} quality={85} className="object-cover" />
              </div>
            );
          })}
        </div>
      </div>

      <div aria-hidden="true" className="cap hero-fade absolute bottom-7 left-pad flex items-center gap-3 text-muted max-md:hidden">
        <i className="relative block h-9 w-px overflow-hidden bg-ink/20 after:absolute after:left-0 after:top-[-100%] after:h-full after:w-px after:animate-cue after:bg-ink after:content-['']" />
        Scroll
      </div>
    </section>
  );
}
