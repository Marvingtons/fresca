// Copy the photos the design uses into public/images/ with descriptive names,
// flattened to RGB JPEG.
//
//   node scripts/prepare-images.mjs ["/path/to/FRESCA PHOTOS"]
//
// Each photo comes from reference/upscaled/<n>.jpg when there is one (see
// scripts/match-upscales.py and scripts/copy-upscales.mjs), otherwise from the
// client's original <n>.png. Never enlarges. Files aim to stay under ~600 KB:
// JPEG quality steps down from 88 to 78, then the long edge shrinks if needed.
// next/image serves AVIF/WebP at the right size from these sources.
import { access, mkdir, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import sharp from "sharp";

const SRC = process.argv[2] ?? path.join(homedir(), "Downloads", "FRESCA PHOTOS");
const UPSCALED = path.resolve("reference/upscaled");
const OUT = path.resolve("public/images");
const BUDGET = 600 * 1024;

// Keep in sync with the IMAGE MAP comment in content/site.ts.
const MAP = {
  1: "black-hood-kitchen",
  2: "black-hood-kitchen-island",
  3: "navy-chair-great-room",
  4: "bay-window-dining",
  5: "walnut-island-kitchen",
  6: "orb-chandelier-dining",
  7: "blue-gray-island-kitchen",
  9: "gloss-kitchen",
  21: "kitchen-material-board",
  23: "color-floor-plan",
  // 24 lighting-fixture-sheet: replaced by the plan drawing (components/PlanIllustration.tsx).
  25: "lighting-ceiling-plan",
  26: "freestanding-tub-bath",
  29: "black-hex-shower",
  31: "navy-double-vanity",
  32: "hammered-sink-bath",
  // 34 walnut-guest-bath: replaced on Pl. 06 by Karen's round 2 photo (prepare-karen-round2.mjs).
  37: "blush-guest-bedroom",
  38: "reclaimed-wood-bedroom",
  39: "bay-window-sitting-room",
  40: "iron-bed-bedroom",
  41: "mosaic-fireplace-family-room",
  // 42 cognac-living-room: replaced by Karen's round 2 photo (prepare-karen-round2.mjs).
  43: "two-story-living-room",
  44: "sectional-living-room",
};

// Drawings and design boards are never upscaled.
const BOARDS = new Set([21, 23, 24, 25]);

// Design-board screenshots whose top/bottom bands are fully transparent and
// would render as black bars once flattened. Crop them to the opaque area.
const TRIM_TRANSPARENT = new Set([23, 24]);

const exists = (f) => access(f).then(() => true, () => false);

async function opaqueBox(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  let top = h, bottom = -1, left = w, right = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > 16) {
        if (y < top) top = y;
        if (y > bottom) bottom = y;
        if (x < left) left = x;
        if (x > right) right = x;
      }
    }
  }
  return { left, top, width: right - left + 1, height: bottom - top + 1 };
}

/** Source for photo n: the upscale if there is one, else the original PNG. */
async function source(n) {
  const up = path.join(UPSCALED, `${n}.jpg`);
  if (!BOARDS.has(n) && (await exists(up))) return { file: up, label: `upscaled/${n}.jpg` };
  return { file: path.join(SRC, `${n}.png`), label: `${n}.png` };
}

/** RGB pipeline for photo n, before encoding. */
async function pipeline(n, file) {
  let img = sharp(file);
  if (TRIM_TRANSPARENT.has(n)) img = img.extract(await opaqueBox(file));
  return img.flatten({ background: "#ffffff" }).toColourspace("srgb");
}

/** Encode under the size budget: lower quality first, then the long edge. */
async function encode(n, file) {
  const { width, height } = await (await pipeline(n, file)).toBuffer({ resolveWithObject: true }).then((r) => r.info);
  let edge = Math.max(width, height);
  for (;;) {
    for (const quality of [88, 85, 82, 80, 78]) {
      const img = (await pipeline(n, file)).resize({ width: edge, height: edge, fit: "inside", withoutEnlargement: true });
      const { data, info } = await img.jpeg({ quality, mozjpeg: true }).toBuffer({ resolveWithObject: true });
      if (data.length <= BUDGET || (quality === 78 && edge <= 1600)) return { data, info, quality };
    }
    edge = Math.round(edge * 0.9);
  }
}

await mkdir(OUT, { recursive: true });

for (const [key, name] of Object.entries(MAP)) {
  const n = Number(key);
  const { file, label } = await source(n);
  const { data, info, quality } = await encode(n, file);
  await writeFile(path.join(OUT, `${name}.jpg`), data);
  console.log(`${label.padEnd(16)} → images/${name}.jpg  ${info.width}×${info.height}  q${quality}  ${(data.length / 1024).toFixed(0)} KB`);
}

// The Open Graph card is made from the hero poster by scripts/make-og-image.mjs.
