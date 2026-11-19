"use client";

import { useRef } from "react";
import { about } from "@/content/site";
import { gsap, useGSAP } from "@/lib/gsap";
import { MOTION, revealLines } from "@/lib/motion";
import Line from "./LineReveal";

export default function AboutStack() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION, () => revealLines(root.current!));
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="about-us" className="px-pad pb-10 pt-[clamp(96px,14vh,160px)]">
      <p className="cap mb-5 text-muted">{about.eyebrow}</p>
      <h2 className="mb-7 font-serif text-[clamp(48px,6vw,104px)] font-normal leading-[.95]">
        <Line>{about.heading[0]}</Line>
        <Line>
          <em>{about.heading[1]}</em>
        </Line>
      </h2>
      <p className="mb-7 max-w-[420px] text-body">{about.text}</p>
      <a className="pill pill-line" href={about.link.href}>
        {about.link.label}
      </a>
    </section>
  );
}
