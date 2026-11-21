import { faq } from "@/content/site";
import Reveal from "./Reveal";

// One answer open at a time: <details name> makes the group exclusive in the
// browser itself, so this section needs no JavaScript. (Browsers without it
// simply allow several open.)
export default function FAQ() {
  return (
    <section id="faq" className="flex flex-wrap gap-x-20 gap-y-10 bg-ground-2 px-pad py-[clamp(96px,14vh,150px)]">
      <div className="flex-[1_1_320px]">
        <hgroup>
          <Reveal as="h2" variant="fade" className="cap text-muted-2">
            {faq.eyebrow}
          </Reveal>
          <Reveal as="p" variant="lines" className="mt-4 font-serif text-[clamp(44px,5vw,80px)] font-normal leading-[.98]">
            {faq.heading}
          </Reveal>
        </hgroup>
      </div>
      <div className="min-w-0 flex-[2_1_560px] border-t border-ink">
        {faq.items.map((item, i) => (
          <Reveal key={item.q} variant="fade" index={i}>
            <details open={i === 0} name="faq" className="group border-b border-line">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 [&::-webkit-details-marker]:hidden">
                <h3 className="font-serif text-[clamp(22px,2vw,30px)] font-normal leading-[1.2]">{item.q}</h3>
                <span
                  aria-hidden="true"
                  className="grid h-10 w-10 flex-none place-items-center rounded-full border border-line transition-[transform,background-color] duration-[400ms,300ms] group-open:rotate-45 group-open:bg-ink group-open:text-ground"
                >
                  +
                </span>
              </summary>
              <div className="overflow-hidden">
                <p className="mb-[26px] max-w-[640px] text-body">{item.a}</p>
              </div>
            </details>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
