import { validateEnv } from "./env.mjs";

validateEnv();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Every <Image> asks for quality 85. The image optimizer (Cloudflare Images via
    // OpenNext) rejects any quality not listed here; 75 is Next's default.
    qualities: [75, 85],
    // Next's defaults plus 1440, so a full-bleed photo on a 1440px screen gets a
    // 1440px file instead of jumping to 1920.
    deviceSizes: [640, 750, 828, 1080, 1200, 1440, 1920, 2048, 3840],
  },
};

export default nextConfig;
