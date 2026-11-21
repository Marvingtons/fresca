"use client";

import { useRef } from "react";
import { approach } from "@/content/site";
import { useMotion } from "@/lib/gsap";
import { MOTION } from "@/lib/motion";
import ApproachDrawing from "./ApproachDrawing";
import Reveal from "./Reveal";

// The pin is scrolled in two parts: the headline holds alone, then the cards
// travel. HOLD is the first part as a fraction of the travel distance.
const HOLD = 0.3;
const RULER_LABELS = 28; // one every 2 ft at 120px to the foot

/**
 * (04) Approach. With motion the section holds one screen (CSS sticky) and plays in beats:
 *   1. the headline alone, two lines;
 *   2. the headline shrinks to one line and docks under the label (600ms, by
 *      time, not by scroll) while the cards come in from the right;
 *   3. the cards travel left; each drawing draws once, when its card's leading
 *      edge crosses the centre line. The pin ends with the last card centred.
 * Without motion nothing pins: headline, then the three cards in a column,
 * drawings complete (app/globals.css).
 */
export default function Approach() {
  const root = useRef<HTMLElement>(null);

  useMotion(
    ({ gsap, ScrollTrigger }) => {
      const mm = gsap.matchMedia();

      mm.add(MOTION, () => {
        const section = root.current!;
        const q = gsap.utils.selector(section);
        const track = q(".ap-track")[0] as HTMLElement;
        const ruler = q(".ap-ruler")[0] as HTMLElement;
        const dockAt = q(".ap-dock")[0] as HTMLElement;
        const [line1, line2] = q(".ap-headline .rv-line-mask") as HTMLElement[];
        const cards = q("[data-card]") as HTMLElement[];
        const last = cards[cards.length - 1];

        const startX = () => section.clientWidth; // first card just off the right edge
        const endX = () => section.clientWidth / 2 - (last.offsetLeft + last.offsetWidth / 2); // last card centred
        const travel = () => startX() - endX();

        // No ScrollTrigger pin: .ap is position: sticky inside the section, whose
        // height is set in CSS (app/globals.css). Nothing is resized or moved in
        // or out of the flow when the pin starts and ends, so nothing shifts.
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
            invalidateOnRefresh: true,
            onUpdate: (self) => setDocked(self.progress),
          },
        });
        tl.to({}, { duration: HOLD })
          .fromTo(track, { x: startX }, { x: endX, ease: "none", duration: 1 }, HOLD)
          .fromTo(ruler, { x: 0 }, { x: () => -travel(), ease: "none", duration: 1 }, HOLD);

        // Each drawing draws once, when its card's left edge passes the centre.
        const draw = () => {
          const centre = section.clientWidth / 2;
          for (const card of cards) {
            if (!card.classList.contains("drawn") && card.getBoundingClientRect().left < centre) card.classList.add("drawn");
          }
        };
        tl.eventCallback("onUpdate", draw);

        // Beat 2: the two headline lines scale down and line up as one, at the
        // dock marker under the label. Transform and opacity only, so nothing
        // reflows. Rebuilt on every refresh because it is measured.
        let dock: gsap.core.Timeline | undefined;
        let docked = false;
        const setDocked = (progress: number) => {
          // Halfway through the hold, so it has landed by the time the cards arrive.
          const next = progress * (1 + HOLD) > HOLD / 2;
          if (next === docked) return;
          docked = next;
          if (docked) dock?.play();
          else dock?.reverse();
        };
        const buildDock = () => {
          dock?.kill();
          gsap.set([line1, line2], { clearProps: "transform" });
          const size = parseFloat(getComputedStyle(line1).fontSize);
          const scale = parseFloat(getComputedStyle(dockAt).fontSize) / size;
          const a = line1.getBoundingClientRect();
          const b = line2.getBoundingClientRect();
          const to = dockAt.getBoundingClientRect();
          const gap = size * scale * 0.24; // a word space
          dock = gsap
            .timeline({ paused: true, defaults: { duration: 0.6, ease: "power2.inOut" } })
            .to(line1, { x: to.left - a.left, y: to.top - a.top, scale }, 0)
            .to(line2, { x: to.left + a.width * scale + gap - b.left, y: to.top - b.top, scale }, 0)
            .to(ruler, { opacity: 1 }, 0);
          dock.progress(docked ? 1 : 0);
        };
        buildDock();
        ScrollTrigger.addEventListener("refresh", buildDock);

        return () => {
          ScrollTrigger.removeEventListener("refresh", buildDock);
          dock?.kill();
          gsap.set([line1, line2, ruler], { clearProps: "all" });
        };
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="approach" aria-label="My approach" className="ap-wrap text-ground">
      <div className="blueprint ap relative overflow-hidden px-6 py-24 md:px-12">
        <hgroup>
          <Reveal as="h2" variant="fade" className="ap-label cap text-on-dark">
            {approach.eyebrow}
          </Reveal>
          <Reveal
            as="p"
            variant="lines"
            lines={[approach.heading[0], <em key="2">{approach.heading[1]}</em>]}
            className="ap-headline font-cormorant text-[clamp(34px,7vw,112px)] font-medium leading-[.95]"
          />
        </hgroup>
        {/* Where the headline docks in beat 2. Its font size is the docked size. */}
        <span className="ap-dock" aria-hidden="true" />

        <div className="ap-stage">
          <div className="ap-track">
            {approach.panels.map((panel, i) => (
              <article key={panel.title} data-card className="ap-card">
                <div className="flex items-baseline gap-4">
                  <span className="font-cormorant text-[20px] font-medium italic leading-none text-terracotta">{String(i + 1).padStart(2, "0")}</span>
                  <Reveal as="h3" variant="lines" axis="x" className="font-cormorant text-[40px] font-medium leading-none">
                    {panel.title}
                  </Reveal>
                </div>
                {/* TODO(photo): if a photo is wanted per card, it goes here in its own slot above
                    the drawing, inside the card, never over the text. */}
                <div className="ap-box">
                  <ApproachDrawing kind={panel.drawing} />
                </div>
                <Reveal as="p" variant="fade" axis="x" className="mt-5 max-w-[34ch] font-outfit text-[15px] font-light leading-[1.6] text-ground/80">
                  {panel.text}
                </Reveal>
                <Reveal variant="rule" axis="x" className="mt-6 text-ground/20" />
              </article>
            ))}
          </div>
        </div>

        {/* Measurement ruler: travels with the cards. 768px and up, motion only. */}
        <div className="ap-ruler" aria-hidden="true">
          {Array.from({ length: RULER_LABELS }, (_, i) => (
            <span key={i} style={{ left: i * 240 }}>
              {i * 2}′
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
