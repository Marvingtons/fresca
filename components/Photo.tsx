import type { CSSProperties, Ref } from "react";
import { type Entry, lookup, photoSrcSet } from "@/lib/photos";

/**
 * `sizes` gives the box's width. A photo wider than its box (a landscape photo
 * in a portrait box) is cropped to the box's height, so it renders wider than
 * the box: scale each width by imageAspect / boxAspect so the browser picks a
 * file that is sharp after the crop.
 */
function coverSizes(sizes: string, entry: Entry, box?: number) {
  const factor = box ? entry.width / entry.height / box : 1;
  if (factor <= 1.05) return sizes;
  const scale = (length: string) => length.replace(/(\d+(?:\.\d+)?)(vw|px)/g, (_, n, unit) => `${Math.round(parseFloat(n) * factor)}${unit}`);
  // Split on the commas between entries, not those inside min(...).
  return sizes
    .split(/,(?![^(]*\))/)
    .map((entry) => {
      const m = /^\s*(\([^)]*\))\s*(.*)$/.exec(entry);
      return m ? `${m[1]} ${scale(m[2])}` : scale(entry.trim());
    })
    .join(", ");
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
  box,
  eager = false,
  className = "",
  style,
  ref,
}: {
  src: string;
  alt: string;
  /** The rendered width per breakpoint. */
  sizes: string;
  /** Width / height of the box the photo covers, when it is fixed. */
  box?: number;
  eager?: boolean;
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLImageElement>;
}) {
  const { entry } = lookup(src);
  const fit = coverSizes(sizes, entry, box);
  return (
    <picture>
      <source type="image/avif" srcSet={photoSrcSet(src, "avif")} sizes={fit} />
      <source type="image/webp" srcSet={photoSrcSet(src, "webp")} sizes={fit} />
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
