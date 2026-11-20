# Release 1.0

- **Live:** https://frescainteriordesign.com (www redirects 301 to the apex)
- **Released:** 20 November 2026, from `main` at merge commit `5baf8c0` (branch `karen-round1-plates`, merged with `--no-ff`), tagged `v1.0.0`
- **Worker:** `fresca-site`, version `27527cea-0b26-4f63-8c88-c9f95dbc123f`, custom domains `frescainteriordesign.com` and `www.frescainteriordesign.com`
- **Build env:** `NEXT_PUBLIC_SITE_URL=https://frescainteriordesign.com`, `NEXT_PUBLIC_MEDIA_BASE=https://media.frescainteriordesign.com` (from `.env.local`)
- **Worker secrets:** `RESEND_API_KEY`, `CONTACT_TO_EMAIL` and `CONTACT_FROM_EMAIL`, all set

## Post-deploy checks failed, fixes needed

These need changes in the Cloudflare and Resend dashboards, not in the code. Nothing was rolled back.

1. **The contact form returns 502.** One test was sent, name "Deploy test" (the form has no subject field, so the email subject would be "Website inquiry from Deploy test"); `/api/contact` answered `502 {"ok":false}`.
   - Likely cause: `CONTACT_FROM_EMAIL` is set, but `frescainteriordesign.com` is not verified in Resend. Public DNS has none of Resend's records (no `resend._domainkey` TXT, no MX or TXT on `send.`), and Resend rejects senders on unverified domains (DEPLOY.md 7.4).
   - Not confirmed from the log: this login's token cannot read Workers Observability. To confirm, open Workers, `fresca-site`, Logs, and search `[contact]`. The line says `Resend status 403` (sender refused), `not set` (secrets missing) or `network error`. Resend's own Logs page shows the reason too.
   - Fix A (recommended): verify the domain in Resend (DEPLOY.md 7.2). Then send one message from the live form.
   - Fix B (works today): `npx wrangler secret delete CONTACT_FROM_EMAIL`. The form then sends from `onboarding@resend.dev`, which only delivers to the Resend account owner's own address, so `CONTACT_TO_EMAIL` must be that address.
2. **Plain HTTP on the apex is not redirected.** `http://frescainteriordesign.com/` answers 200 over HTTP. (`http://www.` does redirect, through the www rule.)
   - Fix: SSL/TLS, Edge Certificates, **Always Use HTTPS** on (DEPLOY.md 4.2).
3. **No `Strict-Transport-Security` header.**
   - Fix: same page, HSTS on: 6 months, include subdomains, no preload (DEPLOY.md 4.3). All three hosts (`@`, `www`, `media`) now load over HTTPS.
4. **Cloudflare Web Analytics injects a beacon that the CSP blocks.** `static.cloudflareinsights.com/beacon.min.js` triggers a console error, and Best Practices drops to 92. It is also a third-party origin, which the performance brief excludes.
   - Fix A (recommended, matches the brief): Web Analytics, this site, turn off automatic setup, or Speed, Optimization, turn off **Web Analytics** injection.
   - Fix B: keep analytics. Add `https://static.cloudflareinsights.com` to `script-src` and `https://cloudflareinsights.com` to `connect-src` in `next.config.mjs`, then redeploy.
5. **Mobile Lighthouse is down more than 10% from docs/PERF.md.** See below.

## Live Lighthouse (mobile, one run)

| | docs/PERF.md (preview) | Live | Change |
|---|---|---|---|
| Performance | 92 | 84 | -9% |
| LCP | 3.38 s | 4.30 s | **+27%** |
| FCP | 0.92 s | 1.74 s | **+89%** |
| Speed Index | 1.58 s | 2.42 s | **+53%** |
| TBT | 22 ms | 36 ms | +14 ms |
| CLS | 0 | 0 | |
| TTFB | 32 ms | 143 ms | |
| Accessibility / Best practices / SEO | 100 / 100 / 100 | 100 / **92** / 100 | |

Most of the gap is the move from localhost to the network: TTFB rose from 32 to 143 ms, and edge caches were cold on the first request after the deploy. Best practices drops because of item 4. Rerun after the fixes above and once the cache is warm (Chrome, Lighthouse, Mobile), and compare with three runs, not one.

## Checks that passed

- **Status codes:** 200 on `/`, `/privacy`, `/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/llms-full.txt`; 404 on `/nope`.
- **Redirects:** `https://www.` and `http://www.` redirect 301 to `https://frescainteriordesign.com/`, keeping path and query.
- **Headers:**
  - `content-security-policy` present, with `img-src` and `media-src` set to `https://media.frescainteriordesign.com`
  - pages: `cache-control: public, max-age=0, must-revalidate`
  - `/_next/static/*`, `/images/*`, `/media/*`: `public, max-age=31536000, immutable`
  - `x-content-type-options`, `referrer-policy` and `permissions-policy` present
  - no `x-powered-by`; `content-encoding: br`
- **Hero film:** the page's `<video>` sources are on `https://media.frescainteriordesign.com` (none on r2.dev), and the three films answer 200 with `video/webm` and `video/mp4`. Not watched playing end to end from this Mac, whose DNS cache had not yet picked up the new `media.` record (public resolvers return it). DEPLOY.md 6.4 is still to tick in a browser.
- **Structured data:** `check:schema` run against the live HTML of `/`, `/privacy` and a 404: 0 errors (home: LocalBusiness+ProfessionalService, WebSite, WebPage+FAQPage, 6 ImageObject).
- **OG image:** `https://frescainteriordesign.com/og-image.jpg`, 200, JPEG, 89 KB.

## What shipped

- **Content:** Karen's round 1 and round 2 edits (copy, plates, projects), first-person voice, placeholders shown in terracotta.
- **Hero:** full-bleed film on the poster, navy FRESCA opening wipe. Graded AVIF poster, served from the site as the first paint.
- **Studio wall:** plates with number, title, location and hairline only. No grid, rulers or crosshairs.
- **Selected work:** 4:3 slides, caption row under the photo (title, location, counter, arrows).
- **Working with us:** photo rows and the plan drawing, edge-aligned with the photos, with the schedule beside it from 1024px.
- **Approach:** pinned horizontal panels on desktop, stacked on mobile.
- **Photos:** one grade for every photo (`scripts/grade-images.mjs`, folder `g1`). AVIF and WebP at 480 to 2000px, never above the source.
- **Performance:**
  - two font families (Cormorant Garamond 500, Outfit 300/400)
  - GSAP and Lenis loaded after hydration; home First Load JS 119 KB
  - static sections rendered on the server, FAQ without JS
  - immutable asset caching and a CSP
  - details in docs/PERF.md
- **Accessibility:** axe 0 violations at 390 and 1440; Lighthouse accessibility 100.
- **Code health:** React Doctor fixes (contact form double-submit guard, effect cleanups).

## Open content items (content/placeholders.ts)

| Where | What is owed |
|---|---|
| Studio wall Pl. 05, Kitchen with Lantern Pendant | location |
| Studio wall Pl. 07, Bay Window Dining | location (older demo value, not confirmed) |
| Studio wall Pl. 03, Coastal Secondary Bath | photo: the same shot is now on Pl. 06 (pending Karen) |
| Coastal Blue Family Room (mosaic-fireplace-family-room) | title and photo (pending Karen) |
| Approach, Plan panel (navy-chair-great-room) | photo (pending Karen) |
| Working with us, plan drawing | three real schedule selections, the 24'-0" dimension, "Signed before ordering" |

Also for Karen:
- **Pl. 03's location:** it reads "San Diego", which CLAUDE.md keeps to service-area phrasing.
- **Photo grouping:** the photo-to-project grouping is still provisional.

## Manual steps owed

**Media domain:** `media.frescainteriordesign.com` is attached and serving. Still owed:
- DEPLOY.md 5.2: the `Media one year` Cache Rule.
- DEPLOY.md 6.4: watch the film play from `media.` in a browser.
- DEPLOY.md 6.5: turn off the bucket's Public Development URL. `pub-364f647b29874b09922e1889f267c323.r2.dev` still answers 200.

**SSL and security** (DEPLOY.md section 4): Always Use HTTPS and HSTS (failed checks 2 and 3), Full (strict), TLS settings, Bot Fight Mode.

**Email DNS** (DEPLOY.md section 7): Google Workspace MX, verification and DKIM; Resend domain records (fixes the form, failed check 1); SPF and DMARC. Then a mail-tester.com score of 9 or better (DEPLOY.md section 10).

**Search Console** (DEPLOY.md 9.1 to 9.3): Domain property verified by TXT, submit `https://frescainteriordesign.com/sitemap.xml`, then import into Bing Webmaster Tools.

**Google Business Profile** (DEPLOY.md 9.4): a service-area business with the address hidden if it is a home. Then Bing Places, Apple Business Connect, and the Instagram profile link (9.5 to 9.7). Ownership is in DEPLOY.md section 11.

**Docs to update:**
- DEPLOY.md section 8 (Cloudflare Images) is out of date. Photos are now pre-built static files (`public/images/g1/`), not `next/image`, so no Images transformations are used. The `IMAGES` binding in `wrangler.jsonc` is unused and can go in a later release.
- DEPLOY.md 5.2 and PERF.md disagree on the media Browser TTL (respect origin versus one year). Either is fine, because film files are renamed when they change.
