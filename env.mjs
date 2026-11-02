import { z } from "zod";

/**
 * Environment schema. Checked once when Next loads its config (dev and build),
 * so a missing or malformed value fails fast instead of shipping broken URLs.
 * Kept out of the client bundle; components read process.env directly.
 */
const schema = z.object({
  // Canonical site URL (optional until the real domain is attached).
  NEXT_PUBLIC_SITE_URL: z.union([z.literal(""), z.url()]).optional(),
  // Base URL of the media bucket (hero film and poster). No trailing slash needed.
  NEXT_PUBLIC_MEDIA_BASE: z.url(),
});

export function validateEnv() {
  const result = schema.safeParse(process.env);
  if (!result.success) {
    throw new Error(`Invalid environment variables:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}
