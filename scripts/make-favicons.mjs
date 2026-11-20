// Temporary favicon set rendered from public/icon.svg. Replace when the logo is
// final, then rerun:  node scripts/make-favicons.mjs
//
// Writes public/favicon.ico (16, 32 and 48 px PNGs inside an ICO), icon-32.png,
// apple-touch-icon.png (180), icon-192.png and icon-512.png.
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const PUB = path.resolve("public");
const svg = await readFile(path.join(PUB, "icon.svg"));
const png = (size) => sharp(svg, { density: 72 * (size / 64) * 2 }).resize(size, size).png().toBuffer();

for (const [name, size] of [["icon-32.png", 32], ["apple-touch-icon.png", 180], ["icon-192.png", 192], ["icon-512.png", 512]]) {
  await writeFile(path.join(PUB, name), await png(size));
}

// ICO: 6-byte header, a 16-byte entry per image, then the PNG data.
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map(png));
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((size, i) => {
  const e = 6 + 16 * i;
  header.writeUInt8(size, e);
  header.writeUInt8(size, e + 1);
  header.writeUInt16LE(1, e + 4); // color planes
  header.writeUInt16LE(32, e + 6); // bits per pixel
  header.writeUInt32LE(images[i].length, e + 8);
  header.writeUInt32LE(offset, e + 12);
  offset += images[i].length;
});
await writeFile(path.join(PUB, "favicon.ico"), Buffer.concat([header, ...images]));
console.log("favicons written");
