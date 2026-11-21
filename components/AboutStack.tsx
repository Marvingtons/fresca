import type { CSSProperties } from "react";
import { about, cta, founder, quote } from "@/content/site";
import BodyCta from "./BodyCta";
import Copy from "./Copy";
import Photo from "./Photo";
import Reveal from "./Reveal";

/**
 * (05) About, on a 12-column grid from 1024px:
 *
 *   rows 1-4  text in columns 1 to 6 (label, heading, paragraph, facts strip);
 *             the 4:5 portrait in 7 to 12, its top on the heading. Row 5 is a
 *             spacer that takes up the portrait's extra height.
 *   row 6     the quote across 1 to 10.
 *   row 7     three square detail crops in 1 to 6.
 *   row 8     their caption (1 to 6) and the CTA (7 to 12, right-aligned) on one baseline.
 *
 * Below 1024px everything runs in source order, one column. Blocks are 64px
 * apart at 1440 and 40px at 390.
 */
const LEFT = "min-[1024px]:col-[1/7]";
const BLOCK = "mt-10 min-[1024px]:mt-16";
const small = "font-outfit text-[11px] uppercase leading-none tracking-[.16em]";

const isPlaceholder = (value: string) => value.startsWith("[PLACEHOLDER:");

/** A square crop of a plate photo, scaled about its focus point. */
function Detail({ src, alt, focus, zoom }: (typeof about.details)[number]) {
  return (
    <div className="relative aspect-square w-[clamp(100px,12.5vw,180px)] flex-none overflow-hidden">
      <Photo
        src={src}
        alt={alt}
        // The scaled width, so the file chosen is sharp after the zoom.
        sizes={`(min-width: 1440px) ${Math.round(180 * zoom)}px, (min-width: 800px) ${Math.round(12.5 * zoom)}vw, ${Math.round(100 * zoom)}px`}
        box={1}
        style={{ objectPosition: focus, transformOrigin: focus, transform: `scale(${zoom})` } as CSSProperties}
      />
    </div>
  );
}

export default function AboutStack() {
  const facts = about.facts.filter((fact) => !isPlaceholder(fact.value));

  return (
    <section id="about-us" className="px-6 py-[clamp(96px,14vh,150px)] md:px-12">
      <div className="grid grid-cols-1 min-[1024px]:grid-cols-12 min-[1024px]:grid-rows-[repeat(4,auto)_1fr_repeat(3,auto)] min-[1024px]:gap-x-6">
        <hgroup className="min-[1024px]:contents">
          <Reveal as="h2" variant="fade" className={`cap mb-5 text-muted ${LEFT} min-[1024px]:row-start-1`}>
            {about.eyebrow}
          </Reveal>
          <Reveal as="p" variant="lines" className={`mb-7 font-serif text-[clamp(48px,6vw,104px)] font-normal leading-[.95] ${LEFT} min-[1024px]:row-start-2`}>
            {about.heading[0]} <br />
            <em>{about.heading[1]}</em>
          </Reveal>
        </hgroup>

        <Reveal as="p" variant="fade" className={`max-w-[460px] text-body ${LEFT} min-[1024px]:row-start-3`}>
          {about.text}
        </Reveal>

        {/* Facts strip: label left, value right, on hairlines. */}
        <Reveal as="dl" variant="fade" stagger className={`${BLOCK} border-b border-line ${LEFT} min-[1024px]:row-start-4`}>
          {facts.map((fact) => (
            <div key={fact.label} className="flex items-baseline justify-between gap-6 border-t border-line py-[14px]">
              <dt className={`${small} flex-none opacity-50`}>{fact.label}</dt>
              <dd className="text-right font-outfit text-[14px] leading-[1.4]">{fact.value}</dd>
            </div>
          ))}
        </Reveal>

        <figure className={`${BLOCK} min-[1024px]:col-[7/13] min-[1024px]:row-[2/6] min-[1024px]:mt-0`}>
          <div className="relative aspect-[4/5] overflow-hidden">
            <Photo src={about.portrait.src} alt={about.portrait.alt} sizes="(min-width: 1024px) 48vw, 100vw" box={4 / 5} className="object-top" />
          </div>
          <figcaption className="mt-3">
            <span className={`${small} block`}>{about.portraitCaption}</span>
            <span className="mt-2 block text-sm">
              <Copy text={about.portrait.placeholder} />
            </span>
          </figcaption>
        </figure>

        <figure className={`${BLOCK} min-[1024px]:col-[1/11] min-[1024px]:row-start-6`}>
          <Reveal as="blockquote" variant="lines" className="about-quote font-cormorant text-[clamp(32px,3.6vw,56px)] font-medium leading-[1.1]">
            {quote.text}
          </Reveal>
          <Reveal as="figcaption" variant="fade" className="mt-7 font-outfit text-[12px] uppercase tracking-[.16em]">
            {founder.name}
          </Reveal>
        </figure>

        <Reveal variant="fade" stagger className={`${BLOCK} flex gap-3 min-[1024px]:gap-4 ${LEFT} min-[1024px]:row-start-7`}>
          {about.details.map((detail) => (
            <Detail key={detail.src} {...detail} />
          ))}
        </Reveal>

        {/* Caption and CTA share a baseline; on narrow screens the CTA wraps under, still right-aligned. */}
        <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-6 min-[1024px]:col-[1/13] min-[1024px]:row-start-8">
          <Reveal as="p" variant="fade" className={`${small} opacity-50`}>
            {about.detailsCaption}
          </Reveal>
          <Reveal variant="fade" index={1} className="ml-auto">
            <BodyCta href={cta.href}>{cta.label}</BodyCta>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
