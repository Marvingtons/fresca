// Hero film and poster. Every URL lives here, so moving hosts is a one-line edit.
// TODO before launch: r2.dev URLs are rate limited and not meant for production
// traffic. Connect a custom domain to the bucket (e.g. media.<domain>) and change BASE.
const BASE = "https://pub-364f647b29874b09922e1889f267c323.r2.dev";

export const heroMedia = {
  webm1080: `${BASE}/fresca-hero-1080.webm`, // AV1, 1.6 MB
  mp41080: `${BASE}/fresca-hero-1080.mp4`, // H.264, 3.2 MB
  mp4720: `${BASE}/fresca-hero-720.mp4`, // H.264, 1.5 MB, mobile
  posterWebp: `${BASE}/fresca-hero-poster.webp`,
  posterJpg: `${BASE}/fresca-hero-poster.jpg`,
};

export type HeroMediaSources = typeof heroMedia;
