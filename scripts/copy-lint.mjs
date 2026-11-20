// Copy lint: enforces the voice and punctuation rules in CLAUDE.md.
//
//   npm run copy-lint
//
// Errors (exit 1):
//   - em dashes (the character, &mdash;, &#8212; or —) anywhere in copy,
//     alt text or metadata
//   - plural voice: "we", "our", "ours", "us", "one designer", "the designer",
//     "our team", outside the allowed phrases below
// Warnings (exit 0): every "San Diego" and "North County", so a person can
// check each one is service-area phrasing.
//
// Scans the source copy (comments stripped) every time. If a build exists in
// .next/, also scans the rendered HTML: visible text plus alt, title,
// aria-label, placeholder and meta content attributes, and JSON-LD.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_DIRS = ["app", "components", "content", "lib"];
const SOURCE_EXT = /\.(ts|tsx|js|jsx|mjs|json|md|txt)$/;
const BUILD_DIR = path.join(ROOT, ".next/server/app");

/** Approved plural phrases. Matched case-insensitively against the line. */
const ALLOWED = [
  /working with us/i, // section heading
  /budgets upfront, we create a clear path forward/i, // Karen's own sentence
];

const EM_DASH = /—|&mdash;|&#8212;|&#x2014;|\\u2014/gi;
// Lowercase or capitalized only, so the country code "US" passes. Hyphen
// neighbours are excluded so ids like "about-us" pass.
const PLURAL = /(?<![\w-])(we|We|our|Our|ours|Ours|us|Us|one designer|One designer|the designer|The designer|our team|Our team)(?![\w-])/g;
const PLACES = /San Diego|North County/g;

const errors = [];
const warnings = [];

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

/** Blank out comments but keep line numbers and string contents. */
function stripComments(src) {
  let out = "";
  let i = 0;
  let quote = null;
  while (i < src.length) {
    const c = src[i];
    const next = src[i + 1];
    if (quote) {
      out += c;
      if (c === "\\") { out += next ?? ""; i += 2; continue; }
      if (c === quote) quote = null;
      i++;
    } else if (c === '"' || c === "'" || c === "`") {
      quote = c; out += c; i++;
    } else if (c === "/" && next === "/") {
      while (i < src.length && src[i] !== "\n") i++;
    } else if (c === "/" && next === "*") {
      const end = src.indexOf("*/", i + 2);
      const stop = end === -1 ? src.length : end + 2;
      out += src.slice(i, stop).replace(/[^\n]/g, " ");
      i = stop;
    } else {
      out += c; i++;
    }
  }
  return out;
}

function check(where, line, text) {
  const snippet = text.trim().slice(0, 160);
  for (const m of text.matchAll(EM_DASH)) errors.push(`${where}:${line}  em dash "${m[0]}"  ${snippet}`);
  if (!ALLOWED.some((re) => re.test(text))) {
    for (const m of text.matchAll(PLURAL)) errors.push(`${where}:${line}  "${m[0]}"  ${snippet}`);
  }
  for (const m of text.matchAll(PLACES)) warnings.push(`${where}:${line}  "${m[0]}"  ${snippet}`);
}

// 1. Source copy
for (const dir of SOURCE_DIRS) {
  for (const file of walk(path.join(ROOT, dir))) {
    if (!SOURCE_EXT.test(file)) continue;
    const rel = path.relative(ROOT, file);
    // The placeholders checklist is never rendered and quotes questions for Karen.
    if (rel === path.join("content", "placeholders.ts")) continue;
    const code = /\.(md|txt|json)$/.test(file) ? readFileSync(file, "utf8") : stripComments(readFileSync(file, "utf8"));
    // In code, only look inside string literals and JSX text, not identifiers.
    code.split("\n").forEach((line, n) => {
      const copy = /\.(md|txt|json)$/.test(file)
        ? line
        : [...line.matchAll(/"([^"\\]|\\.)*"|'([^'\\]|\\.)*'|`([^`\\]|\\.)*`|>[^<>{}]+</g)].map((m) => m[0]).join(" ");
      if (copy) check(rel, n + 1, copy);
    });
  }
}

// 2. Rendered HTML, when a build exists
const pages = walk(BUILD_DIR).filter((f) => f.endsWith(".html"));
for (const file of pages) {
  const rel = path.relative(ROOT, file);
  const html = readFileSync(file, "utf8");
  const jsonLd = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const attrs = [...html.matchAll(/\s(?:alt|title|aria-label|placeholder|content)="([^"]*)"/g)].map((m) => m[1]);
  const title = [...html.matchAll(/<title>([^<]*)<\/title>/g)].map((m) => m[1]);
  const text = html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, "\n")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const [kind, list] of [["text", text], ["attr", attrs], ["title", title], ["json-ld", jsonLd]]) {
    list.forEach((s) => check(`${rel} (${kind})`, "-", s));
  }
}

const unique = (list) => [...new Set(list)];
if (!pages.length) console.log("copy-lint: no build in .next/, checked source only. Run `npm run build` first to also check rendered HTML.");
for (const w of unique(warnings)) console.log(`warn   ${w}`);
for (const e of unique(errors)) console.log(`error  ${e}`);
console.log(`copy-lint: ${unique(errors).length} error(s), ${unique(warnings).length} warning(s) to review (San Diego / North County must be service-area phrasing).`);
process.exit(errors.length ? 1 : 0);
