/**
 * Hero film (Cloudflare R2) and its poster.
 *
 * Film URLs are built from NEXT_PUBLIC_MEDIA_BASE, so moving the bucket to a
 * custom domain is a one-line env change (docs/DEPLOY.md). The poster is the
 * page's LCP image, so it is served from the site's own origin
 * (public/media/, cached for a year by public/_headers): no extra connection
 * before first paint. Its filename must change if the poster changes.
 */

// Referenced literally so Next inlines it into the client bundle.
const base = (process.env.NEXT_PUBLIC_MEDIA_BASE ?? "").replace(/\/+$/, "");
const url = (name: string) => `${base}/${name}`;

export type FilmSource = { src: string; type: string };

export const heroFilm = {
  /** First frame of the film. Shown before, and instead of, the video. */
  poster: {
    // Graded with the photos (scripts/grade-images.mjs): AVIF 78 KB, WebP 90 KB.
    avif: "/media/fresca-hero-poster-v2.avif",
    webp: "/media/fresca-hero-poster-v2.webp",
    jpg: "/media/fresca-hero-poster-v2.jpg",
    width: 1920,
    height: 1080,
  },
  // Exact codec string from ffprobe: AV1 Main profile, level 4.0 (seq_level_idx 8),
  // Main tier, 10-bit. Browsers that can't decode it (older iPhones) skip to the mp4.
  // Re-probe and update this if the file is re-encoded.
  webm1080: { src: url("fresca-hero-1080.webm"), type: 'video/webm; codecs="av01.0.08M.10"' },
  mp41080: { src: url("fresca-hero-1080.mp4"), type: "video/mp4" },
  /** Phones, slow connections. */
  mp4720: { src: url("fresca-hero-720.mp4"), type: "video/mp4" },
};
