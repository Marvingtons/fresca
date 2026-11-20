/**
 * Absolute base URL for canonical, Open Graph, sitemap, robots and JSON-LD.
 * NEXT_PUBLIC_SITE_URL is the only source: it is inlined at build time, and a
 * production build fails without it (env.mjs). Local dev falls back to
 * localhost so `next dev` works without it.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || (process.env.NODE_ENV === "production" ? "" : "http://localhost:3000")
).replace(/\/+$/, "");
