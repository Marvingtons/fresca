import { execFileSync } from "node:child_process";
import { validateEnv } from "./env.mjs";
import { SITEMAP_ROUTES } from "./lib/sitemap-routes.mjs";

validateEnv();

/**
 * Each sitemap page's last git commit date, looked up here (at build, where git
 * exists) and inlined as SITEMAP_LASTMOD, because the Worker that serves
 * /sitemap.xml has no git. Missing outside a git checkout: lastmod is left out.
 */
function sitemapLastmod() {
  const dates = {};
  for (const { path, sources } of SITEMAP_ROUTES) {
    try {
      const iso = execFileSync("git", ["log", "-1", "--format=%cI", "--", ...sources], { encoding: "utf8" }).trim();
      if (iso) dates[path] = iso;
    } catch {}
  }
  return JSON.stringify(dates);
}

/**
 * www to the apex, 301, path and query kept. Built from NEXT_PUBLIC_SITE_URL, so
 * it only exists when that is an apex https URL. The Cloudflare Redirect Rule
 * (docs/DEPLOY.md 3.3) does this at the edge first; this covers pages if the
 * rule is missing.
 */
function wwwToApex() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL;
  if (!raw) return [];
  const { protocol, hostname } = new URL(raw);
  if (protocol !== "https:" || hostname.startsWith("www.") || hostname === "localhost") return [];
  return [
    {
      source: "/:path*",
      has: [{ type: "host", value: `www.${hostname}` }],
      destination: `https://${hostname}/:path*`,
      // 301 to match the Cloudflare rule and the DEPLOY.md test (permanent: true gives 308).
      statusCode: 301,
    },
  ];
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: { SITEMAP_LASTMOD: sitemapLastmod() },
  async redirects() {
    return wwwToApex();
  },
  images: {
    // Every <Image> asks for quality 85. The image optimizer (Cloudflare Images via
    // OpenNext) rejects any quality not listed here; 75 is Next's default.
    qualities: [75, 85],
    // Next's defaults plus 1440, so a full-bleed photo on a 1440px screen gets a
    // 1440px file instead of jumping to 1920.
    deviceSizes: [640, 750, 828, 1080, 1200, 1440, 1920, 2048, 3840],
  },
};

export default nextConfig;
