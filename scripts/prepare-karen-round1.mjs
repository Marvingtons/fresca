// Karen's round 1 photos (iPhone, ~1430px long edge) → assets/prepared/.
//
//   node scripts/prepare-karen-round1.mjs
//
// Same encoding as scripts/prepare-images.mjs: RGB JPEG, mozjpeg, quality
// stepping down from 88 to keep files under ~600 KB, never enlarged. next/image
// serves WebP/AVIF srcsets from these. The source files are left untouched.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SRC = path.resolve("assets/source/karen-round1");
const OUT = path.resolve("assets/prepared");
const BUDGET = 600 * 1024;

// Degrees to turn each photo clockwise so it stands upright. These files carry
// no EXIF orientation, so the pixels themselves are sideways or upside down.
const PHOTOS = {
  "white-oak-ceiling-bedroom": 0,
  "subway-tile-secondary-bath": 180, // floor and ceiling were swapped
  // "lantern-pendant-kitchen": 0, replaced on Pl. 05 by round 2 (prepare-karen-round2.mjs)
  "del-mar-primary-bath": 90, // floor was on the right edge
  "linen-coastal-bedroom": 90, // floor was on the right edge
};

await mkdir(OUT, { recursive: true });

for (const [name, turn] of Object.entries(PHOTOS)) {
  const base = () => sharp(path.join(SRC, `${name}.jpg`)).rotate(turn).flatten({ background: "#ffffff" }).toColourspace("srgb");
  let out;
  for (const quality of [88, 85, 82, 80, 78]) {
    out = await base().jpeg({ quality, mozjpeg: true }).toBuffer({ resolveWithObject: true });
    out.quality = quality;
    if (out.data.length <= BUDGET) break;
  }
  await writeFile(path.join(OUT, `${name}.jpg`), out.data);
  console.log(`${name}.jpg  ${out.info.width}×${out.info.height}  q${out.quality}  ${(out.data.length / 1024).toFixed(0)} KB`);
}
