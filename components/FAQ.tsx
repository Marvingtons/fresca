"use client";

import { useRef, type SyntheticEvent } from "react";
import { faq } from "@/content/site";
import Copy from "./Placeholder";

export default function FAQ() {
  const list = useRef<HTMLDivElement>(null);

  // One answer open at a time.
  const onToggle = (e: SyntheticEvent<HTMLDetailsElement>) => {
    const opened = e.currentTarget;
    if (!opened.open) return;
    list.current?.querySelectorAll("details").forEach((d) => {
      if (d !== opened) d.open = false;
    });
  };

  return (
    <section id="faq" className="flex flex-wrap gap-x-20 gap-y-10 border-t border-line px-pad py-[clamp(96px,14vh,150px)]">
      <div className="flex-[1_1_320px]">
        <p className="cap text-muted">{faq.eyebrow}</p>
        <h2 className="mt-4 font-serif text-[clamp(44px,5vw,80px)] font-normal leading-[.98]">{faq.heading}</h2>
      </div>
      <div ref={list} className="min-w-0 flex-[2_1_560px] border-t border-ink">
        {faq.items.map((item, i) => (
          <details key={item.q} open={i === 0} onToggle={onToggle} className="group border-b border-line">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 [&::-webkit-details-marker]:hidden">
              <span className="font-serif text-[clamp(22px,2vw,30px)] leading-[1.2]">{item.q}</span>
              <span
                aria-hidden="true"
                className="grid h-10 w-10 flex-none place-items-center rounded-full border border-line transition-[transform,background-color] duration-[400ms,300ms] group-open:rotate-45 group-open:bg-ink group-open:text-ground"
              >
                +
              </span>
            </summary>
            <div className="overflow-hidden">
              <p className="mb-[26px] max-w-[640px] text-body">
                <Copy text={item.a} />
              </p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
