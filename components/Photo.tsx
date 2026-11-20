import type { CSSProperties, Ref } from "react";
import manifest from "@/content/images.json";

type Entry = { width: number; height: number; widths: number[] };
const images = manifest.images as Record<string, Entry>;

/** "/images/g1/name.jpg" (content/site.ts) to its manifest entry and URL stem. */
function lookup(src: string) {
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

/**
 * A graded photo that fills its positioned parent (object-fit: cover): AVIF
 * first, then WebP, then the JPEG. Files are pre-built by
 * scripts/grade-images.mjs, never larger than the master. Lazy unless `eager`.
 */
export default function Photo({
  src,
  alt,
  sizes,
  eager = false,
  className = "",
  style,
  ref,
}: {
  src: string;
  alt: string;
  /** The rendered width per breakpoint. */
  sizes: string;
  eager?: boolean;
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLImageElement>;
}) {
  const { entry } = lookup(src);
  return (
    <picture>
      <source type="image/avif" srcSet={photoSrcSet(src, "avif")} sizes={sizes} />
      <source type="image/webp" srcSet={photoSrcSet(src, "webp")} sizes={sizes} />
      {/* eslint-disable-next-line @next/next/no-img-element -- pre-built srcsets above; next/image would re-encode them */}
      <img
        ref={ref}
        src={src}
        alt={alt}
        width={entry.width}
        height={entry.height}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        style={style}
        className={`absolute inset-0 h-full w-full object-cover ${className}`}
      />
    </picture>
  );
}
