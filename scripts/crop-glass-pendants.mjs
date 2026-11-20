// Tight crop of the three glass pendants from black-hood-kitchen-island.jpg
// (studio wall Pl. 01) for the Approach "Light" panel.
//
//   node scripts/crop-glass-pendants.mjs
//
// Same encoding as scripts/prepare-images.mjs: RGB JPEG, mozjpeg, quality
// stepping down from 88 to stay under ~600 KB. Crop only, never enlarged.
import { writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SRC = path.resolve("assets/prepared/black-hood-kitchen-island.jpg");
const OUT = path.resolve("assets/prepared/glass-pendants-crop.jpg");
const BUDGET = 600 * 1024;
// Portrait, to match the Approach photo frame (about 0.82 : 1).
const REGION = { left: 690, top: 0, width: 960, height: 1170 };

let out;
for (const quality of [88, 85, 82, 80, 78]) {
  out = await sharp(SRC).extract(REGION).toColourspace("srgb").jpeg({ quality, mozjpeg: true }).toBuffer({ resolveWithObject: true });
  out.quality = quality;
  if (out.data.length <= BUDGET) break;
}
await writeFile(OUT, out.data);
console.log(`glass-pendants-crop.jpg  ${out.info.width}×${out.info.height}  q${out.quality}  ${(out.data.length / 1024).toFixed(0)} KB`);
