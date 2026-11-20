# Fresca site audit

Audit of branch `karen-round1-plates` at `b91493d`, run 2026-11-18 on a production build (`next start`, plus an OpenNext build and `wrangler deploy --dry-run`). Nothing in the site was changed.

How it was checked: source read in full; Lighthouse 12 (mobile and desktop); axe-core 4.10 on the home page (motion on and reduced motion) and the 404 page; a Playwright pass at 390, 768, 1180 and 1440 measuring overflow, text size, touch targets, plate-wall collisions, every image and every link; form submitted with an empty form, a forced server error and a valid entry; hero film checked in headless Chrome and the in-app browser. Screenshots of every section at all four widths are in `.review/audit/` (`<width>-<section>[-<part>].png`, sections numbered 01 hero to 09 footer, plus `404-1440.png`).

Source attribution: Karen's edits document is not in the repo. "From Karen" below means it arrived in the round 1 commit (`f28e1dd`, "Apply Karen's round 1 edits") or in a message from you that relayed her answers. Everything else is developer draft copy.

Severity: **Blocks launch**, **Should fix**, **Nice to have**.

## 1. Content truth

### Facts on the site and where they come from

| Fact or claim | Where | Source |
| --- | --- | --- |
| Fresca Interior Design, LLC; Karen Onofrey, Founder and Principal Designer | site, founder, footer, JSON-LD | From Karen |
| Solana Beach; 858.750.0665; frescainteriordesign@gmail.com; fresca.interior.design | site, nav, footer, JSON-LD | From Karen |
| Plate and slider titles and locations (Solana Beach, Carmel Valley, San Diego, Del Mar) | studio wall, slider | From Karen |
| Kitchens, baths/bathrooms, whole homes (service list) | meta, wall paragraph | From Karen |
| "Beautiful spaces begin with thoughtful planning." | hero, meta | From Karen |
| Process heading and intro ("A thoughtful process…", "A successful remodel begins…") | Working with us | From Karen, verbatim |
| Founder quote "Your home should be a place you walk into…" | quote section | Round 1 commit; confirm it is her wording |
| FAQ answers on pricing and single rooms | FAQ | From Karen (her voice) |
| PL. 03 caption | studio wall | From Karen |
| 12 years, 140+ rooms, 9 neighborhoods, 1 in 3 clients came back | About stat cards | **Invented** (marked DEMO in source) |
| "works with homeowners across North County and the coast" | About text | **Developer draft** |
| "takes on a small number of projects at a time" | About text | **Developer draft** |
| "replies personally within two business days" (twice) | contact intro, thank-you | **Developer draft** |
| areaServed: Del Mar, Carmel Valley, North County San Diego | JSON-LD | **Inferred** from project locations, not given as a service area |
| Work aisle 42 in, walkway 36 in, counter 36 in, counter to uppers 18 in, pendant 30–36 in, 2700 K, drawing dims 36″ 18″ 30″ | Approach specs and drawings | **Developer draft** |
| "I measure your kitchen and I sign off the tile. No account managers…", "Every selection lives on one priced list…", "checks in on site… punch list in hand", "You'll always talk to Karen", "Drawn before it's bought", "A budget you can read" | Process rows | **Developer draft** (pronouns changed in round 1) |
| Approach panel text (Plan, Design, Light) | Approach | **Developer draft** |
| FAQ: what a project includes; works alongside your contractor, recommends contractors | FAQ | Developer draft, lightly edited in round 1 |
| Taglines: "Interiors that feel fresh.", "A fresh home, considered.", "Plan the space, then make it beautiful.", "Before you call", "Let's talk about your home." | hero, wall, Approach, FAQ, footer | **Developer draft** |
| Wall paragraphs "I design… around how you actually live in them", "I carry every project from the first walkthrough to installation day…" | studio wall | Developer draft, approved in direction by you this session |
| Callouts "Glass pendants ×3", "Linen sectional", "Lantern pendant" | studio wall | Developer description of the photos |
| frescainteriordesign.com | canonical, OG, sitemap, robots, JSON-LD | **Unconfirmed** (DEMO in source) |

### [PLACEHOLDER] items still open

None render on the page: `content/placeholders.ts` is a checklist only, so the CLAUDE.md rule "rendered in terracotta" is not implemented. Open entries:

| Item | Field |
| --- | --- |
| PL. 05 Kitchen with Lantern Pendant | location |
| PL. 07 Bay Window Dining | location |
| Cognac and Linen Living Room | does Karen's photo replace ours |
| Coastal Blue Family Room | title, photo |
| Approach Plan panel (navy-chair-great-room) | photo |
| site.url | production domain |
| about.stats | all four numbers (rendered as invented values, not as placeholders) |

## Findings

| # | Area | Finding | Severity | File | Suggested fix |
| --- | --- | --- | --- | --- | --- |
| 1 | Form | Inquiries go nowhere. The API validates, then only `console.log`s the message and returns `{ok:true}`, so the visitor sees "Thank you" and Karen never receives it. | Blocks launch | app/api/contact/route.ts:23 | Send by email (Cloudflare Email Service or Resend over fetch), set the API key and inbox as Worker secrets, return 502 on failure so the existing error state shows. |
| 2 | Content truth | About stat cards show invented numbers: 12 years, 140+ rooms, 9 neighborhoods, 1 in 3 repeat clients. | Blocks launch | content/site.ts (about.stats) | Get the real numbers from Karen, or replace the stat cards with photos and no numbers until she does. |
| 3 | Content truth | "Karen replies personally within two business days" and "I'll be in touch within two business days" promise a response time Karen has not given. | Blocks launch | content/site.ts (contact.text, contact.thanks) | Ask Karen for her commitment, or say "I'll be in touch soon." |
| 4 | Content truth | "works with homeowners across North County and the coast" and "takes on a small number of projects at a time" are not from Karen. | Blocks launch | content/site.ts (about.text) | Replace with Karen's own service area and description, or cut to the founder line. |
| 5 | SEO / deploy | Domain unconfirmed. Canonical, og:url, og:image, sitemap, robots and JSON-LD all point at frescainteriordesign.com, and `NEXT_PUBLIC_SITE_URL` is empty. If the live domain differs, every share card and canonical is wrong. | Blocks launch | content/site.ts:45, lib/site-url.ts, wrangler.jsonc | Confirm the domain, set `NEXT_PUBLIC_SITE_URL` in the build environment (NEXT_PUBLIC values are inlined at build, so the wrangler var alone does nothing). |
| 6 | Legal | No privacy policy page. The form collects name, email and a message, and nothing explains how they are used. | Blocks launch | app/ (no /privacy) | Add a short /privacy page; link it under the submit button and in the footer. |
| 7 | Hero / deploy | Hero film and poster are served from the `r2.dev` dev URL, which Cloudflare rate limits and does not support for production; responses carry no Cache-Control. | Blocks launch | content/media.ts, wrangler.jsonc, .env.example | Attach a custom domain to the R2 bucket, set `NEXT_PUBLIC_MEDIA_BASE` to it, add long cache headers. |
| 8 | Privacy / code | The API logs the full inquiry (name, email, message) with `console.log`, and Workers observability is on, so personal data lands in Cloudflare logs. | Should fix | app/api/contact/route.ts:35 | Log only an id and timestamp, or nothing, once email sending works. |
| 9 | Copy / voice | Voice switches between "I" and "Karen" in the same block: contact intro "Please tell me… Karen replies"; process row 4 title "I'm there…" with body "Karen checks in…"; About text "Karen takes on…"; row 1 "You'll always talk to Karen". CLAUDE.md says first person. | Should fix | content/site.ts (contact, promises, about) | Rewrite each to first person, or keep "Karen" only in the About intro and quote attribution. |
| 10 | Content truth | Process rows, Approach panel text and Approach measurements (42 in, 36 in, 18 in, 30–36 in, 2700 K and the drawing dims) are developer copy presented as Karen's method. | Should fix | content/site.ts (promises.rows, approach), components/ApproachDrawing.tsx | Send to Karen for approval or rewrite; drop measurements she does not use. |
| 11 | Content truth | Taglines ("Interiors that feel fresh.", "A fresh home, considered.", "Plan the space, then make it beautiful.", "Before you call", "Let's talk about your home.") are not from Karen. | Should fix | content/site.ts | Karen approves or replaces. |
| 12 | SEO | JSON-LD areaServed lists Del Mar, Carmel Valley and "North County San Diego", inferred from project locations. | Should fix | app/layout.tsx:71 | Use Karen's stated service area; until then list Solana Beach only. |
| 13 | Images | Two slider photos are upscaled past their source, against CLAUDE.md: cognac-living-room (1200 px wide) shown full-bleed is enlarged about 1.7x at 1440 and 2.6x on a 390 phone at 2x; gloss-kitchen (1448 px) about 1.4x at 1440. | Should fix | content/site.ts (showcase.projects) | Give both the same `fit` treatment as the other small photos, or get larger originals. The cognac photo is already pending Karen. |
| 14 | Images | Duplicate photos on the home page: walnut-guest-bath (PL. 06 and process row 3), subway-tile-secondary-bath (PL. 03 and About card 3), walnut-island-kitchen (hero intro and process row 4). The first-visit intro also reuses cognac-living-room (slider) and navy-chair-great-room (Approach Plan). | Should fix | content/site.ts | Swap the process row 3 and 4 and About card 3 photos for unused ones; trim the intro cycle to photos not shown elsewhere. |
| 15 | Performance | Mobile LCP is 3.2 s (Lighthouse mobile performance 92). Causes: (a) the LCP poster comes cross-origin from r2.dev with no cache headers and a second connection; (b) the intro's first frame (walnut-island-kitchen) is preloaded with high priority and competes with the poster; (c) 177 KB of JS (React, GSAP, ScrollTrigger, Lenis) must run before the intro starts, 21 KB of chunk 255 unused. | Should fix | components/Hero.tsx, app/layout.tsx, content/media.ts | Serve the poster from the site's own domain or the R2 custom domain with caching; only preload the intro frame when the intro will play; lazy-load Lenis. |
| 16 | Performance | The hidden intro frame (251 KB at desktop, 64 KB phone) downloads on every visit, including repeat visits and reduced motion, where it is never shown. Lighthouse lists it as 251 KB of offscreen image. | Should fix | components/Hero.tsx:117 | Render the first cycle frame (and its preload) only when `html.intro` is set. |
| 17 | Performance | Desktop page weight is 3.1 MB (mobile 1.0 MB). Causes: all six full-bleed slides load together when the slider nears view; mosaic-fireplace-family-room is sent at 1920 w (382 KB) and white-oak-ceiling-bedroom at 316 KB; `sizes="100vw"` on `fit` photos that display far narrower. | Should fix | components/ProjectShowcase.tsx | Load slide n+1 only when it is next; give `fit` photos a `sizes` matching their real width. |
| 18 | SEO | The H1 is "Interiors that feel fresh." and says neither what nor where; the first paragraph is the eyebrow "Residential interiors · Solana Beach" with no "interior design". The title has both. | Should fix | content/site.ts (hero) | Keep the visual line, add a visually hidden prefix to the H1 such as "Interior design in Solana Beach:", or make the eyebrow "Interior design · Solana Beach". |
| 19 | SEO | No FAQ schema for the four FAQ items. | Should fix | components/FAQ.tsx, app/layout.tsx | Add a FAQPage JSON-LD block built from `faq.items`. |
| 20 | SEO | JSON-LD is plain `LocalBusiness` with no logo or geo. schema.org has no InteriorDesigner type. | Nice to have | app/layout.tsx:57 | Use `["LocalBusiness","ProfessionalService"]`, add `knowsAbout` (interior design, kitchen design, bathroom design), `logo`, `geo`. |
| 21 | Accessibility | No skip link; the first tab stop is the wordmark. | Should fix | app/layout.tsx, components/Navigation.tsx | Add "Skip to content" linking to `<main id="main">`, visible on focus. |
| 22 | Accessibility | Heading order: the Selected work slider has no H2 (its "(02) Selected work" eyebrow is a span), so the slide title H3 sits under the studio wall's H2; the quote section has no heading. | Should fix | components/ProjectShowcase.tsx | Make the slider eyebrow an H2 (or add a visually hidden one). |
| 23 | Accessibility | FAQ eyebrow "(06) FAQ" fails contrast at 4.48:1 (#6b665c on #e7e4db, 11 px). | Should fix | components/FAQ.tsx, tailwind.config.ts | Darken `muted` slightly on the `ground-2` background. |
| 24 | Accessibility | Touch targets under 44 px: footer nav links 36 px tall, phone and email links 34 px, "View selected work →" 18 px. | Should fix | components/Footer.tsx, components/StudioWall.tsx | Add vertical padding to reach 44 px. |
| 25 | Accessibility | Text under 14 px on phone: plate titles and locations 10 px, section eyebrows 11 px, menu numbers 12 px, "Interior Design" under the wordmark 9 px. Uppercase and tracked, but plate titles carry real content. | Should fix | components/StudioWall.tsx, app/globals.css (.cap) | Raise plate labels and eyebrows to at least 12 px on phone; leave the decorative grid refs. |
| 26 | Accessibility | Decorative dimension labels ("2.5 COL · 4 : 5") are 3.71:1 at 9.5 px. They are aria-hidden, so this is visual only. | Nice to have | app/globals.css (.dim em) | Darken slightly if the design allows. |
| 27 | Accessibility | With motion on, the founder quote words sit at 14% opacity and process numbers in light gray until scrolled past; axe reports 26 contrast failures in those transient states. Reduced motion shows them at full strength. | Nice to have | components/FounderQuote.tsx, components/Promises.tsx | Start the quote at about 35% opacity so it is readable before the scroll effect finishes. |
| 28 | Links | The slider's "View project" button links to #work, the section it is in; the seven plates also link to #work, where most of their projects do not appear. | Should fix | content/site.ts (showcase.projectLink), components/StudioWall.tsx | Remove "View project" until project pages exist; point plates at the contact section or nothing. |
| 29 | Legal | 404 page is Next's default: unbranded, same title as the home page, no main landmark (axe: landmark-one-main, region). | Should fix | app/ (no not-found.tsx) | Add `app/not-found.tsx` with the wordmark, a "Page not found" title and a link home. |
| 30 | Legal | Favicon set is only `icon.svg`. No favicon.ico (404), no 32 px PNG, no 180 px apple-touch-icon, no 192/512 icons, no manifest. | Should fix | app/ | Add `favicon.ico`, `apple-icon.png` (180), `icon.png` (32) and `manifest.ts` with 192 and 512 icons, once the logo is decided. |
| 31 | Legal | Copyright year is hard-coded "© 2026". Correct today, wrong on 1 January. | Nice to have | content/site.ts:56 | Build it from `new Date().getFullYear()`. |
| 32 | Brand | CLAUDE.md brand colors (#F3EFE8, #2A2521, terracotta #B5593A) do not match the site (#F4F2EB, #1D1C1A, navy accent #2B3A55). | Should fix | tailwind.config.ts, CLAUDE.md | Decide which is right; brand is pending, so do not change the site until it is. |
| 33 | Copy | Bath vs bathroom in body copy: meta says "kitchens, bathrooms and whole homes", the wall says "kitchens, baths and whole homes". (Project titles use both, as Karen wrote them.) | Nice to have | content/site.ts (site.description, studio text) | Pick one for running copy. |
| 34 | Copy | Three labels for the same destination: "View selected work →", "View projects", "View project". The eyebrow "(05) About" sits over the heading "About Fresca." | Nice to have | content/site.ts | Use one label; consider "(05) Karen" or drop the eyebrow word. |
| 35 | Copy | Wall paragraph reads "I carry every project from the first walkthrough…"; your agreed wording was "As the principal designer, I carry every project…". | Nice to have | content/site.ts (studio.items) | Apply the agreed sentence. |
| 36 | Copy | No em dashes found in copy, alt text, metadata or build output; no sentence over 30 words; no typos found. | None | | `npm run copy-lint` passes. |
| 37 | Images | Plate alt text repeats the plate title ("Modern Coastal Kitchen") rather than describing the photo; slider ghost frames correctly use empty alt. | Nice to have | components/StudioWall.tsx | Add a short `alt` per plate in content. |
| 38 | Images | Lazy loading and sizing are fine: every image below the fold is `loading="lazy"`, all `next/image` fills sit in aspect-ratio boxes, CLS is 0. All photos are upright. | None | | |
| 39 | Hero | The film is wired: 1080 AV1 webm on desktop, 720 mp4 on phones and slow connections, poster shown first and kept if autoplay is refused; nothing loads under reduced motion or Save-Data. Under reduced motion the intro, Lenis and every GSAP animation are skipped (verified). | None | | |
| 40 | Performance | Fonts are self-hosted by next/font, Latin-subset, four files (74 KB) preloaded, `display: swap`. No render-blocking requests. CLS 0, TBT 100 ms mobile, 30 ms desktop (INP cannot be measured in a lab run; TBT is the proxy). | None | | |
| 41 | Code health | Navigation sets `inert=""` by hand with a "React 18" comment, but the app is on React 19, which logs "Received an empty string for a boolean attribute inert" in development. | Nice to have | components/Navigation.tsx:46 | Use the `inert` prop directly. |
| 42 | Code health | Stale Vercel references: `VERCEL_URL` fallback in site-url and "Set … in Vercel" in the form TODO. The site deploys on Cloudflare. | Nice to have | lib/site-url.ts, app/api/contact/route.ts | Remove the Vercel fallback; update the TODO. |
| 43 | Code health | Env vars: `RESEND_API_KEY` and `CONTACT_TO_EMAIL` are documented but unused; `VERCEL_URL` is read but undocumented. | Nice to have | .env.example, lib/site-url.ts | Align once the form is wired (finding 1). |
| 44 | Code health | Four unused photos in public/images: black-hood-kitchen, hammered-sink-bath, navy-double-vanity, reclaimed-wood-bedroom (about 1.3 MB). No Bodoni, Jost, crest or old preloader references remain. | Nice to have | public/images | Delete, or move to an archive folder outside public/. |
| 45 | Code health | `npm audit`: 1 high (postcss, inside next) and moderates in glob/minimatch via @opennextjs/cloudflare and typescript-eslint. All build-time tooling, nothing shipped to the browser or Worker. `next lint` is deprecated. | Nice to have | package.json | Upgrade with the next Next.js minor; migrate to the ESLint CLI. |
| 46 | Code health | TypeScript passes, lint passes, no console errors or warnings in the production build at any width, no failed requests. | None | | |
| 47 | Deploy | wrangler.jsonc and open-next.config.ts are valid; `opennextjs-cloudflare build` succeeds; `wrangler deploy --dry-run` succeeds (4.9 MB upload, 1.0 MB gzip); `.open-next/` and `.wrangler/` are ignored. Only native package is `sharp`, a devDependency used by image scripts, not bundled. | None | | |
| 48 | Deploy | `next/image` runs through the `IMAGES` binding (Cloudflare Images). Transformations beyond the free allowance are billed and the binding must be enabled on the account. | Should fix | wrangler.jsonc | Confirm Images is enabled on the production account before launch. |

Production environment needed at build time: `NEXT_PUBLIC_SITE_URL` (real domain) and `NEXT_PUBLIC_MEDIA_BASE` (R2 custom domain). At runtime, once the form is wired: the email provider API key and the destination inbox, as Worker secrets.

## Responsive

No horizontal scroll at 390, 768, 1180 or 1440. No measured overlaps between plate photos, plate labels, callout labels, dimension labels and the wall's words and paragraphs. Two things in the captures looked broken but are not: the phone slider showing a doubled, half-filled photo, and the desktop Approach showing an empty grid. Both are mid-animation states from the capture jumping between scroll positions; scrolled normally in a browser, the phone slide fills the card and the Approach panels slide in (checked).

| # | Area | Finding | Severity | File | Suggested fix |
| --- | --- | --- | --- | --- | --- |
| 49 | Responsive | Plate labels squeeze into the photo's width at 1180 and 1440: PL. 06 and PL. 05 wrap one word per line ("GUEST / BATH / WITH / STENCILED / CEILING", "SOLANA / BEACH"), PL. 02 and PL. 03 run to three lines and push the grid ref onto its own row. See 1180-02-2, 1440-02-2. | Should fix | components/StudioWall.tsx:108 | Let the label run wider than narrow photos (min width about 180 px, aligned to the photo's outer edge), or widen PL. 05 and PL. 06. |
| 50 | Responsive | As the studio wall's top passes under the fixed header, "(01) The studio" sits under "Interior Design" and "Index of rooms · 01–07 · 12-col grid" under the header buttons, unreadable (1180-02-1, 1440-02-1). | Should fix | components/StudioWall.tsx (caption) | Push the caption below the header height, or fade it out under the header. |
| 51 | Responsive | Header wordmark and Menu almost disappear over light slider photos (difference blend over a mid-gray wall) at 390, 768 and 1440 (768-03-3, 1440-03-3). | Should fix | components/Navigation.tsx | Give the header a light scrim or switch to solid white while the slider is pinned. |
| 52 | Responsive | Phone hero eyebrow wraps as "RESIDENTIAL INTERIORS ·" / "SOLANA BEACH", leaving the dot dangling (390-01). | Nice to have | content/site.ts (hero.eyebrow) | Put a non-breaking space before "Solana", or drop the dot on phone. |
| 53 | Responsive | Founder quote leaves "here?”" alone on the last line at 390 (390-07). | Nice to have | components/FounderQuote.tsx | `text-wrap: balance` on the blockquote. |
| 54 | Responsive | At 768 the Approach text and drawings sit in a narrow left column with about half the width empty (768-05-2 to 768-05-4). | Nice to have | components/Approach.tsx | Use the desktop two-column panel from 768 up. |
| 55 | Responsive | The "+" registration mark touches the "h" of "A fresh" at 1180 and 1440. | Nice to have | content/site.ts (studio.marks) | Move that mark one row down or left. |
| 56 | Responsive | At the hand-off from the wall to the dark slider the dark panel's left half starts a few pixels lower than the right (1440-02-3), from the slider's opening clip. | Nice to have | components/ProjectShowcase.tsx | Check the starting clip-path inset values on each side. |

## Summary

### Findings by severity

| Severity | Count | Findings |
| --- | --- | --- |
| Blocks launch | 7 | 1 to 7 |
| Should fix | 25 | 8 to 19, 21 to 25, 28 to 30, 32, 48, 49 to 51 |
| Nice to have | 18 | 20, 26, 27, 31, 33 to 35, 37, 41 to 45, 52 to 56 |
| Checked and fine | 6 | 36, 38, 39, 40, 46, 47 |

Lighthouse: mobile performance 92, accessibility 96, best practices 100, SEO 100; desktop 99, 96, 100, 100. Mobile LCP 3.2 s, CLS 0, TBT 100 ms, JS 177 KB, page 1.0 MB. Desktop LCP 0.6 s, CLS 0, TBT 30 ms, JS 177 KB, page 3.1 MB.

### Fix first

1. Wire the inquiry form to Karen's inbox (finding 1), and add the privacy page linked from it (6).
2. Remove or replace every invented claim: the four stats, the two-business-day promise and the service-area line (2, 3, 4).
3. Confirm the production domain and set `NEXT_PUBLIC_SITE_URL` at build (5).
4. Move the hero film and poster to an R2 custom domain with cache headers (7). This also fixes most of the mobile LCP (15).
5. Stop the hidden intro frame downloading on every visit and fix the two upscaled slider photos (16, 13).

### Needs Karen, not code

- Real numbers for the four About stats, or permission to remove them.
- Her response-time commitment for inquiries.
- Her service area and how she describes her workload, for the About text and JSON-LD.
- Approval or rewrites of the process rows, Approach text and measurements, and the taglines.
- Confirmation that the founder quote is her wording.
- Locations for PL. 05 and PL. 07.
- Cognac room: whether her photo replaces ours. Coastal Blue Family Room: title and photo. Approach Plan panel photo.
- The production domain, and which inbox inquiries go to.
- Brand colors, logo and fonts (also needed for the favicon set), and whether the brand colors in CLAUDE.md or on the site are right.
