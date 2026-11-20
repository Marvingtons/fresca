# Performance audit (Part 2)

Branch `karen-round1-plates`. All numbers come from the production build served by the OpenNext preview (`npm run preview`, `http://localhost:8787`, Workers runtime via wrangler). They were measured on 20 November 2026 with Lighthouse 13.6.0 in headless Chrome. Each Lighthouse figure is the median of three runs: mobile uses the default (Moto G Power, slow 4G, 4x CPU, simulated), desktop uses `--preset=desktop`. Lighthouse loads the page fresh each time, so it always sees the opening intro.

The scripts that produced these numbers are kept outside the repo; the method is described with each table.

## Summary

| Mobile | Target | Before | After | |
|---|---|---|---|---|
| Performance | 95+ | 89 | 92 | **missed**, see "LCP" below |
| LCP (simulated) | under 2.0 s | 3.83 s | 3.38 s | **missed** (real paint at about 0.1 s) |
| CLS | 0 | 0 | 0 | met |
| TBT | under 150 ms | 16 ms | 22 ms | met |
| First view at 390, film excluded | under 1.2 MB | 864 KB | 1083 KB | met |
| Home First Load JS | under 120 KB gz | 176 KB | 119 KB | met |
| Accessibility / Best practices / SEO | 100 / 100 / 100 | 96 / 100 / 100 | 100 / 100 / 100 | met |
| axe serious or critical (home, 390 and 1440) | 0 | 20 (contrast) | 0 | met |
| `npm run check:schema` | passes | passes | passes | met |
| Third-party origins | media domain only | r2.dev only | r2.dev only | met (see note) |

Desktop: performance 99 before and after (100 on one group), LCP 1.02 s to 0.90 s.

## Lighthouse, per fix group

Medians of three runs. INP needs a real interaction, so Lighthouse navigation runs report TBT instead.

**Mobile**

| Group | Commit | Score | LCP | FCP | TBT | CLS | Speed Index | TTFB | Total KB | JS KB | Image KB | Font KB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Baseline | `c10ffcc` | 89 | 3828 | 917 | 16 | 0 | 1642 | 19 | 748 | 176 | 388 | 152 |
| (a) Images | `6607318` | 87 | 4090 | 918 | 18 | 0 | 1491 | 22 | 838 | 177 | 478 | 152 |
| (b) Fonts | `21735a1` | 91 | 3542 | 917 | 30 | 0 | 1495 | 22 | 763 | 177 | 478 | 78 |
| (c) JS | `8853770` | 92 | 3368 | 919 | 20 | 0 | 1563 | 32 | 767 | 171 | 478 | 78 |
| (d) CSS: inlined stylesheet, tried and reverted | none | 91 | 3507 | 951 | 19 | 0 | 1693 | 37 | 775 | 171 | 478 | 78 |
| (e) Headers | `963dda4` | 92 | 3435 | 918 | 18 | 0 | 1614 | 27 | 768 | 171 | 478 | 78 |
| (f) Motion and contrast | `1355522` | 92 | 3343 | 915 | 17 | 0 | 1509 | 27 | 768 | 171 | 478 | 78 |
| React Doctor fixes (final) | `944aad1` | 92 | 3378 | 922 | 22 | 0 | 1582 | 32 | 768 | 171 | 478 | 78 |

**Desktop**

| Group | Commit | Score | LCP | FCP | TBT | CLS | Speed Index | Total KB | JS KB | Image KB |
|---|---|---|---|---|---|---|---|---|---|---|
| Baseline | `c10ffcc` | 99 | 1024 | 256 | 0 | 0 | 435 | 1448 | 176 | 1088 |
| (a) Images | `6607318` | 99 | 985 | 257 | 0 | 0 | 486 | 1447 | 177 | 1087 |
| (b) Fonts | `21735a1` | 99 | 931 | 253 | 0 | 0 | 391 | 1372 | 177 | 1087 |
| (c) JS | `8853770` | 100 | 798 | 259 | 0 | 0 | 493 | 1376 | 171 | 1087 |
| (e) Headers | `963dda4` | 99 | 832 | 256 | 0 | 0 | 485 | 1377 | 171 | 1087 |
| (f) Motion and contrast | `1355522` | 99 | 854 | 257 | 0 | 0 | 475 | 1377 | 171 | 1087 |
| Final | `944aad1` | 99 | 898 | 258 | 0 | 0 | 435 | 1377 | 171 | 1087 |

Image KB rises after (a) on purpose: the photos in cropped boxes now load files that are sharp after the crop (see Images).

## LCP: why mobile stops at 92

On a first visit the intro plays, so the LCP element is the intro's first frame (`walnut-island-kitchen`, preloaded, `fetchpriority=high`, AVIF 38 KB at Lighthouse's size). In the trace it paints at **about 0.1 s**: TTFB 32 ms, load delay 37 ms, load 10 ms, render delay 27 ms.

The 3.4 s is Lighthouse's simulation. It replays the page on slow 4G and charges the LCP for every request that started before that 0.1 s paint, needed or not. On mobile those are:

- the document, CSS, three font files and the framework JS (none can go)
- the hero poster (77 KB), which is not shown until about 1.3 s into the intro
- six plate-wall photos below the fold (about 250 KB). They are `loading=lazy`, but sit within Chrome's lazy-load margin of the first screen.

Removing the last two from the first 100 ms would be the next step. Each option changes behaviour, so I have not done either:

1. Hold the plate photos until the intro ends. That means rendering their `<img>` from the client: no photo in the HTML, a loss for no-JS visitors and crawlers.
2. Hide the poster during the intro and make it lazy. The poster then counts as a lazy LCP image on repeat visits, which Lighthouse flags.

Tried and rejected: inlining the stylesheet into the HTML (`experimental.inlineCss`). It made FCP and LCP slightly worse (row (d)), so it was reverted.

## Bundles

`ANALYZE=true npm run build` writes `.next/analyze/client.json` (`@next/bundle-analyzer`, now a dev dependency).

| Route | Before: size / First Load JS | After |
|---|---|---|
| `/` | 19.6 kB / 176 kB | 12.7 kB / 119 kB |
| `/privacy` | 164 B / 106 kB | 164 B / 106 kB |
| Shared by all | 103 kB | 103 kB |

**Ten largest modules, before (gzip).** The first one, the framework chunk, is Pages Router only and not loaded by these App Router pages.

| KB | Chunk | Module | Loaded |
|---|---|---|---|
| 62.3 | framework | react-dom (Pages Router copy) | never |
| 52.9 | 4bd1b696 | react-dom client | first load |
| 19.2 | c15bf2b0 | gsap-core | first load |
| 13.8 | 802 | gsap/ScrollTrigger | first load |
| 7.7 | 802 | gsap CSSPlugin | first load |
| 7.5 | 255 | react-server-dom-webpack client | first load |
| 7.3 | main | next router (Pages) | never |
| 6.8 | 161 | zod schemas | when the contact form is focused |
| 5.2 | 802 | lenis | first load |
| 4.5 | app/page | content/site.ts | first load |

**After.** GSAP (19.3 + 13.8 + 7.9 KB), ScrollTrigger's Observer (3.2 KB) and Lenis (5.2 KB) are now async chunks. They load after hydration and are counted in no First Load JS. `content/site.ts` in the page chunk dropped from 4.5 to 2.1 KB, because the static sections render on the server. The remaining first-load modules are React and Next's runtime.

Two items Lighthouse still reports, both inside Next's own shared chunk and not fixable from this project: 21 KB of unused JS, and 12 KB of legacy polyfills.

## Fonts

next/font, self-hosted, latin subset, `display: swap`, all preloaded. No font file is render-blocking (swap), and the only render-blocking request is the stylesheet (9 KB).

| Before | Weight / style | File | KB |
|---|---|---|---|
| Instrument Serif | 400 | e6099e24... | 15 |
| Instrument Serif | 400 italic | 9cc5b37a... | 15 |
| Hanken Grotesk | 400, 500, 600 (variable) | 313510e2... | 34 |
| IBM Plex Mono | 400 | cdec7fa3... | 10 |
| Cormorant Garamond | 500 | f2b90c69... | 23 |
| Cormorant Garamond | 500 italic | 920470eb... | 24 |
| Outfit | 300, 400 (variable) | 7b0b24f3... | 32 |
| **Total** | 7 files | | **152** |

After: Cormorant Garamond 500 roman and italic, and Outfit 300/400, in three files totalling **78 KB**. The `serif` role now maps to Cormorant Garamond, and `sans` and `mono` to Outfit (`app/globals.css`). `scripts/make-og-image.mjs` still draws the share image with the Instrument Serif and Hanken TTFs at build time. Those files are not served to visitors.

## Images

Method: fresh Chrome profile with the cache off, first visit (intro plays), then the whole page scrolled and the slider clicked through. One row per URL; the same file asked for twice counts once, because the browser serves the second request from memory cache.

The check is cover-aware: a landscape photo in a portrait box is cropped to the box's height, so it needs `box height x photo aspect` pixels, not the box width. A file is flagged when it is wider than 1.5 times what the box needs.

Changes in (a):

- **Hero poster.** It now has the photo grade. AVIF (78 KB) comes first, with WebP (90 KB) and JPEG as fallbacks, all at 1920x1080 with width and height set. `fetchpriority=high` is on the image. It stays on the site's own origin (`public/media/fresca-hero-poster-v2.*`): no extra connection before first paint.
- **LCP preload follows the intro.** The `<head>` script preloads the intro's first frame when the intro plays, and the poster (AVIF) when it doesn't (repeat visits, reduced motion).
- **Cover-aware `sizes`.** `Photo` takes `box` (the box's aspect) and scales `sizes` so cropped photos get a file that is sharp after the crop. The Approach photos were blurry before at 1440 (a 480 file in a box needing 700). Their `sizes` now also follow the measured layout (`min(36vw, 380px)` and so on).
- **Unchanged.** Every photo is AVIF first with WebP fallback, lazy except the hero, sits in a fixed-aspect box (CLS 0) and has width and height. The slider renders only the current slide and its neighbours. No image loads without being shown: the three intro frames are shown during the intro, then hidden.

No PNG or JPEG is requested where AVIF or WebP exists, and no image is over 250 KB. Only the film is (excluded from the targets).

The "over 1.5x" flags in the 1440 table come from the width ladder (480, 768, 1200, 1600, 2000), seen at a 1x pixel ratio. A 509 px box takes the next step up, the 768 file. On 2x screens, which most 1440-wide laptops are, the same box needs 1018 px and takes 1200. Adding 640 and 960 to the ladder would close the gap at 1x, for about 400 more files in `public/images/`.

### Before (`c10ffcc`)


**390 px** (device pixel ratio 3, whole page scrolled)

| File | Rendered box | File width | Format | KB | Flags |
|---|---|---|---|---|---|
| /media/fresca-hero-poster.webp | 413x895 | 1920 | WEBP | 78 |  |
| /images/g1/walnut-island-kitchen-1200.avif | 0x0 | 1200 | AVIF | 77 | intro frame (hidden after the intro) |
| /images/g1/black-hood-kitchen-island-768.avif | 229x206 | 768 | AVIF | 27 |  |
| /images/g1/blush-guest-bedroom-768.avif | 179x286 | 768 | AVIF | 52 |  |
| /images/g1/subway-tile-secondary-bath-768.avif | 229x367 | 768 | AVIF | 50 |  |
| /images/g1/sectional-living-room-1200.avif | 0x0 | 1200 | AVIF | 83 | intro frame (hidden after the intro) |
| /images/g1/iron-bed-bedroom-1200.avif | 0x0 | 1200 | AVIF | 138 | intro frame (hidden after the intro) |
| /fresca-hero-720.mp4 (film, pub-364f647b29874b09922e1889f267c323.r2.dev) | full screen | | MP4 | 1514 | over 250 KB (film, excluded from targets) |
| /images/g1/two-story-living-room-768.avif | 179x286 | 768 | AVIF | 82 |  |
| /images/g1/lantern-pendant-kitchen-wide-768.avif | 229x206 | 768 | AVIF | 41 |  |
| /images/g1/stenciled-ceiling-guest-bath-768.avif | 179x286 | 768 | AVIF | 48 |  |
| /images/g1/bay-window-dining-768.avif | 229x367 | 768 | AVIF | 55 |  |
| /images/g1/mosaic-fireplace-family-room-1200.avif | 358x269 | 1200 | AVIF | 100 |  |
| /images/g1/cognac-linen-living-room-wide-1200.avif | 358x269 | 1200 | AVIF | 128 |  |
| /images/g1/linen-coastal-bedroom-1072.avif | 358x269 | 1072 | AVIF | 141 |  |
| /images/g1/freestanding-tub-bath-1200.avif | 358x224 | 1200 | AVIF | 62 |  |
| /images/g1/black-hex-shower-1200.avif | 358x224 | 1200 | AVIF | 87 |  |
| /images/g1/bay-window-sitting-room-1200.avif | 358x224 | 1200 | AVIF | 63 |  |
| /images/g1/navy-chair-great-room-1200.avif | 258x322 | 1200 | AVIF | 72 |  |
| /images/g1/color-floor-plan-768.avif | 200x125 | 768 | AVIF | 14 |  |
| /images/g1/blue-gray-island-kitchen-1200.avif | 258x322 | 1200 | AVIF | 71 |  |
| /images/g1/kitchen-material-board-768.avif | 200x125 | 768 | AVIF | 26 |  |
| /images/g1/glass-pendants-crop-960.avif | 258x322 | 960 | AVIF | 60 |  |
| /images/g1/lighting-ceiling-plan-768.avif | 200x125 | 768 | AVIF | 14 |  |

Total 3083 KB including the film.

**1440 px** (device pixel ratio 1, whole page scrolled)

| File | Rendered box | File width | Format | KB | Flags |
|---|---|---|---|---|---|
| /media/fresca-hero-poster.webp | 1526x954 | 1920 | WEBP | 78 |  |
| /images/g1/walnut-island-kitchen-1600.avif | 0x0 | 1600 | AVIF | 133 | intro frame (hidden after the intro) |
| /images/g1/black-hood-kitchen-island-480.avif | 289x260 | 480 | AVIF | 14 |  |
| /images/g1/two-story-living-room-480.avif | 344x551 | 480 | AVIF | 37 |  |
| /images/g1/subway-tile-secondary-bath-480.avif | 206x330 | 480 | AVIF | 22 | over 1.5x (needs 247) |
| /images/g1/blush-guest-bedroom-480.avif | 179x286 | 480 | AVIF | 24 | over 1.5x (needs 214) |
| /images/g1/sectional-living-room-1600.avif | 0x0 | 1600 | AVIF | 129 | intro frame (hidden after the intro) |
| /images/g1/iron-bed-bedroom-1600.avif | 0x0 | 1600 | AVIF | 216 | intro frame (hidden after the intro) |
| /fresca-hero-1080.webm (film, pub-364f647b29874b09922e1889f267c323.r2.dev) | full screen | | WEBM | 1597 | over 250 KB (film, excluded from targets) |
| /images/g1/lantern-pendant-kitchen-wide-480.avif | 179x161 | 480 | AVIF | 19 | over 1.5x (needs 215) |
| /images/g1/stenciled-ceiling-guest-bath-480.avif | 151x242 | 480 | AVIF | 22 | over 1.5x (needs 182) |
| /images/g1/bay-window-dining-480.avif | 234x374 | 480 | AVIF | 26 | over 1.5x (needs 279) |
| /images/g1/mosaic-fireplace-family-room-1200.avif | 795x596 | 1200 | AVIF | 100 | over 1.5x (needs 798) |
| /images/g1/cognac-linen-living-room-wide-1200.avif | 795x596 | 1200 | AVIF | 128 | over 1.5x (needs 795) |
| /images/g1/linen-coastal-bedroom-1072.avif | 795x596 | 1072 | AVIF | 141 |  |
| /images/g1/freestanding-tub-bath-768.avif | 509x318 | 768 | AVIF | 30 | over 1.5x (needs 509) |
| /images/g1/black-hex-shower-768.avif | 509x318 | 768 | AVIF | 43 | over 1.5x (needs 509) |
| /images/g1/bay-window-sitting-room-768.avif | 509x318 | 768 | AVIF | 31 | over 1.5x (needs 509) |
| /images/g1/navy-chair-great-room-480.avif | 377x471 | 480 | AVIF | 17 |  |
| /images/g1/glass-pendants-crop-480.avif | 377x471 | 480 | AVIF | 20 |  |
| /images/g1/blue-gray-island-kitchen-480.avif | 377x471 | 480 | AVIF | 17 |  |
| /images/g1/color-floor-plan-480.avif | 293x183 | 480 | AVIF | 7 | over 1.5x (needs 317) |
| /images/g1/kitchen-material-board-480.avif | 293x183 | 480 | AVIF | 13 | over 1.5x (needs 301) |
| /images/g1/lighting-ceiling-plan-480.avif | 293x183 | 480 | AVIF | 7 | over 1.5x (needs 314) |

Total 2871 KB including the film.

### After (`944aad1`)


**390 px** (device pixel ratio 3, whole page scrolled)

| File | Rendered box | File width | Format | KB | Flags |
|---|---|---|---|---|---|
| /images/g1/black-hood-kitchen-island-1200.avif | 229x206 | 1200 | AVIF | 51 |  |
| /images/g1/lantern-pendant-kitchen-wide-1200.avif | 229x206 | 1200 | AVIF | 81 |  |
| /images/g1/two-story-living-room-768.avif | 179x286 | 768 | AVIF | 82 |  |
| /images/g1/blush-guest-bedroom-768.avif | 179x286 | 768 | AVIF | 52 |  |
| /images/g1/subway-tile-secondary-bath-1073.avif | 229x367 | 1073 | AVIF | 107 |  |
| /images/g1/stenciled-ceiling-guest-bath-768.avif | 179x286 | 768 | AVIF | 48 |  |
| /media/fresca-hero-poster-v2.avif | 413x895 | 1920 | AVIF | 77 |  |
| /images/g1/walnut-island-kitchen-1200.avif | 0x0 | 1200 | AVIF | 77 | intro frame (hidden after the intro) |
| /images/g1/sectional-living-room-1200.avif | 0x0 | 1200 | AVIF | 83 | intro frame (hidden after the intro) |
| /images/g1/iron-bed-bedroom-1200.avif | 0x0 | 1200 | AVIF | 138 | intro frame (hidden after the intro) |
| /fresca-hero-720.mp4 (film, pub-364f647b29874b09922e1889f267c323.r2.dev) | full screen | | MP4 | 1514 | over 250 KB (film, excluded from targets) |
| /images/g1/bay-window-dining-1200.avif | 229x367 | 1200 | AVIF | 118 |  |
| /images/g1/cognac-linen-living-room-wide-1200.avif | 358x269 | 1200 | AVIF | 128 |  |
| /images/g1/linen-coastal-bedroom-1072.avif | 358x269 | 1072 | AVIF | 141 |  |
| /images/g1/mosaic-fireplace-family-room-1200.avif | 358x269 | 1200 | AVIF | 100 |  |
| /images/g1/freestanding-tub-bath-1200.avif | 358x224 | 1200 | AVIF | 62 |  |
| /images/g1/black-hex-shower-1200.avif | 358x224 | 1200 | AVIF | 87 |  |
| /images/g1/bay-window-sitting-room-1200.avif | 358x224 | 1200 | AVIF | 63 |  |
| /images/g1/navy-chair-great-room-1600.avif | 258x322 | 1600 | AVIF | 120 |  |
| /images/g1/color-floor-plan-768.avif | 200x125 | 768 | AVIF | 14 |  |
| /images/g1/blue-gray-island-kitchen-1600.avif | 258x322 | 1600 | AVIF | 110 |  |
| /images/g1/kitchen-material-board-768.avif | 200x125 | 768 | AVIF | 26 |  |
| /images/g1/lighting-ceiling-plan-768.avif | 200x125 | 768 | AVIF | 14 |  |
| /images/g1/glass-pendants-crop-960.avif | 258x322 | 960 | AVIF | 60 |  |

Total 3353 KB including the film.

**1440 px** (device pixel ratio 1, whole page scrolled)

| File | Rendered box | File width | Format | KB | Flags |
|---|---|---|---|---|---|
| /images/g1/sectional-living-room-1600.avif | 0x0 | 1600 | AVIF | 129 | intro frame (hidden after the intro) |
| /images/g1/iron-bed-bedroom-1600.avif | 0x0 | 1600 | AVIF | 216 | intro frame (hidden after the intro) |
| /images/g1/walnut-island-kitchen-1600.avif | 0x0 | 1600 | AVIF | 133 | intro frame (hidden after the intro) |
| /media/fresca-hero-poster-v2.avif | 1526x954 | 1920 | AVIF | 77 |  |
| /images/g1/black-hood-kitchen-island-480.avif | 289x260 | 480 | AVIF | 14 |  |
| /images/g1/blush-guest-bedroom-480.avif | 179x286 | 480 | AVIF | 24 | over 1.5x (needs 214) |
| /images/g1/subway-tile-secondary-bath-480.avif | 206x330 | 480 | AVIF | 22 | over 1.5x (needs 247) |
| /images/g1/two-story-living-room-480.avif | 344x551 | 480 | AVIF | 37 |  |
| /fresca-hero-1080.webm (film, pub-364f647b29874b09922e1889f267c323.r2.dev) | full screen | | WEBM | 1597 | over 250 KB (film, excluded from targets) |
| /images/g1/lantern-pendant-kitchen-wide-480.avif | 179x161 | 480 | AVIF | 19 | over 1.5x (needs 215) |
| /images/g1/stenciled-ceiling-guest-bath-480.avif | 151x242 | 480 | AVIF | 22 | over 1.5x (needs 182) |
| /images/g1/bay-window-dining-480.avif | 234x374 | 480 | AVIF | 26 | over 1.5x (needs 279) |
| /images/g1/cognac-linen-living-room-wide-1200.avif | 795x596 | 1200 | AVIF | 128 | over 1.5x (needs 795) |
| /images/g1/linen-coastal-bedroom-1072.avif | 795x596 | 1072 | AVIF | 141 |  |
| /images/g1/mosaic-fireplace-family-room-1200.avif | 795x596 | 1200 | AVIF | 100 | over 1.5x (needs 798) |
| /images/g1/freestanding-tub-bath-768.avif | 509x318 | 768 | AVIF | 30 | over 1.5x (needs 509) |
| /images/g1/black-hex-shower-768.avif | 509x318 | 768 | AVIF | 43 | over 1.5x (needs 509) |
| /images/g1/bay-window-sitting-room-768.avif | 509x318 | 768 | AVIF | 31 | over 1.5x (needs 509) |
| /images/g1/navy-chair-great-room-768.avif | 377x471 | 768 | AVIF | 36 |  |
| /images/g1/blue-gray-island-kitchen-768.avif | 377x471 | 768 | AVIF | 36 |  |
| /images/g1/glass-pendants-crop-480.avif | 377x471 | 480 | AVIF | 20 |  |
| /images/g1/color-floor-plan-480.avif | 293x183 | 480 | AVIF | 7 | over 1.5x (needs 317) |
| /images/g1/kitchen-material-board-480.avif | 293x183 | 480 | AVIF | 13 | over 1.5x (needs 301) |
| /images/g1/lighting-ceiling-plan-480.avif | 293x183 | 480 | AVIF | 7 | over 1.5x (needs 314) |

Total 2908 KB including the film.

### First-view transfer

First view means everything requested in the first 6 s of a fresh visit with no scrolling. The intro runs during this time.

| | 390 before | 390 after | 1440 before | 1440 after |
|---|---|---|---|---|
| Total, film excluded | 864 KB | 1083 KB | 1010 KB | 939 KB |
| Images | 505 | 796 | 653 | 652 |
| Fonts | 152 | 78 | 152 | 78 |
| JS (all chunks, including the async GSAP and Lenis) | 176 | 171 | 176 | 171 |
| CSS | 9 | 9 | 9 | 9 |
| HTML | 18 | 28 | 18 | 28 |
| Hero film (excluded) | 1514 (720p mp4) | 1514 | 1597 (1080p webm) | 1597 |

390 is measured at a 3x pixel ratio, the heaviest case. The HTML grew by 10 KB (Brotli) because the static sections are now server components: their markup is in the HTML and in the React payload, instead of in the JS.

## Third-party origins

None besides the media bucket: every request is to the site itself, plus the hero film from `NEXT_PUBLIC_MEDIA_BASE`. In this build that is still the dev `r2.dev` URL (`.env.local`). For production it should be `https://media.frescainteriordesign.com` (`.env.example`, docs/DEPLOY.md step 6). The CSP's `img-src` and `media-src` take that host at build time.

## CSS

Tailwind purge works: one stylesheet, 36 KB raw, **8.5 KB gzipped**. Lighthouse finds no unused-CSS savings. Coverage over a full scroll at 390 and 1440 (menu opened and closed) leaves 10.4 KB raw unused, about 2.5 KB gzipped. All of it is conditional and needed: hover and focus states, reduced-motion overrides, the intro's pre-paint rules (unused once it has played), privacy and 404 page classes, Tailwind's preflight for elements this page lacks, and form error states. No unused global CSS over 5 KB.

## Caching and headers

Checked with `curl -sI` against the preview:

| Path | Cache-Control |
|---|---|
| `/`, `/privacy`, `/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/favicon.ico` | `public, max-age=0, must-revalidate` (revalidate by ETag on every visit, so a deploy shows at once). Before: `s-maxage=31536000` only. |
| `/_next/static/*` (JS, CSS, fonts) | `public, max-age=31536000, immutable`. Before: `max-age=0, must-revalidate`. |
| `/images/*`, `/media/*` | `public, max-age=31536000, immutable` (unchanged) |
| 404 | `private, no-cache, no-store` (Next's default) |

- **Content-Security-Policy** on every page: `default-src 'self'`; script and style `'self' 'unsafe-inline'`; `img-src` and `media-src` add the media origin; `object-src 'none'`; `frame-ancestors 'none'`; `form-action 'self'`; `upgrade-insecure-requests`. `'unsafe-inline'` is needed for the prerendered pages, which have no per-request nonce (Lighthouse notes it).
- **Other headers.** `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` and a `Permissions-Policy` are also set. `x-powered-by` is gone (`poweredByHeader: false`).
- **Brotli** is on for HTML, JS and text routes (`content-encoding: br`). Cloudflare applies it at the edge in production too.

**Cache rule for the media domain**, to add once `media.frescainteriordesign.com` is attached to the R2 bucket. Cloudflare dashboard, the zone, **Caching**, **Cache Rules**, **Create rule**:

- When: hostname equals `media.frescainteriordesign.com`
- Cache eligibility: eligible for cache
- Edge TTL: override origin, 1 year
- Browser TTL: override origin, 1 year

Film files are never overwritten in place (renamed, docs/DEPLOY.md), so a year is safe.

## Motion

- **Animated properties.** GSAP animates `transform` and `opacity` only, with two paint-only exceptions: `clip-path` for the reveal wipes (hero intro window, slider frame and slide wipe, plate unmasking) and `color` on the promise numbers. Nothing animates `top`, `left`, `width`, `height` or margins.
- **Scroll work runs once per frame.** ScrollTrigger and Lenis run on GSAP's single `requestAnimationFrame` ticker. The header's past-the-hero check was a raw scroll listener calling `getBoundingClientRect` on every event; it is now rAF-throttled. Every listener is removed on unmount.
- **Reduced motion.** `prefers-reduced-motion` disables every GSAP timeline (all inside `matchMedia("(prefers-reduced-motion: no-preference)")`) and Lenis (never created). The studio-wall caption fade, which used to run under any setting, is now inside that query too. The intro does not play.
- **The intro cannot hang.** GSAP is now a separate chunk, so if the intro has not started 5 s after the page starts, the inline script removes `html.intro` and the finished hero shows.

## Accessibility

Contrast was the only failure (axe "serious"), in three places:

| Element | Before | After |
|---|---|---|
| Plate captions (PL number, location, note), 11 to 12 px | ink at 55%, 3.71:1 | ink at 65%, 5.05:1 |
| Promise numbers, start of the darken-on-scroll | `#b5afa3`, 1.94:1 | `#8a8478`, 3.32:1 (30 px, large text needs 3:1) |
| About quote words, start of the light-up | opacity 0.14, 1.32:1 | opacity 0.5, 3.20:1 (large text) |

axe-core 4.14.1 on the home page at 390 and 1440, run both after the intro at the top and after scrolling to the bottom: **0 violations** of any impact. Lighthouse accessibility 100.

## React Doctor

`npx react-doctor@0.9.23 . --no-telemetry --no-supply-chain`: 14 findings before, 5 after, all 5 judged false positives.

Fixed (commit `944aad1`):

- **Contact form double submit.** The guard read `status` from state, so a fast double click could post twice. A ref now guards it (three clicks, one POST) and is reset on failure.
- **Ref written during render** (`useMotion` in `lib/gsap.ts`): it is now updated in a layout effect. `useEffectEvent` would be the modern form, but the React build bundled with Next 15 does not export it, and the build failed with it.
- **Effect cleanup** in SmoothScroll: refresh does nothing after unmount, and Lenis's scroll subscription is removed explicitly.
- **Permanent `will-change: clip-path`** on the hero and the slider frame: removed.
- **Menu section lookup** used `querySelector(href)`, which throws on a non-`#` href. It now uses `getElementById`.
- **Hook dependencies.** The `touched` state was only read in handlers; it is now a ref. The Escape handler effect was also flagged; `closeMenu` is a stable `useCallback`, so no change was needed there.
- **Non-component exports.** `photoSrcSet` moved to `lib/photos.ts`, and the Copy helpers are now private.

False positives, left as is:

- **Index keys** on the quote words and the wall items: static lists that never reorder or filter.
- **Unchecked fetch status** in ContactForm: `res.ok` is checked before the body is trusted.
- **State set in a mount effect** in Hero: deliberate. It reads the class the pre-paint script set, and reading it during render would make server and client markup differ.
- **Effect cleanup** in SmoothScroll: the static check cannot follow cleanup assigned inside the async loader. The cleanup is there.

## Screenshots

Production preview, after all fixes: `docs/screens/perf/`. Hero, plate wall, slider, plan panel and Approach at 1440 and 390.
