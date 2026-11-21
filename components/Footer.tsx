import Link from "next/link";
import { contact, footerLinks, privacy, site } from "@/content/site";
import ContactForm from "./ContactForm";
import Copy from "./Copy";
import Reveal from "./Reveal";
import { FooterMotion } from "./SectionMotion";

export default function Footer() {


  const link = "inline-flex min-h-[44px] items-center no-underline hover:text-ground";

  return (
    <footer id="contact" className="overflow-hidden bg-ink px-pad pt-[clamp(96px,14vh,150px)] text-ground">
      <div className="flex flex-wrap justify-between gap-x-20 gap-y-12">
        <div className="flex-[1_1_420px]">
          <hgroup>
            <Reveal as="h2" variant="fade" className="cap text-on-dark">
              {contact.eyebrow}
            </Reveal>
            <Reveal as="p" variant="lines" className="mb-6 mt-[18px] font-serif text-[clamp(52px,6.4vw,110px)] font-normal leading-[.94]">
              {contact.heading[0]} <br />
              <em>{contact.heading[1]}</em>
            </Reveal>
          </hgroup>
          <Reveal variant="fade" stagger>
            <p className="max-w-[420px] text-on-dark">
              <Copy text={contact.text} />
            </p>
            <p className="mt-5 max-w-[420px] text-sm text-on-dark">
              <span className="cap mr-2 text-ground">{contact.serviceArea.label}</span>
              {contact.serviceArea.text}
            </p>
          </Reveal>
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
      <FooterMotion />
    </footer>
  );
}
