import { about, cta, founder, quote } from "@/content/site";
import BodyCta from "./BodyCta";
import Copy from "./Copy";
import Photo from "./Photo";
import Reveal from "./Reveal";

// Grid placement from 1024px: text in columns 1 to 5, portrait in 7 to 12 with
// its top on the heading, the quote under both across 1 to 10. Row 6 is a
// spacer that takes up the portrait's extra height, so the text rows stay
// together. Below 1024px everything runs in source order, one column.
const LEFT = "min-[1024px]:col-[1/6]";

export default function AboutStack() {
  return (
    <section id="about-us" className="px-6 py-[clamp(96px,14vh,160px)] md:px-12">
      <div className="grid grid-cols-1 min-[1024px]:grid-cols-12 min-[1024px]:grid-rows-[repeat(5,auto)_1fr_auto] min-[1024px]:gap-x-6">
        <hgroup className="min-[1024px]:contents">
          <Reveal as="h2" variant="fade" className={`cap mb-5 text-muted ${LEFT} min-[1024px]:row-start-1`}>
            {about.eyebrow}
          </Reveal>
          <Reveal as="p" variant="lines" className={`mb-7 font-serif text-[clamp(48px,6vw,104px)] font-normal leading-[.95] ${LEFT} min-[1024px]:row-start-2`}>
            {about.heading[0]} <br />
            <em>{about.heading[1]}</em>
          </Reveal>
        </hgroup>

        <Reveal as="p" variant="fade" className={`max-w-[420px] text-body ${LEFT} min-[1024px]:row-start-3`}>
          {about.text}
        </Reveal>
        <Reveal as="p" variant="fade" index={1} className={`mt-8 ${LEFT} min-[1024px]:row-start-4`}>
          <b className="block font-semibold">{founder.name}</b>
          <span className="text-sm text-muted">{founder.role}</span>
        </Reveal>

        <figure className="mt-12 min-[1024px]:col-[7/13] min-[1024px]:row-[2/7] min-[1024px]:mt-0">
          <div className="relative aspect-[4/5] overflow-hidden">
            <Photo
              src={about.portrait.src}
              alt={about.portrait.alt}
              sizes="(min-width: 1024px) 48vw, 100vw"
              box={4 / 5}
              className="object-top"
            />
          </div>
          <figcaption className="mt-3">
            <Copy text={about.portrait.placeholder} />
          </figcaption>
        </figure>

        <figure className="mt-16 min-[1024px]:col-[1/11] min-[1024px]:row-start-7 min-[1024px]:mt-[clamp(96px,12vh,150px)]">
          <Reveal as="blockquote" variant="lines" className="about-quote font-cormorant text-[clamp(32px,3.6vw,56px)] font-medium leading-[1.1]">
            {quote.text}
          </Reveal>
          <Reveal as="figcaption" variant="fade" className="mt-7 font-outfit text-[12px] uppercase tracking-[.16em]">
            {founder.name}
          </Reveal>
        </figure>

        <Reveal variant="fade" index={2} className={`mt-10 ${LEFT} min-[1024px]:row-start-5 min-[1024px]:mt-8`}>
          <BodyCta href={cta.href}>{cta.label}</BodyCta>
        </Reveal>
      </div>
    </section>
  );
}
