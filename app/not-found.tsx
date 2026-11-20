import type { Metadata } from "next";
import Link from "next/link";
import { notFound, site } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";

// No canonical or og:url (this page has no address of its own). Next adds the
// noindex robots tag to not-found pages itself.
export const metadata: Metadata = pageMetadata({ title: notFound.title, description: site.description });

export default function NotFound() {
  return (
    <>
      <header className="px-pad py-5">
        <Link href="/" className="inline-flex flex-col leading-none no-underline" aria-label={`${site.name}, home`}>
          <b className="font-serif text-[32px] font-normal italic">{site.shortName}</b>
          <span className="mt-[3px] text-[9px] uppercase tracking-[.36em]">Interior Design</span>
        </Link>
      </header>
      <main id="main" tabIndex={-1} className="flex min-h-[70svh] flex-col items-start justify-center px-pad outline-none">
        <p className="cap text-muted">404</p>
        <h1 className="mb-8 mt-4 font-serif text-[clamp(52px,7vw,110px)] font-normal leading-[.95]">{notFound.heading}</h1>
        <Link href="/" className="pill pill-dark">
          {notFound.home}
        </Link>
      </main>
    </>
  );
}
