/** The graded photo manifest (content/images.json, written by scripts/grade-images.mjs). */
import manifest from "@/content/images.json";

export type Entry = { width: number; height: number; widths: number[] };
const images = manifest.images as Record<string, Entry>;

/** "/images/g1/name.jpg" (content/site.ts) to its manifest entry and URL stem. */
export function lookup(src: string) {
  const stem = src.replace(/\.jpg$/, "");
  const entry = images[stem.slice(stem.lastIndexOf("/") + 1)];
  if (!entry) throw new Error(`Photo: ${src} is not in content/images.json. Run node scripts/grade-images.mjs.`);
  return { stem, entry };
}

/** The srcset of one format, as written by scripts/grade-images.mjs. */
export function photoSrcSet(src: string, format: "avif" | "webp") {
  const { stem, entry } = lookup(src);
  return entry.widths.map((w) => `${stem}-${w}.${format} ${w}w`).join(", ");
}
