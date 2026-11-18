import { validateEnv } from "./env.mjs";

validateEnv();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Every <Image> asks for quality 85. The image optimizer (Cloudflare Images via
    // OpenNext) rejects any quality not listed here; 75 is Next's default.
    qualities: [75, 85],
  },
};

export default nextConfig;
