/**
 * Hero film and poster, hosted on the media bucket (Cloudflare R2).
 *
 * Every URL is built from NEXT_PUBLIC_MEDIA_BASE, so moving the bucket to a
 * custom domain is a one-line env change. Files are named here only.
 */

// Referenced literally so Next inlines it into the client bundle.
const base = (process.env.NEXT_PUBLIC_MEDIA_BASE ?? "").replace(/\/+$/, "");
const url = (name: string) => `${base}/${name}`;

export type FilmSource = { src: string; type: string };

export const heroFilm = {
  /** First frame of the film. Shown before, and instead of, the video. */
  poster: {
    webp: url("fresca-hero-poster.webp"),
    jpg: url("fresca-hero-poster.jpg"),
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
