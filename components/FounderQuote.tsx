"use client";

import { useRef } from "react";
import { founder, quote } from "@/content/site";
import { gsap, useGSAP } from "@/lib/gsap";
import { MOTION } from "@/lib/motion";

export default function FounderQuote() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION, () => {
        // Words light up one by one with scroll.
        gsap.fromTo(
          ".w",
          { opacity: 0.14 },
          { opacity: 1, stagger: 0.08, ease: "none", scrollTrigger: { trigger: root.current, start: "top 70%", end: "bottom 60%", scrub: true } },
        );
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const words = quote.text.split(" ");

  return (
    <section
      ref={root}
      aria-labelledby="founder-quote"
      className="flex flex-col items-center px-pad py-[clamp(96px,16vh,180px)] text-center"
    >
      <h2 id="founder-quote" className="sr-only">
        From the founder
      </h2>
      <div aria-hidden="true" className="mb-10 grid h-24 w-24 place-items-center rounded-full bg-accent font-serif text-[40px] italic text-ground">
        {founder.initials}
      </div>
      <blockquote className="max-w-[1100px] font-serif text-[clamp(36px,4.6vw,76px)] leading-[1.04]">
        {words.map((word, i) => (
          <span key={i}>
            <span className="w">{word}</span>
            {i < words.length - 1 && " "}
          </span>
        ))}
      </blockquote>
      <div className="mt-9">
        <b className="block font-semibold">{founder.name}</b>
        <span className="text-sm text-muted">{founder.role}</span>
      </div>
    </section>
  );
}
