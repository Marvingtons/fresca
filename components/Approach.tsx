"use client";

import { useRef } from "react";
import { approach } from "@/content/site";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { DESKTOP_MOTION } from "@/lib/motion";
import ApproachDrawing from "./ApproachDrawing";
import Photo from "./Photo";

const MOBILE_MOTION = "(max-width: 860px) and (prefers-reduced-motion: no-preference)";
const REDUCED = "(prefers-reduced-motion: reduce)";
const FOOT = 120; // ruler scale: 120px = 1 ft

// Pinned horizontal layout only on desktop with motion (`md:motion-safe:`);
// otherwise the panels stack vertically.
export default function Approach() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const panels = gsap.utils.toArray<HTMLElement>("[data-panel]");

      mm.add(DESKTOP_MOTION, () => {
        const track = root.current!.querySelector<HTMLElement>(".ap-track")!;
        const ruler = root.current!.querySelector<HTMLElement>(".ap-ruler")!;
        const readout = root.current!.querySelector<HTMLElement>(".ap-read")!;
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
              trigger: root.current,
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
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="approach"
      aria-label="My approach"
      className="blueprint relative py-24 text-ground md:motion-safe:h-svh md:motion-safe:overflow-hidden md:motion-safe:py-0"
    >
      <div className="pointer-events-none relative flex flex-col justify-center px-pad pb-14 md:motion-safe:absolute md:motion-safe:inset-0 md:motion-safe:pb-0">
        <hgroup>
          <h2 className="cap ap-l mb-7 block text-on-dark">{approach.eyebrow}</h2>
          <p className="font-serif text-[clamp(48px,7vw,120px)] font-normal leading-[.95]">
            <span className="ap-l block">{approach.heading[0]}</span>{" "}
            <span className="ap-r block text-right italic">{approach.heading[1]}</span>
          </p>
        </hgroup>
      </div>

      {/* Playhead: fixed at the center under the panels, reading the ruler position. */}
      <div className="ap-head-r" aria-hidden="true">
        <span className="ap-read">0′–0″</span>
        <i />
        <b />
      </div>

      <div className="ap-track relative flex flex-col gap-[72px] px-pad md:motion-safe:absolute md:motion-safe:left-0 md:motion-safe:top-1/2 md:motion-safe:origin-[0_50%] md:motion-safe:-translate-y-1/2 md:motion-safe:flex-row md:motion-safe:gap-[4vw] md:motion-safe:pl-[6vw] md:motion-safe:pr-[8vw]">
        {approach.panels.map((panel, i) => (
          <div
            key={panel.title}
            data-panel
            className="grid grid-cols-1 items-end gap-7 min-[768px]:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)] md:motion-safe:flex-[0_0_min(78vw,980px)]"
          >
            <div>
              <ApproachDrawing kind={panel.drawing} />
              <span className="font-serif text-[30px] italic text-gold">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mb-3.5 mt-2 font-serif text-[clamp(48px,5vw,84px)] font-normal leading-[.95]">{panel.title}</h3>
              <p className="max-w-[340px] text-on-dark">{panel.text}</p>
            </div>
            {/* Photo 4:5 and drawing 16:10 in every panel, both plain rectangles. The
                drawing overlaps the photo's lower left; the bottom padding is its overhang. */}
            <div className="relative pb-[16%] w-full md:motion-safe:max-w-[calc(min(62vh,560px)/1.06)] md:motion-safe:justify-self-end">
              <div className="relative ml-auto aspect-[4/5] w-[72%] overflow-hidden">
                <Photo src={panel.photo.src} alt={panel.photo.alt} sizes="(min-width: 861px) 32vw, 72vw" />
              </div>
              <div className="absolute bottom-0 left-0 aspect-[16/10] w-[56%] overflow-hidden">
                <Photo src={panel.board.src} alt={panel.board.alt} sizes="(min-width: 861px) 25vw, 56vw" />
              </div>
            </div>
          </div>
        ))}
        {/* Moves and scales with the track. Labels are generated in JS. */}
        <div className="ap-ruler" aria-hidden="true" />
      </div>
    </section>
  );
}
