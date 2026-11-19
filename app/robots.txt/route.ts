import { siteUrl } from "@/lib/site-url";

// A route rather than app/robots.ts so the file can carry comments.
export const dynamic = "force-static";

/** Named crawlers, each allowed on purpose. Order: OpenAI, Anthropic, Perplexity, Google, Apple, Common Crawl, ByteDance. */
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-User",
  "PerplexityBot",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "Bytespider",
];

export function GET() {
  // A crawler with its own group ignores the * group, so each repeats the /api/ rule.
  const group = (agent: string) => `User-agent: ${agent}\nAllow: /\nDisallow: /api/\n`;
  const body = [
    "# Fresca Interior Design",
    "",
    group("*"),
    "# AI crawlers, allowed explicitly so the choice is on record. To opt one out",
    "# (Karen's call), change its \"Allow: /\" to \"Disallow: /\".",
    "",
    AI_CRAWLERS.map(group).join("\n"),
    "# Plain-text guides for language models:",
    `# ${siteUrl}/llms.txt`,
    `# ${siteUrl}/llms-full.txt`,
    "",
    `Sitemap: ${siteUrl}/sitemap.xml`,
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
