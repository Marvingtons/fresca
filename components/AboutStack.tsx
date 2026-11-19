"use client";

import Image from "next/image";
import { useRef } from "react";
import { about } from "@/content/site";
import { gsap, useGSAP } from "@/lib/gsap";
import { MOTION, revealLines } from "@/lib/motion";
import Copy, { isPlaceholder } from "./Copy";
import Line from "./LineReveal";

export default function AboutStack() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION, () => {
        revealLines(root.current!);
        // Each card shrinks and darkens as the next one stacks over it. The darkening
        // is a black layer fading to .45 (the same result as filter: brightness(.55))
        // because animating a filter on a large photo repaints every frame.
        const cards = gsap.utils.toArray<HTMLElement>(".scard");
        cards.slice(0, -1).forEach((card, i) => {
          const st = { trigger: cards[i + 1], start: "top bottom", end: "top 20%", scrub: true };
          gsap.to(card, { scale: 0.9, ease: "none", scrollTrigger: st });
          gsap.fromTo(card.querySelector(".scard-dim"), { opacity: 0 }, { opacity: 0.45, ease: "none", scrollTrigger: st });
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="about-us" className="flex flex-wrap gap-x-16 gap-y-12 px-pad pb-10 pt-[clamp(96px,14vh,160px)]">
      <div className="min-w-0 flex-[1_1_340px]">
        <div className="sticky top-[16vh]">
          <p className="cap mb-5 text-muted">{about.eyebrow}</p>
          <h2 className="mb-7 font-serif text-[clamp(48px,6vw,104px)] font-normal leading-[.95]">
            <Line>{about.heading[0]}</Line>
            <Line>
              <em>{about.heading[1]}</em>
            </Line>
          </h2>
          <p className="mb-7 max-w-[420px] text-body">
            <Copy text={about.text} />
          </p>
          <a className="pill pill-line" href={about.link.href}>
            {about.link.label}
          </a>
        </div>
      </div>

      <div className="min-w-0 flex-[1.3_1_480px] pb-[10vh]">
        {about.stats.map((stat, i) => (
          <div
            key={stat.label}
            style={{ top: `calc(14vh + ${i * 22}px)` }}
            className="scard sticky isolate mb-[6vh] h-[68vh] min-h-[420px] origin-top overflow-hidden rounded-lg text-white will-change-transform"
          >
            <Image src={stat.image.src} alt={stat.image.alt} fill quality={85} sizes="(min-width: 861px) 55vw, 100vw" className="object-cover" />
            <div className="absolute inset-0 bg-[rgba(16,15,13,.36)]" />
            <div className="cap absolute inset-x-7 top-6 z-[2] flex justify-between">
              <span>{stat.label}</span>
              <span>{String(i + 1).padStart(2, "0")}</span>
            </div>
            {isPlaceholder(stat.value) ? (
              <span className="absolute bottom-6 left-6 z-[2] rounded bg-ground px-3 py-2 text-xl">
                <Copy text={stat.value} />
              </span>
            ) : (
              <span className="absolute bottom-3 left-6 z-[2] font-serif text-[clamp(110px,14vw,220px)] leading-[.9]">{stat.value}</span>
            )}
            <div aria-hidden="true" className="scard-dim pointer-events-none absolute inset-0 z-[3] bg-black opacity-0" />
          </div>
        ))}
      </div>
    </section>
  );
}
