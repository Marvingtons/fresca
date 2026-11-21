"use client";

/**
 * Scroll animations for sections that are otherwise server-rendered, so their
 * copy (content/site.ts) stays out of the client JavaScript (docs/PERF.md).
 * Each component renders nothing; it finds its section by id and animates it
 * once GSAP has loaded (lib/gsap.ts). Animations only run under MOTION.
 */
import { useEffect } from "react";
import { useMotion } from "@/lib/gsap";
import { DESKTOP_MOTION, MOTION, revealLines } from "@/lib/motion";

const byId = (id: string) => document.getElementById(id)!;


export function PromisesMotion() {
  // The plan drawing (PlanIllustration) draws on once 35% of it is on screen.
  // Plain IntersectionObserver: it should not wait for GSAP.
  useEffect(() => {
    const plan = document.querySelector("#process [data-plan]");
    if (!plan) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        plan.querySelectorAll(".plan").forEach((svg) => svg.classList.add("drawn"));
        io.disconnect();
      },
      { threshold: 0.35 },
    );
    io.observe(plan);
    return () => io.disconnect();
  }, []);

  useMotion(
    ({ gsap }) => {
      const mm = gsap.matchMedia();
      mm.add(MOTION, () => {
        revealLines(gsap, byId("process"));
        // As each row rises the number darkens. Photos are never faded or veiled: an
        // earlier scrubbed veil left them part-washed whenever a row stopped short
        // of the trigger's end.
        gsap.utils.toArray<HTMLElement>(".promise-row").forEach((row) => {
          gsap.fromTo(
            row.querySelector(".promise-n"),
            { color: "#8a8478" }, // 3.3:1 on the ground, the minimum for 30px type
            { color: "#1D1C1A", ease: "none", scrollTrigger: { trigger: row, start: "top 85%", end: "top 35%", scrub: 0.8 } },
          );
        });
      });
      return () => mm.revert();
    },
    { scope: "process" },
  );
  return null;
}

export function FooterMotion() {
  useMotion(
    ({ gsap }) => {
      const mm = gsap.matchMedia();
      mm.add(MOTION, () => {
        // The giant wordmark rises into place.
        gsap.fromTo(
          ".f-word",
          { yPercent: 40 },
          { yPercent: 4, ease: "none", scrollTrigger: { trigger: byId("contact"), start: "center bottom", end: "bottom bottom", scrub: true } },
        );
      });
      return () => mm.revert();
    },
    { scope: "contact" },
  );
  return null;
}

/** Karen round 3: plates travel a third less than before, with heavier scrub smoothing. */
const PLATE_TRAVEL = 2 / 3;
const PLATE_SCRUB = 1.2;

export function StudioWallMotion({ drift }: { drift: number }) {
  useMotion(
    ({ gsap }) => {
      const mm = gsap.matchMedia();
      mm.add(MOTION, () => {
        revealLines(gsap, byId("about"));

        // The caption fades as it slides under the fixed header.
        gsap.to(".wall-caption", {
          opacity: 0,
          ease: "none",
          scrollTrigger: { trigger: ".wall-caption", start: "top 150px", end: "top 80px", scrub: true },
        });

        // Plates unmask from the bottom, then their label arrives; the photo drifts inside its frame.
        gsap.utils.toArray<HTMLElement>(".pl").forEach((pl) => {
          const enter = { trigger: pl, start: "top 92%" };
          gsap.fromTo(
            pl.querySelector(".pl-frame"),
            { clipPath: "inset(100% 0% 0% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "power3.out", scrollTrigger: enter },
          );
          gsap.from(pl.querySelector(".pl-label"), { opacity: 0, y: 8, duration: 0.8, delay: 0.35, ease: "power2.out", scrollTrigger: enter });
          // A top-anchored photo drifts a shorter way and ends flush with the
          // frame's top edge, so the top of the photo is never more than ~3% hidden.
          const img = pl.querySelector<HTMLElement>(".pl-img")!;
          const top = img.dataset.focus === "top";
          gsap.fromTo(
            img,
            { yPercent: (top ? -4 : -8) * PLATE_TRAVEL },
            { yPercent: top ? 0 : 8 * PLATE_TRAVEL, ease: "none", scrollTrigger: { trigger: pl, start: "top bottom", end: "bottom top", scrub: PLATE_SCRUB } },
          );

        });

        gsap.utils.toArray<HTMLElement>(".art-p").forEach((el) => {
          gsap.from(el, { opacity: 0, y: 20, duration: 1, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 88%" } });
        });
      });

      // Desktop: every word, plate and paragraph drifts up at its own speed.
      // Plates travel less and smooth more (PLATE_TRAVEL, PLATE_SCRUB).
      mm.add(DESKTOP_MOTION, () => {
        gsap.utils.toArray<HTMLElement>("[data-speed]").forEach((el) => {
          const plate = el.classList.contains("pl");
          const speed = parseFloat(el.dataset.speed ?? "1") * (plate ? PLATE_TRAVEL : 1);
          gsap.to(el, {
            y: () => -window.innerHeight * drift * speed,
            ease: "none",
            scrollTrigger: { trigger: byId("about"), start: "top bottom", end: "bottom top", scrub: plate ? PLATE_SCRUB : 0.8, invalidateOnRefresh: true },
          });
        });
      });
      return () => mm.revert();
    },
    { scope: "about" },
  );
  return null;
}
