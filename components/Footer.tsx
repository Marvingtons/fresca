"use client";

import Link from "next/link";
import { useRef } from "react";
import { contact, footerLinks, privacy, site } from "@/content/site";
import { gsap, useGSAP } from "@/lib/gsap";
import { MOTION, revealLines } from "@/lib/motion";
import ContactForm from "./ContactForm";
import Copy from "./Copy";
import Line from "./LineReveal";

export default function Footer() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION, () => {
        revealLines(root.current!);
        // The giant wordmark rises into place.
        gsap.fromTo(
          ".f-word",
          { yPercent: 40 },
          { yPercent: 4, ease: "none", scrollTrigger: { trigger: root.current, start: "center bottom", end: "bottom bottom", scrub: true } },
        );
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const link = "inline-flex min-h-[44px] items-center no-underline hover:text-ground";

  return (
    <footer ref={root} id="contact" className="overflow-hidden bg-ink px-pad pt-[clamp(96px,14vh,150px)] text-ground">
      <div className="flex flex-wrap justify-between gap-x-20 gap-y-12">
        <div className="flex-[1_1_420px]">
          <hgroup>
            <h2 className="cap text-on-dark">{contact.eyebrow}</h2>
            <p className="mb-6 mt-[18px] font-serif text-[clamp(52px,6.4vw,110px)] font-normal leading-[.94]">
              <Line>{contact.heading[0]}</Line>{" "}
              <Line>
                <em>{contact.heading[1]}</em>
              </Line>
            </p>
          </hgroup>
          <p className="max-w-[420px] text-on-dark">
            <Copy text={contact.text} />
          </p>
          <p className="mt-5 max-w-[420px] text-sm text-on-dark">
            <span className="cap mr-2 text-ground">{contact.serviceArea.label}</span>
            {contact.serviceArea.text}
          </p>
        </div>
        <ContactForm />
      </div>

      <div className="mt-24 flex flex-wrap justify-between gap-6 border-t border-ground/[.16] py-6 text-sm text-on-dark">
        <nav aria-label="Footer" className="flex flex-wrap gap-x-7 gap-y-1">
          {footerLinks.map((l) => (
            <a key={l.href} href={l.href} className={link}>
              {l.label}
            </a>
          ))}
          <a href={site.instagram.href} className={link}>
            {site.instagram.handle}
          </a>
          <Link href={privacy.link.href} className={link}>
            {privacy.link.label}
          </Link>
        </nav>
        <span>
          <a href={site.phone.href} className={link}>
            {site.phone.label}
          </a>
          {" · "}
          <a href={`mailto:${site.email}`} className={link}>
            {site.email}
          </a>
        </span>
        {/* Year at render time; suppress the warning if the build year differs. */}
        <span suppressHydrationWarning>
          © {new Date().getFullYear()} {site.legalName} · <span className="whitespace-nowrap">{site.location}</span>
        </span>
      </div>

      <p aria-hidden="true" className="f-word mt-5 translate-y-[12%] text-center font-serif text-[27vw] italic leading-[.78] tracking-[-.02em]">
        {site.shortName}
      </p>
    </footer>
  );
}
