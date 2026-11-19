/**
 * llms.txt and llms-full.txt (https://llmstxt.org), built from content/site.ts at
 * build time by app/llms.txt and app/llms-full.txt, so they always match the page.
 * Nothing here is new copy: every line is a value from content/site.ts.
 */
import {
  about,
  approach,
  contact,
  faq,
  founder,
  hero,
  privacy,
  promises,
  quote,
  services,
  showcase,
  site,
  studio,
} from "@/content/site";
import { siteUrl } from "@/lib/site-url";

const home = `${siteUrl}/`;
const at = (anchor: string) => `${home}${anchor}`;
/** "(03) Working with us" → "Working with us" */
const label = (eyebrow: string) => eyebrow.replace(/^\(\d+\)\s*/, "");
const place = (title: string, city?: string) => (city ? `${title}, ${city}` : title);

const plates = studio.items.flatMap((item) => (item.kind === "plate" ? [item] : []));
const wallText = studio.items.flatMap((item) => (item.kind === "text" ? [item.text] : []));

export function llmsTxt() {
  return [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    `${site.legalName}, ${site.location}.`,
    "",
    "## About",
    "",
    `- [About](${at("#about-us")}): ${about.text}`,
    `- Founder: ${founder.name}, ${founder.role}`,
    "",
    "## Services",
    "",
    ...services.map((s) => `- ${s}`),
    `- [How projects are priced and what they include](${at("#faq")})`,
    "",
    "## Service area",
    "",
    `- ${contact.serviceArea.text}`,
    "",
    "## Projects",
    "",
    ...showcase.projects.map((p) => `- [${place(p.title, p.city)}](${at("#work")})`),
    ...plates.map((p) => `- [${place(p.title, p.city)}](${at("#about")})`),
    "",
    "## Contact",
    "",
    `- Phone: ${site.phone.label}`,
    `- Email: ${site.email}`,
    `- [Instagram](${site.instagram.href}): ${site.instagram.handle}`,
    `- [Inquiry form](${at("#contact")})`,
    `- [Privacy](${siteUrl}${privacy.link.href})`,
    "",
    "## Optional",
    "",
    `- [Full site copy](${siteUrl}/llms-full.txt): every section of the site as Markdown`,
    "",
  ].join("\n");
}

export function llmsFullTxt() {
  const section = (title: string, ...lines: (string | false | undefined)[]) =>
    [`## ${title}`, "", ...lines.filter((l): l is string => typeof l === "string"), ""].join("\n");

  return [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    `The visible copy of ${home}, generated from the site's content when the site is built.`,
    "",
    section(hero.eyebrow.join(" · "), `### ${hero.lines.join(" ")}`, "", hero.text),
    section(
      label(studio.caption[0]),
      studio.srHeading,
      "",
      ...wallText.flatMap((t) => [t, ""]),
      ...plates.map((p) => `- ${p.no} ${place(p.title, p.city)}${p.caption ? `. ${p.caption}` : ""}`),
    ),
    section(label(showcase.eyebrow), ...showcase.projects.map((p) => `- ${place(p.title, p.city)}`)),
    section(
      label(promises.eyebrow),
      `### ${promises.heading.join(" ")}`,
      "",
      promises.intro,
      "",
      ...promises.rows.flatMap((r) => [`### ${r.title}`, "", r.text, ""]),
    ),
    section(
      label(approach.eyebrow),
      `### ${approach.heading.join(" ")}`,
      "",
      ...approach.panels.flatMap((p) => [`### ${p.title}`, "", p.text, ""]),
    ),
    section(label(about.eyebrow), `### ${about.heading.join(" ")}`, "", about.text, "", `> ${quote.text}`, ">", `> ${founder.name}, ${founder.role}`),
    section(label(faq.eyebrow), `### ${faq.heading}`, "", ...faq.items.flatMap((item) => [`#### ${item.q}`, "", item.a, ""])),
    section(
      label(contact.eyebrow),
      `### ${contact.heading.join(" ")}`,
      "",
      contact.text,
      "",
      `${contact.serviceArea.label}: ${contact.serviceArea.text}`,
      "",
      `- Phone: ${site.phone.label}`,
      `- Email: ${site.email}`,
      `- Instagram: ${site.instagram.handle} (${site.instagram.href})`,
      `- ${site.legalName}, ${site.location}`,
    ),
    section(
      `${privacy.eyebrow}: ${privacy.heading}`,
      ...privacy.sections.flatMap((s) => [`### ${s.title}`, "", ...s.body, ""]),
    ),
  ].join("\n");
}
