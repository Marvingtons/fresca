"use client";

import { useRef } from "react";
import { approach } from "@/content/site";
import { useMotion } from "@/lib/gsap";
import { MOTION } from "@/lib/motion";
import ApproachDrawing from "./ApproachDrawing";
import Photo from "./Photo";

/** Every animation here eases behind the scroll by this much (the one-off drawings excepted). */
const SCRUB = 1.2;
/**
 * Titles and paragraphs travel at this fraction of the drawings' speed once
 * their card has passed the viewport centre (aligned until then, so text never
 * runs ahead of its card). 0.92 read as misalignment at 1440, hence 0.96.
 */
const TEXT_SPEED = 0.96;
/** The ruler reads 0′ to this many feet across the cards' travel. */
const FEET = 16;
/** A drawing draws when its card's left edge crosses this fraction of the viewport width. */
const DRAW_AT = 0.6;

/**
 * Beats, as fractions of the pin's scroll distance. The section's height in
 * app/globals.css is sized so the travel (TRAVEL_FROM to 1) moves the cards
 * about 1px per pixel scrolled: keep APPROACH_PIN there equal to 1 / (1 - TRAVEL_FROM).
 */
const GRID = [0, 0.2]; // grid lines draw in
const DOCK = [0.2, 0.35]; // headline scales down to the docked line
const LABEL_OUT = [0.28, 0.35]; // the (04) label fades as the docked line arrives
const TRAVEL_FROM = 0.3; // cards start in from the right edge
const EXIT = [0.9, 1]; // cards slow to a stop, the navy lightens 4% toward ivory

/**
 * (04) Approach. With motion the section holds one screen (CSS sticky, so
 * engaging and releasing the hold shifts nothing) while one scrubbed timeline
 * plays through it:
 *   1. the grid lines draw in: verticals from the top, horizontals from the left;
 *   2. the two-line headline scales into a 28px docked line, top left;
 *   3. the cards travel left, drawings at full speed and their text a little
 *      slower; a crosshair rides the scroll position behind them and the ruler
 *      reads the distance under the viewport centre;
 *   4. the cards ease to a stop with the last one centred.
 * Each drawing draws once, on a timer, when its card crosses DRAW_AT.
 * Without motion nothing pins: headline, then the three cards in a column,
 * drawings complete (app/globals.css).
 *
 * Performance: transforms and opacity only, will-change on what moves, no
 * filters. ScrollTrigger refreshes itself 200ms after a resize stops, and
 * everything is reverted on unmount (useMotion's context and matchMedia).
 */
export default function Approach() {
  const root = useRef<HTMLElement>(null);

  useMotion(
    ({ gsap, ScrollTrigger }) => {
      const mm = gsap.matchMedia();

      mm.add(MOTION, () => {
        const section = root.current!;
        const q = gsap.utils.selector(section);
        const one = (sel: string) => q(sel)[0] as HTMLElement;
        const track = one(".ap-track");
        const ruler = one(".ap-ruler");
        const readout = one(".ap-read-val");
        const headline = one(".ap-headline");
        const dockAt = one(".ap-dock");
        const [line1, line2] = q(".ap-headline .rv-line-mask") as HTMLElement[];
        const cards = q("[data-card]") as HTMLElement[];
        const last = cards[cards.length - 1];
        const rulerLabels = q(".ap-ruler span") as HTMLElement[];

        // Measured on every refresh, from layout boxes (offset*), which transforms never change.
        let width = 0;
        let startX = 0;
        let endX = 0;
        let foot = 1;
        let centres: number[] = [];
        let lefts: number[] = [];
        const measure = () => {
          width = section.clientWidth;
          startX = width; // first card just off the right edge
          endX = width / 2 - (last.offsetLeft + last.offsetWidth / 2); // last card centred
          foot = (startX - endX) / FEET;
          lefts = cards.map((c) => c.offsetLeft);
          centres = cards.map((c) => c.offsetLeft + c.offsetWidth / 2);
          // Ruler: 0′ under the centre at the start, a tick every inch and every foot.
          ruler.style.setProperty("--ft", `${foot}px`);
          rulerLabels.forEach((label, i) => (label.style.left = `${i * foot}px`));
        };
        measure();
        ScrollTrigger.addEventListener("refreshInit", measure);

        // The docked headline, from untransformed boxes in .ap's coordinates.
        const headTop = () => headline.offsetTop - headline.offsetHeight / 2; // .ap-headline is centred with translate -50%
        const dockScale = () => parseFloat(getComputedStyle(dockAt).fontSize) / parseFloat(getComputedStyle(line1).fontSize);

        // Card text and the crosshair follow the track. Per-frame setters, no tweens.
        const textSetters = cards.map((card) => (q(`[data-card="${card.dataset.card}"] .ap-text`) as HTMLElement[]).map((el) => gsap.quickSetter(el, "x", "px")));
        const rulerX = gsap.quickSetter(ruler, "x", "px");
        const crossX = gsap.quickSetter(one(".ap-cross"), "x", "px");
        let reading = "";
        let hidden = -1;

        const follow = () => {
          const x = gsap.getProperty(track, "x") as number;
          const travelled = Math.min(Math.max(startX - x, 0), startX - endX);
          const centre = width / 2;
          cards.forEach((card, i) => {
            const offset = (1 - TEXT_SPEED) * Math.max(centre - (centres[i] + x), 0);
            textSetters[i].forEach((set) => set(offset));
            if (!card.classList.contains("drawn") && lefts[i] + x < width * DRAW_AT) card.classList.add("drawn");
          });
          crossX(width * (0.1 + (0.8 * travelled) / (startX - endX || 1)));
          rulerX(x - startX);
          // Readout in feet and inches; the ruler's own number under it steps aside.
          const inches = Math.round((travelled / foot) * 12);
          const text = `${Math.floor(inches / 12)}′ ${inches % 12}″`;
          if (text !== reading) readout.textContent = reading = text;
          const near = Math.round(travelled / foot);
          const next = Math.abs(travelled / foot - near) < 0.5 ? near : -1;
          if (next !== hidden) {
            rulerLabels[hidden]?.style.removeProperty("opacity");
            if (rulerLabels[next]) rulerLabels[next].style.opacity = "0";
            hidden = next;
          }
        };

        const span = (range: number[]) => range[1] - range[0];
        // Cards travel linearly, then ease out over the last 10% with no jump in
        // speed: power1.out starts at twice its average, so the eased stretch
        // covers half of what the linear speed would.
        const linear = EXIT[0] - TRAVEL_FROM;
        const midX = () => startX - (startX - endX) * (linear / (linear + span(EXIT) / 2));

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: section, start: "top top", end: "bottom bottom", scrub: SCRUB, invalidateOnRefresh: true },
          onUpdate: follow,
        });
        tl.fromTo(".ap-grid-v", { scaleY: 0 }, { scaleY: 1, duration: span(GRID) }, GRID[0])
          .fromTo(".ap-grid-h", { scaleX: 0 }, { scaleX: 1, duration: span(GRID) }, GRID[0])
          .fromTo(
            line1,
            { x: 0, y: 0, scale: 1 },
            { x: () => dockAt.offsetLeft - headline.offsetLeft - line1.offsetLeft, y: () => dockAt.offsetTop - headTop() - line1.offsetTop, scale: dockScale, duration: span(DOCK), ease: "power2.inOut" },
            DOCK[0],
          )
          .fromTo(
            line2,
            { x: 0, y: 0, scale: 1 },
            {
              // After line 1 at its docked width, one word space along.
              x: () => dockAt.offsetLeft + line1.offsetWidth * dockScale() + parseFloat(getComputedStyle(dockAt).fontSize) * 0.24 - headline.offsetLeft - line2.offsetLeft,
              y: () => dockAt.offsetTop - headTop() - line2.offsetTop,
              scale: dockScale,
              duration: span(DOCK),
              ease: "power2.inOut",
            },
            DOCK[0],
          )
          .fromTo(".ap-label", { opacity: 1 }, { opacity: 0, duration: span(LABEL_OUT), immediateRender: false }, LABEL_OUT[0])
          .fromTo([".ap-ruler", ".ap-read", ".ap-cross"], { opacity: 0 }, { opacity: 1, duration: span(DOCK) }, DOCK[0])
          .fromTo(track, { x: () => startX }, { x: midX, duration: linear }, TRAVEL_FROM)
          .to(track, { x: () => endX, duration: span(EXIT), ease: "power1.out" }, EXIT[0])
          .fromTo(".ap-exit", { opacity: 0 }, { opacity: 0.04, duration: span(EXIT) }, EXIT[0]);

        // Before the hold: the headline rises into its masks and the label fades
        // in as the section scrolls up to the top, scrubbed like the rest.
        gsap
          .timeline({ scrollTrigger: { trigger: section, start: "top 85%", end: "top top", scrub: SCRUB } })
          .fromTo(".ap-headline .rv-line", { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.15, ease: "power2.out" }, 0)
          .fromTo(".ap-label", { opacity: 0 }, { opacity: 1, ease: "none" }, 0);

        follow();
        return () => {
          ScrollTrigger.removeEventListener("refreshInit", measure);
          cards.forEach((card) => card.classList.remove("drawn"));
          gsap.set([ruler, readout, ...q(".ap-text"), ...rulerLabels], { clearProps: "all" });
        };
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="approach" aria-label="My approach" className="ap-wrap text-ground">
      <div className="blueprint ap relative overflow-hidden px-6 py-24 md:px-12">
        {/* Drawn grid: verticals extend from the top, horizontals from the left. */}
        <div className="ap-grid ap-grid-v" aria-hidden="true" />
        <div className="ap-grid ap-grid-h" aria-hidden="true" />
        {/* Ivory veil for the exit: the navy lightens 4% toward the next section. */}
        <div className="ap-exit" aria-hidden="true" />

        <hgroup>
          <h2 className="ap-label cap text-on-dark">{approach.eyebrow}</h2>
          <p className="ap-headline font-cormorant text-[clamp(34px,7vw,112px)] font-medium leading-[.95]">
            <span className="rv-line-mask">
              <span className="rv-line">{approach.heading[0]}</span>
            </span>{" "}
            <span className="rv-line-mask">
              <span className="rv-line">
                <em>{approach.heading[1]}</em>
              </span>
            </span>
          </p>
        </hgroup>
        {/* Where the headline docks. Its font size is the docked size. */}
        <span className="ap-dock" aria-hidden="true" />

        <div className="ap-stage">
          {/* Drafting-table cursor behind the cards (z-index -1), riding the scroll position. */}
          <div className="ap-cross" aria-hidden="true" />
          <div className="ap-track">
            {approach.panels.map((panel, i) => (
              <article key={panel.title} data-card={i} className="ap-card">
                <div className="ap-text flex items-baseline gap-4">
                  <span className="font-cormorant text-[20px] font-medium italic leading-none text-terracotta">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="font-cormorant text-[40px] font-medium leading-none">{panel.title}</h3>
                </div>
                <div className="ap-photo">
                  <Photo src={panel.photo.src} alt={panel.photo.alt} sizes="(min-width: 861px) 220px, min(420px, 90vw)" box={4 / 5} style={{ objectPosition: panel.photo.focus }} />
                </div>
                <div className="ap-box">
                  <ApproachDrawing kind={panel.drawing} />
                </div>
                <div className="ap-text">
                  <p className="mt-4 max-w-[34ch] font-outfit text-[15px] font-light leading-[1.6] text-ground/80">{panel.text}</p>
                  <div className="mt-5 h-px bg-ground/20" />
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Measurement ruler: travels with the cards; the readout stays at the centre. 768px and up. */}
        <div className="ap-ruler" aria-hidden="true">
          {Array.from({ length: FEET + 1 }, (_, i) => (
            <span key={i}>{i}′</span>
          ))}
        </div>
        <div className="ap-read" aria-hidden="true">
          <i />
          <span className="ap-read-val">0′ 0″</span>
        </div>
      </div>
    </section>
  );
}
