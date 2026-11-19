// Structured data check: the rules Google's Rich Results Test applies to this
// site's types, run against the built pages.
//
//   npm run build && npm run check:schema    (npm run check:schema -- --print shows the home graph)
//
// The graph's shape is already type-checked with schema-dts (lib/structured-data.ts).
// This checks what types can't: one JSON-LD block, in <head>; every @id reference
// resolves; the fields Google requires or recommends are present; URLs are
// absolute; FAQ text is word for word what the page shows; project images match
// the slider's titles and cities; name, phone and email match the page.
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
// Node strips the types from content/site.ts (it has no imports).
import { showcase } from "../content/site.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const APP = path.join(ROOT, ".next/server/app");
const PAGES = { "/": "index.html", "/privacy": "privacy.html", "404": "_not-found.html" };
const print = process.argv.includes("--print");

const errors = [];
const fail = (page, msg) => errors.push(`${page}: ${msg}`);

const decode = (s) =>
  s
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
const visibleText = (html) =>
  decode(
    html
      .replace(/<head>[\s\S]*?<\/head>/, " ")
      .replace(/<script[\s\S]*?<\/script>/g, " ")
      .replace(/<style[\s\S]*?<\/style>/g, " ")
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<[^>]+>/g, " "),
  ).replace(/\s+/g, " ");
const types = (node) => [].concat(node["@type"] ?? []);
const isAbsolute = (url) => /^https?:\/\/[^/]+/.test(url);

if (!existsSync(path.join(APP, "index.html"))) {
  console.error("check:schema: no build in .next/. Run `npm run build` first.");
  process.exit(1);
}

let homeGraph;
for (const [page, file] of Object.entries(PAGES)) {
  const html = readFileSync(path.join(APP, file), "utf8");
  const head = html.match(/<head>([\s\S]*?)<\/head>/)?.[1] ?? "";
  const all = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  const inHead = [...head.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  // The 404 is noindex and describes nothing, so it carries no graph.
  if (page === "404") {
    if (all.length) fail(page, `expected no JSON-LD on the 404, found ${all.length}`);
    console.log(`${page.padEnd(9)} no JSON-LD (noindex)`);
    continue;
  }
  if (all.length !== 1) fail(page, `expected 1 JSON-LD block, found ${all.length}`);
  if (inHead.length !== 1) fail(page, "the JSON-LD block is not in <head>");
  if (!all.length) continue;

  let data;
  try {
    data = JSON.parse(all[0][1]);
  } catch (e) {
    fail(page, `JSON-LD does not parse: ${e.message}`);
    continue;
  }
  if (data["@context"] !== "https://schema.org") fail(page, "@context must be https://schema.org");
  const nodes = data["@graph"] ?? [];
  if (!nodes.length) fail(page, "no @graph");
  if (/—/.test(all[0][1])) fail(page, "em dash in JSON-LD");

  // Every {"@id"} reference must point at a node in the graph.
  const ids = new Set(nodes.map((n) => n["@id"]).filter(Boolean));
  const refs = [];
  const walk = (v) => {
    if (Array.isArray(v)) return v.forEach(walk);
    if (v && typeof v === "object") {
      if (Object.keys(v).length === 1 && v["@id"]) refs.push(v["@id"]);
      Object.values(v).forEach(walk);
    }
  };
  nodes.forEach((n) => Object.values(n).forEach(walk));
  for (const ref of refs) if (!ids.has(ref)) fail(page, `@id reference ${ref} does not resolve`);

  const text = visibleText(html);
  const byType = (t) => nodes.filter((n) => types(n).includes(t));

  // LocalBusiness: Google requires name and address; recommends url, telephone, image.
  const [biz] = byType("LocalBusiness");
  if (!biz) fail(page, "no LocalBusiness node");
  else {
    for (const key of ["@id", "name", "url", "telephone", "email", "image", "logo", "address", "areaServed", "founder"]) {
      if (!biz[key]) fail(page, `LocalBusiness is missing ${key}`);
    }
    if (!types(biz).includes("ProfessionalService")) fail(page, "business is not also a ProfessionalService");
    const a = biz.address ?? {};
    if (a["@type"] !== "PostalAddress" || !a.addressLocality || !a.addressRegion || !a.addressCountry) fail(page, "address needs locality, region and country");
    if (!/^\+1-\d{3}-\d{3}-\d{4}$/.test(biz.telephone ?? "")) fail(page, `telephone ${biz.telephone} is not +1-XXX-XXX-XXXX`);
    for (const key of ["url", "image", "logo"]) if (biz[key] && !isAbsolute(biz[key])) fail(page, `LocalBusiness ${key} is not absolute`);
    if (biz.priceRange) fail(page, "priceRange is set but Karen hasn't given one");
    if (biz.openingHours || biz.openingHoursSpecification) fail(page, "opening hours are set but Karen hasn't given them");
    // Name and email as the page shows them; the phone is in the home page footer.
    {
      const digits = biz.telephone.replace(/^\+1-/, "").replace(/-/g, ".");
      if (page === "/" && !text.includes(digits)) fail(page, `phone ${digits} is not on the page`);
      if (!text.includes(biz.email)) fail(page, `email ${biz.email} is not on the page`);
      if (!text.includes(biz.name)) fail(page, `name ${biz.name} is not on the page`);
    }
  }

  const [site] = byType("WebSite");
  if (!site?.["@id"] || !site.name || !isAbsolute(site.url ?? "")) fail(page, "WebSite needs @id, name and an absolute url");

  if (page === "/") {
    homeGraph = data;
    const [web] = byType("WebPage");
    if (!web) fail(page, "no WebPage node");
    else {
      if (web.isPartOf?.["@id"] !== site?.["@id"]) fail(page, "WebPage.isPartOf is not the WebSite");
      if (web.about?.["@id"] !== biz?.["@id"]) fail(page, "WebPage.about is not the business");
    }
    // FAQPage: each Question needs name and acceptedAnswer.text, word for word as shown.
    const [faqPage] = byType("FAQPage");
    const questions = faqPage?.mainEntity ?? [];
    if (!questions.length) fail(page, "FAQPage has no questions");
    for (const q of questions) {
      if (q["@type"] !== "Question" || !q.name || q.acceptedAnswer?.["@type"] !== "Answer" || !q.acceptedAnswer.text) {
        fail(page, `malformed Question ${JSON.stringify(q).slice(0, 80)}`);
        continue;
      }
      if (!text.includes(q.name)) fail(page, `FAQ question not shown on the page: ${q.name}`);
      if (!text.includes(q.acceptedAnswer.text)) fail(page, `FAQ answer not shown word for word: ${q.acceptedAnswer.text.slice(0, 60)}…`);
    }
    // ImageObject: contentUrl (absolute) and name; one per slider project, with its
    // title, and a contentLocation only where the project has a city.
    const images = byType("ImageObject");
    if (images.length !== showcase.projects.length) fail(page, `${images.length} ImageObjects for ${showcase.projects.length} projects`);
    for (const project of showcase.projects) {
      const img = images.find((i) => i.name === project.title);
      if (!img) {
        fail(page, `no ImageObject for ${project.title}`);
        continue;
      }
      if (!isAbsolute(img.contentUrl ?? "") || !img.contentUrl.endsWith(project.image.src)) fail(page, `${project.title}: contentUrl ${img.contentUrl}`);
      if ((img.contentLocation?.name ?? undefined) !== project.city) fail(page, `${project.title}: contentLocation ${img.contentLocation?.name} vs city ${project.city}`);
    }
  }
  console.log(`${page.padEnd(9)} 1 block in <head>, ${nodes.length} nodes: ${nodes.map((n) => types(n).join("+")).join(", ")}`);
}

if (print && homeGraph) console.log("\nHome page graph:\n" + JSON.stringify(homeGraph, null, 2));
for (const e of errors) console.log(`error  ${e}`);
console.log(`check:schema: ${errors.length} error(s).`);
process.exit(errors.length ? 1 : 0);
