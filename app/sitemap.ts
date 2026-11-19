import type { MetadataRoute } from "next";
import { SITEMAP_ROUTES } from "@/lib/sitemap-routes.mjs";
import { siteUrl } from "@/lib/site-url";

export const dynamic = "force-static";

/** Last git commit date per page, inlined at build by next.config.mjs. */
const lastmod: Record<string, string> = JSON.parse(process.env.SITEMAP_LASTMOD || "{}");

export default function sitemap(): MetadataRoute.Sitemap {
  return SITEMAP_ROUTES.map(({ path }) => ({
    url: path === "/" ? `${siteUrl}/` : `${siteUrl}${path}`,
    lastModified: lastmod[path] ? new Date(lastmod[path]) : undefined,
  }));
}
