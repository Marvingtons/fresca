import type { Metadata } from "next";
import { site } from "@/content/site";

/**
 * Open Graph and Twitter values every page shares. Next replaces a whole
 * `openGraph` or `twitter` object when a page sets its own, so pages spread
 * these instead of relying on the layout's.
 */
const image = { ...site.ogImage, type: "image/jpeg" };

export const sharing = {
  openGraph: { type: "website", siteName: site.name, locale: "en_US", images: [image] },
  twitter: { card: "summary_large_image", images: [{ url: image.url, alt: image.alt }] },
} satisfies Pick<Metadata, "openGraph" | "twitter">;

/** Title, description, canonical and sharing tags for one page. `path` is left out for pages with no canonical URL (the 404). */
export function pageMetadata({ title, description, path }: { title: string; description: string; path?: string }): Metadata {
  return {
    title,
    description,
    ...(path ? { alternates: { canonical: path } } : {}),
    openGraph: { ...sharing.openGraph, title, description, ...(path ? { url: path } : {}) },
    twitter: { ...sharing.twitter, title, description },
  };
}
