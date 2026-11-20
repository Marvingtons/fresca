"use client";

import Image from "next/image";
import { useRef } from "react";
import { cta, promises } from "@/content/site";
import { gsap, useGSAP } from "@/lib/gsap";
import { MOTION, revealLines } from "@/lib/motion";
import Line from "./LineReveal";
import PlanIllustration from "./PlanIllustration";

export default function Promises() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION, () => {
        revealLines(root.current!);
        // As each row rises the number darkens. Photos are never faded or veiled: an
        // earlier scrubbed veil left them part-washed whenever a row stopped short
        // of the trigger's end.
        gsap.utils.toArray<HTMLElement>(".promise-row").forEach((row) => {
          gsap.fromTo(
            row.querySelector(".promise-n"),
            { color: "#b5afa3" },
            { color: "#1D1C1A", ease: "none", scrollTrigger: { trigger: row, start: "top 85%", end: "top 35%", scrub: 0.8 } },
          );
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="process" className="px-pad py-[clamp(96px,14vh,160px)]">
      <div className="flex flex-wrap items-end justify-between gap-x-20 gap-y-8 border-b border-line pb-14">
        <div className="min-w-0 flex-[1_1_560px]">
          {/* The eyebrow names the section, so it is the H2; the display line is its subheading. */}
          <hgroup>
            <h2 className="cap mb-5 text-muted">{promises.eyebrow}</h2>
            {/* Karen's heading is a full sentence, so it runs smaller than the old two-word lines. */}
            <p className="max-w-[17em] text-balance font-serif text-[clamp(34px,3.6vw,60px)] font-normal leading-[1.04]">
              <Line>{promises.heading[0]}</Line>{" "}
              <Line>
                <em>{promises.heading[1]}</em>
              </Line>
            </p>
          </hgroup>
        </div>
        <div className="flex max-w-[360px] flex-col items-start gap-6">
          <p className="text-body">{promises.intro}</p>
          <a className="pill pill-dark" href={cta.href}>
            {cta.label}
          </a>
        </div>
      </div>

      {promises.rows.map((row, i) => (
        <div
          key={row.title}
          className="promise-row grid grid-cols-[minmax(60px,.4fr)_minmax(0,1.3fr)_minmax(0,1.1fr)] items-start gap-x-10 gap-y-6 border-b border-line py-9 max-md:grid-cols-[44px_minmax(0,1fr)]"
        >
          <span className="promise-n font-serif text-[30px] italic leading-none text-muted">{String(i + 1).padStart(2, "0")}</span>
          <div>
            <h3 className="mb-3 font-serif text-[clamp(30px,2.8vw,44px)] font-normal leading-[1.05]">{row.title}</h3>
            <p className="max-w-[440px] text-body">{row.text}</p>
          </div>
          <div className="promise-media relative aspect-[16/10] overflow-hidden max-md:col-span-full">
            {"plan" in row ? (
              <PlanIllustration />
            ) : (
              <Image
                src={row.image.src}
                alt={row.image.alt}
                fill
                quality={85}
                sizes="(min-width: 861px) 38vw, 100vw"
                style={row.image.focus ? { objectPosition: row.image.focus } : undefined}
                className="object-cover"
              />
            )}
          </div>
        </div>
      ))}
    </section>
  );
}
