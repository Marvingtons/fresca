"use client";

import { useRef, type CSSProperties } from "react";
import { studio, type WallItem } from "@/content/site";
import { gsap, useGSAP } from "@/lib/gsap";
import { DESKTOP_MOTION, MOTION, revealLines } from "@/lib/motion";
import Line from "./LineReveal";
import Photo from "./Photo";

const at = (x: string, y: string, w?: string) => ({ "--x": x, "--y": y, "--w": w }) as CSSProperties;

// Every piece is absolutely placed on desktop; on mobile the wall becomes a
// staggered single column in source order.
const placed = "absolute left-[var(--x)] top-[var(--y)]";

function WallPiece({ item }: { item: WallItem }) {
  if (item.kind === "word") {
    return (
      <span
        aria-hidden="true"
        data-speed={item.speed}
        style={at(item.x, item.y)}
        className={`${placed} z-[1] whitespace-nowrap font-serif text-[clamp(64px,9.2vw,152px)] font-normal leading-[.9] tracking-[-.02em] max-md:text-[19vw] ${item.right ? "max-md:self-end" : ""}`}
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
              className="mt-[6px] inline-flex min-h-[44px] items-center text-[11px] uppercase tracking-[.2em] text-ink underline underline-offset-[6px] max-md:text-[12px]"
            >
              {item.link.label}
            </a>
          </>
        )}
      </p>
    );
  }

  const mobileWidth = item.right ? 50 : 64;
  const ratio = (r: string) => {
    const [w, h] = r.split("/").map(Number);
    return w / h;
  };
  return (
    // A plain figure until project pages exist: plates link nowhere.
    <figure
      data-speed={item.speed}
      style={at(item.x, item.y, item.w)}
      className={`pl ${placed} z-[2] w-[var(--w)] text-ink ${item.right ? "max-md:!w-1/2 max-md:self-end" : "max-md:!w-[64%]"}`}
    >
      <div className="pl-frame relative overflow-hidden bg-ground-2" style={{ aspectRatio: item.ratio }}>
        <div
          data-focus={item.focus}
          className={`pl-img absolute left-0 ${item.focus === "top" ? "top-0" : "top-[-10%]"} h-[120%] w-full`}
        >
          {/* The photo layer is 120% of the frame's height (parallax room). */}
          <Photo
            src={item.src}
            alt={item.alt}
            sizes={`(min-width: 861px) ${parseFloat(item.w)}vw, ${mobileWidth}vw`}
            box={ratio(item.ratio) / 1.2}
          />
        </div>
      </div>
      {/* Plate number, title, location, then a hairline. */}
      <figcaption
        className={`pl-label mt-2.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-[3px] border-b border-line pb-2.5 font-outfit md:w-[max(100%,180px)] ${
          item.right ? "md:ml-[min(0px,calc(100%-180px))]" : ""
        }`}
      >
        <span className="text-[11px] uppercase leading-[18px] tracking-[.16em] text-ink/55">{item.no}</span>
        <h3 className="text-[12px] font-normal uppercase leading-[18px] tracking-[.14em] text-ink">{item.title}</h3>
        {item.city && <span className="col-start-2 text-[11px] text-ink/55">{item.city}</span>}
        {item.caption && <span className="col-start-2 text-[11px] leading-[1.5] text-ink/55">{item.caption}</span>}
      </figcaption>
    </figure>
  );
}

export default function StudioWall() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // The caption fades as it slides under the fixed header (any motion setting:
      // it is tied to scroll position, not an animation that plays on its own).
      gsap.to(".wall-caption", {
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: ".wall-caption", start: "top 150px", end: "top 80px", scrub: true },
      });

      const mm = gsap.matchMedia();
      mm.add(MOTION, () => {
        revealLines(root.current!);

        // Plates unmask from the bottom, then their label arrives; the photo drifts inside its frame.
        gsap.utils.toArray<HTMLElement>(".pl").forEach((pl) => {
          const enter = { trigger: pl, start: "top 92%" };
          gsap.fromTo(
            pl.querySelector(".pl-frame"),
            { clipPath: "inset(100% 0% 0% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "power3.out", scrollTrigger: enter },
          );
          gsap.from(pl.querySelector(".pl-label"), { opacity: 0, y: 8, duration: 0.8, delay: 0.35, ease: "power2.out", scrollTrigger: enter });
          // A top-anchored photo drifts a shorter way and ends flush with the
          // frame's top edge, so the top of the photo is never more than ~4% hidden.
          const img = pl.querySelector<HTMLElement>(".pl-img")!;
          const top = img.dataset.focus === "top";
          gsap.fromTo(
            img,
            { yPercent: top ? -4 : -8 },
            { yPercent: top ? 0 : 8, ease: "none", scrollTrigger: { trigger: pl, start: "top bottom", end: "bottom top", scrub: 0.8 } },
          );

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
      {/* The big words are aria-hidden, so their line is read here. Keeps its margins
          (they space the mobile column). */}
      <p className="sr-only mx-0 my-5">{studio.srHeading}</p>
      <div className="wall-caption cap absolute inset-x-0 top-[3%] flex justify-between text-muted max-md:-order-1">
        <h2 className="whitespace-nowrap">{studio.caption[0]}</h2>
        <span className="text-right">
{studio.caption[1]}</span>
      </div>
      {studio.items.map((item, i) => (
        <WallPiece key={i} item={item} />
      ))}
    </section>
  );
}
