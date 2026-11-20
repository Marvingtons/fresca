import type { MetadataRoute } from "next";
import { site } from "@/content/site";

// Temporary icons from public/icon.svg (scripts/make-favicons.mjs) until the logo is final.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.shortName,
    start_url: "/",
    display: "browser",
    background_color: "#F4F2EB",
    theme_color: "#F4F2EB",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
