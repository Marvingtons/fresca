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

// Approach
const MOBILE_MOTION = "(max-width: 860px) and (prefers-reduced-motion: no-preference)";
const REDUCED = "(prefers-reduced-motion: reduce)";
const FOOT = 120; // ruler scale: 120px = 1 ft

export function AboutMotion() {
  useMotion(
    ({ gsap }) => {
      const mm = gsap.matchMedia();
      mm.add(MOTION, () => {
        revealLines(gsap, byId("about-us"));
        // The quote's words light up one by one as it scrolls through the screen.
        // They start at 0.5, the faintest that still reads at 3:1 (large text).
        gsap.fromTo(
          ".w",
          { opacity: 0.5 },
          { opacity: 1, stagger: 0.08, ease: "none", scrollTrigger: { trigger: ".about-quote", start: "top 80%", end: "bottom 55%", scrub: true } },
        );
      });
      return () => mm.revert();
    },
    { scope: "about-us" },
  );
  return null;
}

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
        revealLines(gsap, byId("contact"));
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
          // frame's top edge, so the top of the photo is never more than ~4% hidden.
          const img = pl.querySelector<HTMLElement>(".pl-img")!;
          const top = img.dataset.focus === "top";
          gsap.fromTo(
            img,
            { yPercent: top ? -4 : -8 },
            { yPercent: top ? 0 : 8, ease: "none", scrollTrigger: { trigger: pl, start: "top bottom", end: "bottom top", scrub: 0.8 } },
          );

        });

        gsap.utils.toArray<HTMLElement>(".art-p").forEach((el) => {
          gsap.from(el, { opacity: 0, y: 20, duration: 1, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 88%" } });
        });
      });

      // Desktop: every word, plate and paragraph drifts up at its own speed.
      mm.add(DESKTOP_MOTION, () => {
        gsap.utils.toArray<HTMLElement>("[data-speed]").forEach((el) => {
          const speed = parseFloat(el.dataset.speed ?? "1");
          gsap.to(el, {
            y: () => -window.innerHeight * drift * speed,
            ease: "none",
            scrollTrigger: { trigger: byId("about"), start: "top bottom", end: "bottom top", scrub: 0.8, invalidateOnRefresh: true },
          });
        });
      });
      return () => mm.revert();
    },
    { scope: "about" },
  );
  return null;
}

export function ApproachMotion() {
  useMotion(
    ({ gsap, ScrollTrigger }) => {
      const mm = gsap.matchMedia();
      const panels = gsap.utils.toArray<HTMLElement>("[data-panel]");

      mm.add(DESKTOP_MOTION, () => {
        const track = byId("approach").querySelector<HTMLElement>(".ap-track")!;
        const ruler = byId("approach").querySelector<HTMLElement>(".ap-ruler")!;
        const readout = byId("approach").querySelector<HTMLElement>(".ap-read")!;
        const dist = () => track.scrollWidth - window.innerWidth;
        gsap.set(track, { y: 0, yPercent: -50 });

        // Ruler labels every 2 ft along the track; rebuilt whenever triggers refresh.
        const buildRuler = () => {
          ruler.textContent = "";
          for (let px = 0; px < track.scrollWidth; px += FOOT * 2) {
            const label = document.createElement("span");
            label.style.left = `${px}px`;
            label.textContent = `${px / FOOT}′`;
            ruler.appendChild(label);
          }
        };
        buildRuler();
        ScrollTrigger.addEventListener("refreshInit", buildRuler);

        // Playhead readout in feet and inches; panels draw once their left edge passes 72%.
        const update = () => {
          const x = Number(gsap.getProperty(track, "x"));
          const pos = Math.max(0, (window.innerWidth / 2 - x) / FOOT);
          let feet = Math.floor(pos);
          let inches = Math.round((pos - feet) * 12);
          if (inches === 12) {
            feet++;
            inches = 0;
          }
          readout.textContent = `${feet}′–${inches}″`;
          panels.forEach((p) => {
            if (p.getBoundingClientRect().left < window.innerWidth * 0.72) p.classList.add("drawn");
          });
        };

        // The headline halves split apart while the track scales in, then the track scrolls sideways.
        gsap
          .timeline({
            scrollTrigger: {
              trigger: byId("approach"),
              start: "top top",
              end: () => `+=${dist() + window.innerHeight * 1.4}`,
              pin: true,
              scrub: 1,
              invalidateOnRefresh: true,
              onUpdate: update,
            },
          })
          .to(".ap-l", { xPercent: -40, yPercent: -160, ease: "none", duration: 1 }, 0)
          .to(".ap-r", { xPercent: 30, yPercent: 160, ease: "none", duration: 1 }, 0)
          .to(".ap-l, .ap-r", { opacity: 0, ease: "power1.in", duration: 0.45 }, 0)
          // No opacity here: a scrubbed fade left the photos part-transparent mid-scroll.
          .fromTo(track, { scale: 0.5, x: () => window.innerWidth * 0.3 }, { scale: 1, x: 0, ease: "power2.out", duration: 1.1 }, 0.35)
          .fromTo(".ap-head-r", { opacity: 0 }, { opacity: 1, duration: 0.4 }, 1.1)
          .to(track, { x: () => -dist(), ease: "none", duration: 3 }, 1.35);

        return () => ScrollTrigger.removeEventListener("refreshInit", buildRuler);
      });

      // Mobile: each drawing plays once its panel is 75% of the way up the screen.
      mm.add(MOBILE_MOTION, () => {
        panels.forEach((p) => {
          ScrollTrigger.create({ trigger: p, start: "top 75%", once: true, onEnter: () => p.classList.add("drawn") });
        });
      });

      // Reduced motion: drawings are simply shown.
      mm.add(REDUCED, () => {
        panels.forEach((p) => p.classList.add("drawn"));
      });
      return () => mm.revert();
    },
    { scope: "approach" },
  );
  return null;
}
