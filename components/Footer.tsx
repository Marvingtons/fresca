"use client";

import { useRef } from "react";
import { contact, footerLinks, site } from "@/content/site";
import { gsap, useGSAP } from "@/lib/gsap";
import { MOTION, revealLines } from "@/lib/motion";
import ContactForm from "./ContactForm";
import Line from "./LineReveal";
import Copy from "./Placeholder";

export default function Footer() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION, () => {
        revealLines(root.current!);
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const link = "py-2 no-underline hover:text-ground";

  return (
    <footer ref={root} id="contact" className="overflow-hidden bg-navy px-pad pt-[clamp(96px,14vh,150px)] text-ground">
      <div className="flex flex-wrap justify-between gap-x-20 gap-y-12">
        <div className="flex-[1_1_420px]">
          <p className="cap text-on-dark">{contact.eyebrow}</p>
          <h2 className="mb-6 mt-[18px] font-serif text-[clamp(52px,6.4vw,110px)] font-normal leading-[.94]">
            <Line>{contact.heading[0]}</Line>
            <Line>
              <em>{contact.heading[1]}</em>
            </Line>
          </h2>
          <p className="max-w-[420px] text-on-dark">{contact.text}</p>
          <p className="mt-3 max-w-[420px] text-on-dark">
            <Copy text={contact.responseTime} />
          </p>
        </div>
        <ContactForm />
      </div>

      <div className="mt-24 flex flex-wrap justify-between gap-6 border-t border-line-dark py-6 text-sm text-on-dark">
        <nav aria-label="Footer" className="flex flex-wrap gap-x-7 gap-y-1">
          {footerLinks.map((l) => (
            <a key={l.href} href={l.href} className={link}>
              {l.label}
            </a>
          ))}
          <span className="py-2">
            <Copy text={site.instagram.handle} />
          </span>
        </nav>
        <span>
          {/* Plain text until the real numbers arrive; restore tel: and mailto: links then. */}
          <Copy text={site.phone.label} />
          {" · "}
          <Copy text={site.email} />
        </span>
        <span>{site.copyright}</span>
      </div>

      {/* The lockup, bone on the dark footer. */}
      {/* eslint-disable-next-line @next/next/no-img-element -- static SVG logo */}
      <img src="/brand/fresca-lockup-bone.svg" alt="Fresca Interior Design" width={320} height={122} className="f-lockup mb-14 mt-16 block h-auto w-[min(320px,70vw)]" />
    </footer>
  );
}
