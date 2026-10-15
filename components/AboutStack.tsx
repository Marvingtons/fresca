"use client";

import { useRef } from "react";
import { about } from "@/content/site";
import { gsap, useGSAP } from "@/lib/gsap";
import { MOTION, revealLines } from "@/lib/motion";
import Line from "./LineReveal";
import Copy from "./Placeholder";

export default function AboutStack() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION, () => {
        revealLines(root.current!);
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="about-us" className="flex flex-wrap gap-x-16 gap-y-12 px-pad py-[clamp(96px,14vh,160px)]">
      <div className="min-w-0 flex-[1_1_340px]">
        <div>
          <p className="cap mb-5 text-muted">{about.eyebrow}</p>
          <h2 className="mb-7 font-serif text-[clamp(48px,6vw,104px)] font-normal leading-[.95]">
            <Line>{about.heading[0]}</Line>
            <Line>
              <em>{about.heading[1]}</em>
            </Line>
          </h2>
          <p className="mb-4 max-w-[560px] text-body">{about.text}</p>
          <p className="mb-7 max-w-[560px] text-body">
            <Copy text={about.bio} />
          </p>
          <a className="pill pill-line" href={about.link.href}>
            {about.link.label}
          </a>
        </div>
      </div>
    </section>
  );
}
