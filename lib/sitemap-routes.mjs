// Every page in the sitemap, with the source files whose last git commit dates it.
// Read by next.config.mjs (which looks the dates up in git at build time and
// inlines them) and by app/sitemap.ts. Plain JS so the config can import it.
export const SITEMAP_ROUTES = [
  { path: "/", sources: ["app/page.tsx", "app/layout.tsx", "components", "content", "public/images", "public/media"] },
  { path: "/privacy", sources: ["app/privacy", "content/site.ts"] },
];
