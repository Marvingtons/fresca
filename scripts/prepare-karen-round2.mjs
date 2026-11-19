// Karen's round 2 photos (iPhone originals, 4032 px long edge, already upright)
// → public/images/.
//
//   node scripts/prepare-karen-round2.mjs
//
// Same encoding as scripts/prepare-images.mjs and prepare-karen-round1.mjs: RGB
// JPEG, mozjpeg, quality stepping down from 88, then the width shrinking, to keep
// files under the budget. Never enlarged. next/image serves WebP/AVIF srcsets
// from these. The originals stay in assets/source/karen-round2/ and never go
// into public/.
//
// Each photo is capped at the widest rendition its slot can ask for, not 4032:
//   Plate (studio wall): the photo fills a frame 120% tall (parallax), so a 4:3
//   photo in a 1:1 plate draws about 1.6x the plate width. Widest case is the
//   phone column (64vw of a 430px phone at 3x): about 1320 px. Cap 1600.
//   Slide (Selected work): full-bleed cover. Cap 2880, a 1440px screen at 2x.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SRC = path.resolve("assets/source/karen-round2");
const OUT = path.resolve("public/images");

const PHOTOS = {
  // Studio wall Pl. 05. Replaces lantern-pendant-kitchen (round 1).
  "lantern-pendant-kitchen-wide": { width: 1600, budget: 600 * 1024 },
  // Selected work slider. Replaces cognac-living-room (original photo 42).
  // Full-bleed, so it gets a larger budget than the plates.
  "cognac-linen-living-room-wide": { width: 2880, budget: 900 * 1024 },
  // Studio wall Pl. 06. Replaces walnut-guest-bath (original photo 34). A 3:4
  // photo in a 3:4 plate draws 1.2x the plate width; widest case is the phone
  // column (50vw of a 430px phone at 3x): about 775 px. Cap 1200.
  "stenciled-ceiling-guest-bath": { width: 1200, budget: 600 * 1024 },
};

await mkdir(OUT, { recursive: true });

for (const [name, { width: cap, budget }] of Object.entries(PHOTOS)) {
  const file = path.join(SRC, `${name}.jpg`);
  const base = (w) =>
    sharp(file).resize({ width: w, withoutEnlargement: true }).flatten({ background: "#ffffff" }).toColourspace("srgb");
  let out;
  for (let w = cap; ; w = Math.round(w * 0.9)) {
    for (const quality of [88, 85, 82, 80, 78]) {
      out = await base(w).jpeg({ quality, mozjpeg: true }).toBuffer({ resolveWithObject: true });
      out.quality = quality;
      if (out.data.length <= budget) break;
    }
    if (out.data.length <= budget || w <= 1200) break;
  }
  await writeFile(path.join(OUT, `${name}.jpg`), out.data);
  console.log(`${name}.jpg  ${out.info.width}×${out.info.height}  q${out.quality}  ${(out.data.length / 1024).toFixed(0)} KB`);
}
