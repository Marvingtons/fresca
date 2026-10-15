// Renders the arch mark (assets/source/arch-mark.svg) to the favicon sizes Next
// serves from app/: icon.png (32×32) and apple-icon.png (180×180).
// Run: node scripts/make-favicons.mjs
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const src = fileURLToPath(new URL("../assets/source/arch-mark.svg", import.meta.url));
const sizes = [
  ["app/icon.png", 32],
  ["app/apple-icon.png", 180],
];

for (const [out, size] of sizes) {
  await sharp(src, { density: (72 * size) / 64 }).resize(size, size).png().toFile(out);
  console.log(`${out} ${size}×${size}`);
}
