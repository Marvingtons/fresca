// One grade for every photo, and the files the site serves.
//
//   node scripts/grade-images.mjs            grade, export, write the manifest
//   node scripts/grade-images.mjs --sheet    also write docs/screens/contact-sheet.png
//
// Reads the prepared masters in assets/prepared/ (the ungraded JPEGs written by
// the prepare-*.mjs scripts; they never go into public/) and writes
//   public/images/<GRADE>/<name>-<width>.avif   AVIF quality 60
//   public/images/<GRADE>/<name>-<width>.webp   WebP quality 82
//   public/images/<GRADE>/<name>.jpg            JPEG fallback (and JSON-LD contentUrl)
//   content/images.json                         sizes, read by components/Photo.tsx
//   public/media/fresca-hero-poster-v2.*        the hero poster, same grade, 1920x1080, served
//                                               from the site as the LCP image (a copy also
//                                               goes to assets/export/ for the media bucket)
//
// Only photos named in content/site.ts are exported. Files are cached for a year
// (public/_headers), so bump GRADE whenever the grade or a master changes.
//
// The grade, the same for every photo:
//   0. White balance, only where the photo's whites are clearly yellow or blue
//      (see WB_LIMIT): the brightest near-neutral surface (the whitest wall or
//      ceiling) is pulled to neutral.
//   1. Levels: sharp .normalise() (1% to 99% luminance stretch).
//   2. Warm shift: red x 1.02, blue x 0.98.
//   3. Saturation +4%.
//   4. Gentle S-curve: slope 1.04 at mid grey, black and white points fixed.
// Drawings and design boards (BOARDS) are not graded, only converted.
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

export const GRADE = "g1";
const SRC = path.resolve("assets/prepared");
const OUT = path.resolve("public/images", GRADE);
const EXPORT = path.resolve("assets/export");
const POSTER = path.join(SRC, "fresca-hero-poster.jpg");
const POSTER_OUT = path.resolve("public/media");
const WIDTHS = [480, 768, 1200, 1600, 2000];
const FALLBACK_WIDTH = 1600;
const BOARDS = new Set(["color-floor-plan", "kitchen-material-board", "lighting-ceiling-plan"]);

/** Whites further than this from the set's typical red/blue balance get corrected. */
const WB_LIMIT = { yellow: 1.09, blue: 0.985 };
/** Crops take the white balance of the photo they were cut from. */
const WB_FROM = { "glass-pendants-crop": "black-hood-kitchen-island" };

/** Average colour of the brightest near-neutral, unclipped 15% of the photo. */
async function whiteReference(file) {
  const { data } = await sharp(file).resize(240).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const px = [];
  for (let i = 0; i < data.length; i += 3) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    if (max < 250) px.push([0.299 * r + 0.587 * g + 0.114 * b, r, g, b, (max - min) / (max || 1)]);
  }
  px.sort((a, b) => b[0] - a[0]);
  const top = px.slice(0, Math.floor(px.length * 0.15)).filter((p) => p[4] < 0.25);
  const sum = top.reduce((a, p) => [a[0] + p[1], a[1] + p[2], a[2] + p[3]], [0, 0, 0]);
  return sum.map((v) => v / top.length);
}

/** Channel gains that neutralise the white reference, or null when it is close enough. */
async function whiteBalance(file) {
  const [r, g, b] = await whiteReference(file);
  if (r / b < WB_LIMIT.yellow && r / b > WB_LIMIT.blue) return null;
  return [g / r, 1, g / b];
}

// Slope 1.04 at the middle, 0.96 at the ends, 0 and 255 unchanged.
const CURVE = Uint8Array.from({ length: 256 }, (_, v) => {
  const x = v / 255;
  return Math.round(255 * Math.min(1, Math.max(0, x - (0.04 * Math.sin(2 * Math.PI * x)) / (2 * Math.PI))));
});

const raw = (img) => img.removeAlpha().toColourspace("srgb").raw().toBuffer({ resolveWithObject: true });
const from = ({ data, info }) => sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } });

/**
 * Graded sharp instance. Each step is rendered before the next so they run in
 * this order (sharp reorders operations inside one pipeline).
 */
async function grade(input, wb) {
  let step = await raw(sharp(input));
  if (wb) step = await raw(from(step).linear(wb, [0, 0, 0]));
  step = await raw(from(step).normalise());
  step = await raw(from(step).linear([1.02, 1, 0.98], [0, 0, 0]));
  step = await raw(from(step).modulate({ saturation: 1.04 }));
  for (let i = 0; i < step.data.length; i++) step.data[i] = CURVE[step.data[i]];
  return from(step);
}

const site = await readFile("content/site.ts", "utf8");
const used = [...new Set([...site.matchAll(/img\("([a-z0-9-]+)"\)/g)].map((m) => m[1]))].sort();
const sheet = process.argv.includes("--sheet");
const pairs = []; // contact sheet: [label, before, after]
const manifest = {};

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });
await mkdir(EXPORT, { recursive: true });

for (const name of used) {
  const file = path.join(SRC, `${name}.jpg`);
  const board = BOARDS.has(name);
  const wb = board ? null : await whiteBalance(path.join(SRC, `${WB_FROM[name] ?? name}.jpg`));
  const graded = board ? sharp(file) : await grade(file, wb);
  const master = await raw(graded);
  const { width, height } = master.info;
  // Listed widths up to the master's, plus the master's own when it is smaller
  // than the largest listed width. Never above the master.
  const widths = WIDTHS.filter((w) => w <= width);
  if (width < WIDTHS.at(-1) && !widths.includes(width)) widths.push(width);
  let bytes = 0;
  for (const w of widths) {
    const sized = () => from(master).resize({ width: w });
    const avif = await sized().avif({ quality: 60, effort: 6 }).toBuffer();
    const webp = await sized().webp({ quality: 82, effort: 5 }).toBuffer();
    await writeFile(path.join(OUT, `${name}-${w}.avif`), avif);
    await writeFile(path.join(OUT, `${name}-${w}.webp`), webp);
    bytes += avif.length + webp.length;
  }
  await from(master)
    .resize({ width: FALLBACK_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.join(OUT, `${name}.jpg`));
  manifest[name] = { width, height, widths };
  const note = board ? "board, not graded" : wb ? `white balance R x${wb[0].toFixed(3)} B x${wb[2].toFixed(3)}` : "";
  console.log(`${name.padEnd(34)} ${width}x${height}  ${widths.join(",").padEnd(24)} ${(bytes / 1024).toFixed(0).padStart(5)} KB  ${note}`);
  if (sheet) pairs.push([`${name}${note ? `  (${note})` : ""}`, await sharp(file).resize(400).png().toBuffer(), await from(master).resize(400).png().toBuffer()]);
}

await writeFile("content/images.json", `${JSON.stringify({ grade: GRADE, images: manifest }, null, 2)}\n`);

// Hero poster: same grade, 1920x1080. If it changes, rename it (v3) and update
// content/media.ts: /media/* is cached for a year.
{
  const wb = await whiteBalance(POSTER);
  const master = await raw((await grade(POSTER, wb)).resize(1920, 1080, { fit: "cover" }));
  for (const dir of [POSTER_OUT, EXPORT]) {
    const base = path.join(dir, "fresca-hero-poster-v2");
    await from(master).webp({ quality: 82, effort: 6 }).toFile(`${base}.webp`);
    await from(master).avif({ quality: 60, effort: 6 }).toFile(`${base}.avif`);
    await from(master).jpeg({ quality: 82, mozjpeg: true }).toFile(`${base}.jpg`);
  }
  const note = wb ? `white balance R x${wb[0].toFixed(3)} B x${wb[2].toFixed(3)}` : "";
  console.log(`hero poster → public/media/ and assets/export/fresca-hero-poster-v2.{webp,avif,jpg}  ${note}`);
  if (sheet) pairs.push([`hero poster${note ? `  (${note})` : ""}`, await sharp(POSTER).resize(400).png().toBuffer(), await from(master).resize(400).png().toBuffer()]);
}

// Contact sheet: before and after, 400px wide each, two photos per row.
if (sheet) {
  const COLS = 2, CELL = 400, GAP = 12, LABEL = 26, PAD = 24;
  const pairW = CELL * 2 + GAP;
  const comps = [];
  let y = PAD;
  for (let i = 0; i < pairs.length; i += COLS) {
    const row = pairs.slice(i, i + COLS);
    let rowH = 0;
    for (const [c, [label, before, after]] of row.entries()) {
      const x = PAD + c * (pairW + PAD);
      const h = (await sharp(before).metadata()).height;
      rowH = Math.max(rowH, h);
      const text = `<svg xmlns="http://www.w3.org/2000/svg" width="${pairW}" height="${LABEL}"><text x="0" y="17" font-family="Helvetica, Arial, sans-serif" font-size="13" fill="#1D1C1A">${label}</text><text x="${pairW}" y="17" text-anchor="end" font-family="Helvetica, Arial, sans-serif" font-size="11" fill="#6B665C">before | after</text></svg>`;
      comps.push({ input: Buffer.from(text), left: x, top: y }, { input: before, left: x, top: y + LABEL }, { input: after, left: x + CELL + GAP, top: y + LABEL });
    }
    y += LABEL + rowH + PAD;
  }
  await mkdir("docs/screens", { recursive: true });
  await sharp({ create: { width: PAD + COLS * (pairW + PAD), height: y, channels: 3, background: "#F4F2EB" } })
    .composite(comps)
    .png({ compressionLevel: 9 })
    .toFile("docs/screens/contact-sheet.png");
  console.log("contact sheet → docs/screens/contact-sheet.png");
}
