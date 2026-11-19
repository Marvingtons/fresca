import type { Metadata } from "next";
import Link from "next/link";
import { privacy, site } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({ title: privacy.title, description: privacy.description, path: privacy.link.href });

export default function PrivacyPage() {
  return (
    <>
      <header className="flex items-center justify-between px-pad py-5">
        <Link href="/" className="flex flex-col leading-none no-underline" aria-label={`${site.name}, home`}>
          <b className="font-serif text-[32px] font-normal italic">{site.shortName}</b>
          <span className="mt-[3px] text-[9px] uppercase tracking-[.36em]">Interior Design</span>
        </Link>
        <Link href="/" className="hbtn">
          {privacy.back}
        </Link>
      </header>
      <main id="main" tabIndex={-1} className="outline-none px-pad pb-24 pt-[clamp(48px,10vh,120px)]">
        <div className="mx-auto max-w-[680px]">
          <p className="cap text-muted">{privacy.eyebrow}</p>
          <h1 className="mb-12 mt-4 font-serif text-[clamp(44px,6vw,80px)] font-normal leading-[.98]">{privacy.heading}</h1>
          {privacy.sections.map((section) => (
            <section key={section.title} className="mb-10">
              <h2 className="mb-3 font-serif text-[clamp(26px,2.4vw,34px)] font-normal leading-[1.1]">{section.title}</h2>
              {section.body.map((para) => (
                <p key={para} className="mb-4 text-body">
                  {para}
                </p>
              ))}
            </section>
          ))}
          <p className="mt-12 border-t border-line pt-6 text-sm text-muted">
            {site.legalName} · {site.location} ·{" "}
            <a href={`mailto:${site.email}`} className="underline">
              {site.email}
            </a>
          </p>
        </div>
      </main>
    </>
  );
}
