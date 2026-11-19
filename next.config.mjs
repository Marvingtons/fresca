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

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: { SITEMAP_LASTMOD: sitemapLastmod() },
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
