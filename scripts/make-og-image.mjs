// Open Graph image: the hero poster at 1200x630 with the wordmark and the hero's
// "Interior design · Solana Beach" line, in the site's own fonts.
//
//   node scripts/make-og-image.mjs        (runs before every `npm run build`)
//
// Writes public/og-image.jpg. Text is drawn as vector paths with opentype.js
// from the TTFs in assets/fonts, because sharp's text renderer can't load a font
// file on macOS. The output is committed, so a machine without sharp keeps the
// last image (the script warns and exits 0).
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = path.join(ROOT, "public/media/fresca-hero-poster.jpg");
const OUT = path.join(ROOT, "public/og-image.jpg");
const W = 1200;
const H = 630;

// The hero's eyebrow, as on the page (content/site.ts hero.eyebrow), and the wordmark.
const WORDMARK = "Fresca";
const LINE = "Interior design · Solana Beach".toUpperCase();

let sharp, opentype;
try {
  sharp = (await import("sharp")).default;
  opentype = (await import("opentype.js")).default;
} catch (e) {
  console.warn(`make-og-image: skipped, ${e.message}. Keeping the committed public/og-image.jpg.`);
  process.exit(0);
}

const font = (file) => opentype.parse(readFileSync(path.join(ROOT, "assets/fonts", file)).buffer);
const serif = font("InstrumentSerif-Italic.ttf");
const sans = font("HankenGrotesk-Medium.ttf");

/** One line of text as an SVG path, centered on cx, with letter spacing in em. */
function line(f, text, size, cx, baseline, tracking = 0) {
  const scale = size / f.unitsPerEm;
  // Glyph by glyph: opentype.js can't run these fonts' contextual substitutions, and no line here needs them.
  const glyphs = [...text].map((ch) => f.charToGlyph(ch));
  const advances = glyphs.map((g, i) => {
    const kern = i < glyphs.length - 1 ? f.getKerningValue(g, glyphs[i + 1]) : 0;
    return (g.advanceWidth + kern) * scale + (i < glyphs.length - 1 ? tracking * size : 0);
  });
  const width = advances.reduce((a, b) => a + b, 0);
  let x = cx - width / 2;
  const d = glyphs
    .map((g, i) => {
      const p = g.getPath(x, baseline, size).toPathData(2);
      x += advances[i];
      return p;
    })
    .join("");
  return `<path d="${d}" fill="#fff"/>`;
}

const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#12110f" stop-opacity=".30"/>
      <stop offset=".45" stop-color="#12110f" stop-opacity=".38"/>
      <stop offset="1" stop-color="#12110f" stop-opacity=".72"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  ${line(serif, WORDMARK, 168, W / 2, 430)}
  ${line(sans, LINE, 22, W / 2, 500, 0.24)}
</svg>`;

await sharp(SOURCE)
  // 1920x1080 to 1200x630: a downscale, never past the source.
  .resize(W, H, { fit: "cover", position: "centre" })
  .composite([{ input: Buffer.from(overlay) }])
  .jpeg({ quality: 84, mozjpeg: true })
  .toFile(OUT);
console.log(`make-og-image: wrote public/og-image.jpg (${W}x${H})`);
