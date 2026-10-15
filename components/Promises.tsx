"use client";

import Image from "next/image";
import { useRef } from "react";
import { cta, promises } from "@/content/site";
import { gsap, useGSAP } from "@/lib/gsap";
import { MOTION, revealLines } from "@/lib/motion";
import Line from "./LineReveal";

export default function Promises() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION, () => {
        revealLines(root.current!);
        // As each row rises: the veil lifts, the photo settles and the number darkens.
        gsap.utils.toArray<HTMLElement>(".promise-row").forEach((row) => {
          gsap
            .timeline({ scrollTrigger: { trigger: row, start: "top 85%", end: "top 35%", scrub: 0.8 } })
            .fromTo(row.querySelector(".veil"), { opacity: 1 }, { opacity: 0, ease: "power2.out" }, 0)
            .fromTo(row.querySelector(".promise-media img"), { scale: 1.18 }, { scale: 1, ease: "power2.out" }, 0)
            .fromTo(row.querySelector(".promise-n"), { color: "#b5afa3" }, { color: "#1D1C1A", ease: "none" }, 0);
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="process" className="px-pad py-[clamp(96px,14vh,160px)]">
      <div className="flex flex-wrap items-end justify-between gap-x-20 gap-y-8 border-b border-line pb-14">
        <div>
          <p className="cap mb-5 text-muted">{promises.eyebrow}</p>
          <h2 className="font-serif text-[clamp(44px,5.6vw,92px)] font-normal leading-[.96]">
            <Line>{promises.heading[0]}</Line>
            <Line>
              <em>{promises.heading[1]}</em>
            </Line>
          </h2>
        </div>
        <div className="flex max-w-[360px] flex-col items-start gap-6">
          <p className="text-body">{promises.intro}</p>
          <a className="pill pill-accent" href={cta.href}>
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
          <div className={`promise-media relative aspect-[16/10] overflow-hidden max-md:col-span-full ${row.board ? "bg-white" : "bg-ground"}`}>
            <Image
              src={row.image.src}
              alt={row.image.alt}
              fill
              quality={85}
              sizes="(min-width: 861px) 38vw, 100vw"
              className={row.board ? "object-contain p-2.5" : "object-cover"}
            />
            <div className="veil absolute inset-0 bg-ground opacity-0" />
          </div>
        </div>
      ))}
    </section>
  );
}
