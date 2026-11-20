import { about, cta, founder, quote } from "@/content/site";
import Line from "./LineReveal";
import { AboutMotion } from "./SectionMotion";

export default function AboutStack() {


  const words = quote.text.split(" ");

  return (
    <section id="about-us" className="px-pad py-[clamp(96px,14vh,160px)]">
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
          <b className="block font-normal">{founder.name}</b>
          <span className="text-sm text-muted">{founder.role}</span>
        </figcaption>
      </figure>

      <a className="pill pill-dark" href={cta.href}>
        {cta.label}
      </a>
      <AboutMotion />
    </section>
  );
}
