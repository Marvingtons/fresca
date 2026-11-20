# Fresca Interior Design

Marketing site for Fresca, a residential interior design studio in San Diego.
Next.js 14 (App Router), TypeScript, Tailwind, GSAP + ScrollTrigger, Lenis.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build && npm run lint
```

## Where things live

- **Copy and data:** `content/site.ts`. Every placeholder is marked `// DEMO:`.
- **Sections:** `components/` (one file per section, in page order in `app/page.tsx`).
- **Design tokens:** `tailwind.config.ts` and the `:root` block in `app/globals.css`.
- **Animation helpers:** `lib/gsap.ts` (plugin registration), `lib/motion.ts`
  (reduced-motion and desktop media queries, masked line reveals), `lib/intro.ts`
  (once-per-session intro).
- **Contact form:** `components/ContactForm.tsx` → `app/api/contact/route.ts`.
  Submissions are only logged for now; see the Resend TODO in the route and
  `.env.example`.

## Photos

`assets/prepared/` holds the ungraded masters, written by
`scripts/prepare-images.mjs` from the client's numbered PNGs (mapping in
`content/site.ts`). `node scripts/grade-images.mjs` applies the one grade and
writes the AVIF, WebP and JPEG files the site serves to `public/images/g1/`,
plus `content/images.json`. To swap a photo, replace its master (same name) and
run the grade script, or re-run the prepare script against the new folder first:

```bash
node scripts/prepare-images.mjs "/path/to/FRESCA PHOTOS"
```
