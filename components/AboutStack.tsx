"use client";

import { useRef } from "react";
import { about, cta, founder, quote } from "@/content/site";
import { gsap, useGSAP } from "@/lib/gsap";
import { MOTION, revealLines } from "@/lib/motion";
import Line from "./LineReveal";

export default function AboutStack() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION, () => {
        revealLines(root.current!);
        // The quote's words light up one by one as it scrolls through the screen.
        gsap.fromTo(
          ".w",
          { opacity: 0.14 },
          { opacity: 1, stagger: 0.08, ease: "none", scrollTrigger: { trigger: ".about-quote", start: "top 80%", end: "bottom 55%", scrub: true } },
        );
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const words = quote.text.split(" ");

  return (
    <section ref={root} id="about-us" className="px-pad py-[clamp(96px,14vh,160px)]">
      <hgroup>
        <h2 className="cap mb-5 text-muted">{about.eyebrow}</h2>
        <p className="mb-7 font-serif text-[clamp(48px,6vw,104px)] font-normal leading-[.95]">
          <Line>{about.heading[0]}</Line>{" "}
          <Line>
            <em>{about.heading[1]}</em>
          </Line>
        </p>
      </hgroup>
      <p className="mb-12 max-w-[420px] text-body">{about.text}</p>

      <figure className="about-quote mb-12 max-w-[1000px]">
        <blockquote className="text-balance font-serif text-[clamp(32px,4vw,64px)] leading-[1.06]">
          {words.map((word, i) => (
            <span key={i}>
              <span className="w">{word}</span>
              {i < words.length - 1 && " "}
            </span>
          ))}
        </blockquote>
        <figcaption className="mt-7">
          <b className="block font-semibold">{founder.name}</b>
          <span className="text-sm text-muted">{founder.role}</span>
        </figcaption>
      </figure>

      <a className="pill pill-dark" href={cta.href}>
        {cta.label}
      </a>
    </section>
  );
}
