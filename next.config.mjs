import { execFileSync } from "node:child_process";
import bundleAnalyzer from "@next/bundle-analyzer";
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

/**
 * Content-Security-Policy. Scripts and styles allow 'unsafe-inline' because the
 * pages are prerendered (no per-request nonce): Next's inline bootstrap, the
 * intro script in <head> and GSAP's style attributes need it. Everything else
 * is this origin only, plus the media bucket for the hero film.
 */
function contentSecurityPolicy() {
  const media = new URL(process.env.NEXT_PUBLIC_MEDIA_BASE).origin;
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: ${media}`,
    `media-src 'self' ${media}`,
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: { SITEMAP_LASTMOD: sitemapLastmod() },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy() },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        // Pages and text routes: the browser revalidates every time (ETag), so a
        // deploy shows at once. Hashed assets are immutable (public/_headers).
        source: "/((?!_next/static|images/|media/).*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=0, must-revalidate" }],
      },
    ];
  },
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

// ANALYZE=true npm run build writes .next/analyze/*.json (docs/PERF.md, ten largest modules).
const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === "true", openAnalyzer: false, analyzerMode: "json" });

export default withBundleAnalyzer(nextConfig);
