"use client";

import { useRef } from "react";
import { cta, hero } from "@/content/site";
import { gsap, useGSAP } from "@/lib/gsap";
import { MOTION, revealLines } from "@/lib/motion";
import Line from "./LineReveal";

/** The page's main statement, first section under the film. Lines rise from their masks on scroll. */
export default function Statement() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION, () => {
        revealLines(root.current!);
        gsap.from(".st-fade", { opacity: 0, y: 14, duration: 0.9, stagger: 0.1, ease: "power2.out", scrollTrigger: { trigger: root.current, start: "top 70%" } });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="bg-ground px-pad py-[clamp(96px,16vh,180px)] text-ink">
      <h1 className="font-serif text-[clamp(40px,5.2vw,84px)] font-normal leading-[.98] tracking-[-.015em]">
        {hero.lines.map((line, i) => (
          <Line key={line}>{i === hero.lines.length - 1 ? <em>{line}</em> : line}</Line>
        ))}
      </h1>
      <p className="st-fade mt-6 max-w-[440px] text-base text-body">{hero.text}</p>
      <a className="st-fade pill pill-accent mt-8" href={cta.href}>
        {cta.label}
      </a>
    </section>
  );
}
