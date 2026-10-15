"use client";

import Image from "next/image";
import { useRef, type CSSProperties } from "react";
import { studio, type WallItem } from "@/content/site";
import { gsap, useGSAP } from "@/lib/gsap";
import { DESKTOP_MOTION, MOTION, revealLines } from "@/lib/motion";
import Line from "./LineReveal";

const at = (x: string, y: string, w?: string) => ({ "--x": x, "--y": y, "--w": w }) as CSSProperties;

// Every piece is absolutely placed on desktop; on mobile the wall becomes a
// staggered single column in source order.
const placed = "absolute left-[var(--x)] top-[var(--y)]";

/** Grid coordinate of a plate's top-left corner, e.g. C06·R01 (12 columns, rows every 5%). */
const coord = (x: string, y: string) =>
  `C${String(Math.round(parseFloat(x) / (100 / 12)) + 1).padStart(2, "0")}·R${String(Math.round(parseFloat(y) / 5)).padStart(2, "0")}`;

function WallPiece({ item }: { item: WallItem }) {
  // Words sit above the plates (z-3) so a drifting word never passes behind a
  // photo; they let clicks through to the plate underneath.
  if (item.kind === "word") {
    return (
      <span
        aria-hidden="true"
        data-speed={item.speed}
        style={at(item.x, item.y)}
        className={`${placed} pointer-events-none z-[3] whitespace-nowrap font-serif text-[clamp(64px,9.2vw,152px)] font-normal leading-[.9] tracking-[-.02em] max-md:text-[19vw] ${item.right ? "max-md:self-end" : ""}`}
      >
        <Line>{item.italic ? <em>{item.text}</em> : item.text}</Line>
      </span>
    );
  }

  if (item.kind === "text") {
    return (
      <p
        data-speed={item.speed}
        style={{ ...at(item.x, item.y), "--mw": item.maxWidth } as CSSProperties}
        className={`art-p ${placed} z-[2] m-0 max-w-[330px] text-[15px] text-body md:max-w-[var(--mw)]`}
      >
        {item.text}
        {item.link && (
          <>
            <br />
            <a
              href={item.link.href}
              className="mt-[18px] inline-flex text-[11px] uppercase tracking-[.2em] text-terracotta underline underline-offset-[6px] hover:text-[#8f4227]"
            >
              {item.link.label}
            </a>
          </>
        )}
      </p>
    );
  }

  const mobileWidth = item.right ? 50 : 64;
  return (
    <a
      href="#work"
      data-speed={item.speed}
      style={at(item.x, item.y, item.w)}
      className={`pl group ${placed} z-[2] w-[var(--w)] text-ink no-underline ${
        item.right ? "max-md:!w-1/2 max-md:self-end" : "max-md:!w-[64%]"
      } ${item.dim?.dir === "h" ? "max-md:mt-4" : ""} ${item.dim?.dir === "v" && item.dim.side === "l" && !item.right ? "max-md:ml-4" : ""}`}
    >
      {/* .fr has no overflow clip, so dimension lines and callouts can sit outside the photo. */}
      <div className="fr">
        <div className="pl-frame relative overflow-hidden bg-ink/[.06]" style={{ aspectRatio: item.ratio }}>
          <div className="pl-img absolute left-0 top-[-10%] h-[120%] w-full">
            <Image
              src={item.src}
              alt={item.title}
              fill
              quality={85}
              sizes={`(min-width: 861px) ${parseFloat(item.w)}vw, ${mobileWidth}vw`}
              className="object-cover transition-[filter] duration-500 group-hover:brightness-[.85]"
            />
          </div>
        </div>
        {item.dim && (
          <span className={`dim ${item.dim.dir} ${item.dim.side ?? ""}`} aria-hidden="true">
            <i className="dl" />
            <em>{item.dim.label}</em>
          </span>
        )}
        {item.callout && (
          <span
            className={`co ${item.callout.side}`}
            style={
              {
                "--px": item.callout.px,
                "--py": item.callout.py,
                "--len": item.callout.len,
                "--len-max": item.callout.maxLen,
                // Share of the wall to the right of the dot, so a right-hand label can stay on screen.
                "--room": 1 - (parseFloat(item.x) + (parseFloat(item.callout.px) / 100) * parseFloat(item.w)) / 100,
              } as CSSProperties
            }
            aria-hidden="true"
          >
            <span className="ll" />
            <i />
            <span className="t">{item.callout.text}</span>
          </span>
        )}
      </div>
      <span className="pl-label plate mt-2.5 grid grid-cols-[auto_1fr_auto] gap-x-3 gap-y-[3px] text-muted">
        <span>{item.no}</span>
        <b className="font-medium text-ink">{item.title}</b>
        <span className="xy col-start-3 row-start-1 font-mono text-[9px] tracking-[.04em] text-ink/45">{coord(item.x, item.y)}</span>
        <span className="col-start-2">{item.room}</span>
      </span>
    </a>
  );
}

export default function StudioWall() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION, () => {
        revealLines(root.current!);

        // Grid lines reveal top to bottom; column numbers and ruler labels fade in.
        gsap.fromTo(
          ".art-grid",
          { clipPath: "inset(0 0 100% 0)" },
          { clipPath: "inset(0 0 0% 0)", ease: "none", scrollTrigger: { trigger: root.current, start: "top 85%", end: "45% center", scrub: true } },
        );
        gsap.from(".art-cols span", { opacity: 0, y: -6, duration: 0.6, stagger: 0.04, ease: "power2.out", scrollTrigger: { trigger: root.current, start: "top 80%" } });
        gsap.from(".art-ruler span", { opacity: 0, duration: 0.5, stagger: 0.03, scrollTrigger: { trigger: root.current, start: "top 80%" } });

        // Plates unmask from the bottom, then their label arrives; the photo drifts inside its frame.
        gsap.utils.toArray<HTMLElement>(".pl").forEach((pl) => {
          const enter = { trigger: pl, start: "top 92%" };
          gsap.fromTo(
            pl.querySelector(".pl-frame"),
            { clipPath: "inset(100% 0% 0% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "power3.out", scrollTrigger: enter },
          );
          gsap.from(pl.querySelector(".pl-label"), { opacity: 0, y: 8, duration: 0.8, delay: 0.35, ease: "power2.out", scrollTrigger: enter });
          gsap.fromTo(
            pl.querySelector(".pl-img"),
            { yPercent: -8 },
            { yPercent: 8, ease: "none", scrollTrigger: { trigger: pl, start: "top bottom", end: "bottom top", scrub: 0.8 } },
          );

          // Dimension line draws in after the photo unmasks, then its label appears.
          const annotate = { trigger: pl, start: "top 88%" };
          const dim = pl.querySelector<HTMLElement>(".dim");
          if (dim) {
            const vertical = dim.classList.contains("v");
            gsap.from(dim.querySelector(".dl"), { ...(vertical ? { scaleY: 0 } : { scaleX: 0 }), duration: 1.1, delay: 0.5, ease: "power3.inOut", scrollTrigger: annotate });
            gsap.from(dim, { opacity: 0, duration: 0.4, delay: 0.45, scrollTrigger: annotate });
            gsap.from(dim.querySelector("em"), { opacity: 0, duration: 0.5, delay: 1.1, scrollTrigger: annotate });
          }
          // Callout: the dot pops in, the leader line draws, then the label slides in.
          const co = pl.querySelector<HTMLElement>(".co");
          if (co) {
            gsap.from(co.querySelector("i"), { scale: 0, duration: 0.5, delay: 0.8, ease: "back.out(2)", scrollTrigger: annotate });
            gsap.from(co.querySelector(".ll"), { scaleX: 0, duration: 0.9, delay: 1, ease: "power3.inOut", scrollTrigger: annotate });
            gsap.from(co.querySelector(".t"), { opacity: 0, x: co.classList.contains("l") ? 8 : -8, duration: 0.6, delay: 1.6, ease: "power2.out", scrollTrigger: annotate });
          }
        });

        gsap.utils.toArray<HTMLElement>(".art-p").forEach((el) => {
          gsap.from(el, { opacity: 0, y: 20, duration: 1, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 88%" } });
        });
      });

      // Desktop: every word, plate and paragraph drifts up at its own speed.
      mm.add(DESKTOP_MOTION, () => {
        gsap.utils.toArray<HTMLElement>("[data-speed]").forEach((el) => {
          const speed = parseFloat(el.dataset.speed ?? "1");
          gsap.to(el, {
            y: () => -window.innerHeight * studio.drift * speed,
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 0.8, invalidateOnRefresh: true },
          });
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="about"
      aria-label="The studio"
      style={{ "--wall-h": studio.height } as CSSProperties}
      className="relative mx-pad h-[var(--wall-h)] max-md:flex max-md:h-auto max-md:flex-col max-md:gap-7 max-md:pb-[72px] max-md:pt-24 max-md:[&>*]:!relative max-md:[&>*]:!left-auto max-md:[&>*]:!top-auto"
    >
      {/* Drafting layer: 12 column lines, column numbers, and a ruler in the left margin. */}
      <div className="art-grid" aria-hidden="true" />
      <div className="art-cols" aria-hidden="true">
        {Array.from({ length: studio.columns }, (_, i) => (
          <span key={i}>{String(i + 1).padStart(2, "0")}</span>
        ))}
      </div>
      <div className="art-ruler" aria-hidden="true">
        {Array.from({ length: studio.rulerMarks }, (_, i) => (
          <span key={i} style={{ top: `${i * 5}%` }}>
            {String(i).padStart(2, "0")}
          </span>
        ))}
      </div>
      {/* The spec's hidden h2 keeps its default margins (they space the mobile column). */}
      <h2 className="sr-only mx-0 my-5">{studio.srHeading}</h2>
      <div className="cap absolute inset-x-0 top-[3%] flex justify-between text-muted max-md:-order-1">
        <span className="whitespace-nowrap">{studio.caption[0]}</span>
        <span className="text-right">
          {studio.caption[1]}
          <span className="max-md:hidden"> · {studio.caption[2]}</span>
        </span>
      </div>
      {studio.marks.map((m) => (
        <span
          key={m.x + m.y}
          aria-hidden="true"
          style={at(m.x, m.y)}
          className={`${placed} h-[15px] w-[15px] before:absolute before:left-[7px] before:top-0 before:h-[15px] before:w-px before:bg-ink/30 before:content-[''] after:absolute after:left-0 after:top-[7px] after:h-px after:w-[15px] after:bg-ink/30 after:content-[''] max-md:hidden`}
        />
      ))}
      {studio.items.map((item, i) => (
        <WallPiece key={i} item={item} />
      ))}
    </section>
  );
}
