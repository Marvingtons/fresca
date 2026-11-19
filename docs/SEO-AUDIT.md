# Fresca SEO and AEO audit

Audit of branch `karen-round1-plates` at `9724cbf`, run 2026-11-18 on a production build (`next build`, `next start` on port 3001) with `NEXT_PUBLIC_SITE_URL=https://frescainteriordesign.com` (still unconfirmed). Nothing was changed for this audit.

How it was checked: source read in full; every page loaded in headless Chromium (Playwright) and its head, headings, links, images and JSON-LD extracted; status codes and redirects with `curl`; Lighthouse 13.6 mobile and desktop on the home page.

Sources: Karen's edits document is not in the repo. As in `docs/SITE-AUDIT.md`, "from Karen" means it arrived in the round 1 commit (`f28e1dd`) or in a message relayed by you.

Severity: **High** (costs rankings or shows wrong information), **Medium** (weakens it), **Low** (polish), **OK** (checked and fine).

## 1. Pages

### / (home)

| Item | Value |
| --- | --- |
| Status | 200 |
| Title | `Fresca Interior Design \| Solana Beach` (37 chars) |
| Meta description | "Beautiful spaces begin with thoughtful planning. Fresca is a residential interior design studio in Solana Beach designing kitchens, bathrooms and whole homes from the floor plan up." (181 chars, cut off in results after about 155) |
| Canonical | `https://frescainteriordesign.com` |
| H1 | "Interior design in Solana Beach: Interiors that feel fresh." (prefix is visually hidden). In the DOM the two lines run together as "Interiors thatfeel fresh." because the line spans have no space between them. |
| Word count | 662 visible words |
| Internal links out | Only in-page anchors (#top, #about, #work, #process, #about-us, #faq, #contact, #main) and /privacy (twice). Plus tel:, mailto:, Instagram. |
| Internal links in | From /privacy (wordmark, "Back to the site") and the 404 page (wordmark, "Back to the home page"). |
| Open Graph | og:type website, og:locale en_US, og:site_name, og:title, og:description (181 chars), og:url, og:image `/images/og-image.jpg` 1200x**629**, og:image:alt |
| Twitter | summary_large_image, title, description, image |
| JSON-LD | Two separate blocks, both in `<body>`: LocalBusiness+ProfessionalService (layout) and FAQPage (page). No @id, no WebSite, no WebPage, no logo. |
| Indexable | Yes (no robots meta, no X-Robots-Tag) |

Heading outline as rendered:

```
H1 Interior design in Solana Beach: Interiors that feel fresh.
  H2 (hidden) A fresh home, considered.          studio wall; its "(01) The studio" eyebrow is a span
  H2 (02) Selected work                          already an H2
    H3 Coastal Blue Family Room                  only the current slide title is in the DOM
  H2 A thoughtful process, with open ...         "(03) Working with us" eyebrow is a <p>
    H3 x4 process rows
  H2 Plan the space, then make it beautiful.     "(04) Approach" eyebrow is a <p>
    H3 Plan / Design / Light
  H2 About Fresca.                               "(05) About" eyebrow is a <p>
  H2 Before you call                             "(06) FAQ" eyebrow is a <p>; questions are plain spans
  H2 Let's talk about your home.                 "(07) Get in touch" eyebrow is a <p>
```

Plate titles on the studio wall are `<b>` inside a figcaption, not headings.

### /privacy

| Item | Value |
| --- | --- |
| Status | 200 |
| Title | `Privacy \| Fresca Interior Design` (32 chars) |
| Meta description | "How Fresca Interior Design handles the details you send through the inquiry form." (81 chars) |
| Canonical | `https://frescainteriordesign.com/privacy` |
| H1 | "Your details"; H2s: Who collects it, What the form collects, Why, Cookies, Deleting your details |
| Word count | 85 |
| Links out | / (twice), mailto: |
| Links in | Home (form note, footer) |
| Open Graph / Twitter | **Inherited from home**: og:title, og:description and twitter tags are the home page's, and og:url is the home URL |
| JSON-LD | The layout's LocalBusiness block |
| Indexable | Yes |

### 404 (any unknown path, and /404)

| Item | Value |
| --- | --- |
| Status | 404 (checked /404 and /does-not-exist) |
| Title | `Page not found \| Fresca Interior Design` |
| Meta description | The home page's |
| Canonical | **`https://frescainteriordesign.com` (the home page)** |
| Robots | `noindex`, emitted twice (Next adds one, the page adds another) |
| H1 | "Page not found" |
| Word count | 15 |
| Links out | / (twice) |
| Open Graph / Twitter | Inherited from home, og:url is the home URL |
| JSON-LD | The layout's LocalBusiness block |

## 2. Site-wide checks

| Check | Result |
| --- | --- |
| robots.txt | `User-Agent: *` / `Allow: /` and a Sitemap line. No `Disallow: /api/`. No rules for named crawlers; AI crawlers fall under `*`, so all are allowed, but nothing records that as a choice. No mention of llms.txt. |
| sitemap.xml | Two entries, `/` (as `https://frescainteriordesign.com`, no slash) and `/privacy`. `lastmod` is `new Date()` at build, so it changes on every deploy whether or not the page did. Uses `changefreq` and `priority` (Google ignores both). No #anchors. |
| hreflang | None. Correct for a single-language site. `<html lang="en">`. |
| www / apex | Not handled in code or documented. The domain is unconfirmed and not yet on Cloudflare, so neither host redirects today. |
| Trailing slash | Consistent: `/privacy/` returns 308 to `/privacy`. Next uses 308 (permanent), which Google treats like 301. |
| 404 status | Real 404 for unknown paths and /404. |
| llms.txt / llms-full.txt | Missing (404). |
| Image alt coverage | 25 `<img>` on the home page, all have an `alt`. 4 are decorative and correctly empty (intro frames, slider ghosts). The 7 studio wall plates use the plate title as alt ("Modern Coastal Kitchen"), not a description. No image alt names a city, even where Karen gave one. |
| Link text | Good. "View selected work", "Book a consultation", "Privacy", "Back to the home page". No "here" or "click here". Menu links have their number inside the link text ("01Studio" in textContent); screen readers and crawlers read "01 Studio". |
| Structured data | See section 1. Both blocks are in `<body>`; areaServed lists only Solana Beach; no @id graph, WebSite, WebPage, logo or ImageObject. |
| Core Web Vitals (Lighthouse 13.6, lab) | Mobile: performance 90, SEO 100, LCP 3.6 s, CLS 0, TBT 50 ms, FCP 0.9 s, 873 KiB. Desktop: performance 99, SEO 100, LCP 0.8 s, CLS 0, TBT 0 ms, 1,679 KiB. The previous audit run (SITE-AUDIT.md) had mobile LCP 3.2 s. No field data yet (not launched). |
| LCP element | On a first visit with motion allowed (what Lighthouse measures), the LCP element is the **intro frame** (walnut-island-kitchen inside the small intro window), not the hero poster. The poster is preloaded with `fetchpriority=high` and is the LCP on repeat visits and under reduced motion. |
| Fonts | 4 Latin subsets preloaded by next/font, `display: swap`. One render-blocking CSS file (9 KB, about 100 ms on mobile). |

### Keyword placement

| Term | Title | H1 | First paragraph | Any H2 |
| --- | --- | --- | --- | --- |
| interior design | Yes | Yes (hidden prefix) | No ("residential design studio") | No |
| Solana Beach | Yes | Yes (hidden prefix) | Yes | No |
| kitchen | No | No | Yes ("kitchens") | No |
| bath | No | No | Yes ("baths") | No |
| whole home | No | No | Yes ("whole homes") | No |

First paragraph here is the first body paragraph after the hero ("Fresca is a residential design studio in Solana Beach. I design kitchens, baths and whole homes around how you actually live in them."); the hero's own paragraphs are the eyebrow and Karen's tagline.

## 3. Findings

| # | Area | Finding | Severity | Fix group |
| --- | --- | --- | --- | --- |
| 1 | Title | Home title names place and brand but none of the services (kitchen, bath, whole home). | High | A |
| 2 | Description | Home meta description is 181 characters and is cut off in results; it is also reused verbatim on the 404 page. | Medium | A, D |
| 3 | Headings | Section eyebrows ("Working with us", "Approach", "About", "FAQ", "Get in touch", "The studio") are `<p>`/`<span>`, so the H2s are display lines that do not say what the section is ("Before you call", "Let's talk about your home."). | Medium | A |
| 4 | Headings | Studio wall plate titles are not headings. | Low | A |
| 5 | Headings | H1 and display headings lose the space between their lines in textContent ("Interiors thatfeel fresh."). | Low | A |
| 6 | Headings | No H2 contains any target term (interior design, Solana Beach, kitchen, bath, whole home). Fixing it needs new heading wording, not just markup. | Medium | Needs Karen |
| 7 | Local | No visible service area anywhere on the page. | Medium | A |
| 8 | Structured data | Two JSON-LD blocks in `<body>` with no @id links between them; no WebSite or WebPage; no logo; areaServed only Solana Beach; description is the long meta description. | Medium | B |
| 9 | Structured data | Project photos carry no structured data (name, location). | Low | B |
| 10 | Crawl | robots.txt has no `Disallow: /api/`, no explicit AI crawler policy, no pointer to llms.txt. | Medium | C |
| 11 | Crawl | sitemap lastmod is the build time, so it is wrong after any deploy that did not touch the page; priority and changefreq are noise. | Medium | C |
| 12 | AEO | No llms.txt or llms-full.txt. | Medium | C |
| 13 | Crawl | No www/apex redirect, in code or in the deploy notes. | High at launch | C |
| 14 | Sharing | og:image is 1200x629, not 1200x630, and is a plain photo with no name on it. | Low | D |
| 15 | Sharing | /privacy and the 404 inherit the home page's og:title, og:description and og:url, so a shared privacy link previews as the home page. | Medium | D |
| 16 | Canonical | The 404 page's canonical points at the home page. | Medium | D |
| 17 | Robots | 404 emits `noindex` twice. | Low | D |
| 18 | AEO | Nothing on the page states in one place what Fresca is, who runs it, where, and what it does; the facts are spread across the hero, wall paragraph, quote caption and footer. | High | E |
| 19 | NAP | Phone and email appear in the footer bar and the menu, identically (858.750.0665, frescainteriordesign@gmail.com); the business location is not in the footer. JSON-LD uses +1-858-750-0665. | Low | E |
| 20 | AEO | FAQ questions are phrased as site headings ("How is a project priced?") rather than as people ask them. | Low | E |
| 21 | Images | Plate alt text repeats the title; no alt names a city. | Medium | E |
| 22 | Performance | On first visits the intro frame, not the poster, is the LCP element; mobile lab LCP is 3.6 s. | Medium | F (report only) |
| 23 | Content truth | Two lines in the contact section are developer draft, not Karen's: "Karen replies personally within two business days" and the thank-you message. Already open in SITE-AUDIT.md (finding 3). | High (not SEO) | Needs Karen |
| 24 | OK | hreflang absent, lang="en", trailing slash consistent, 404 is a real 404, no "click here" links, CLS 0, fonts preloaded with swap, home page under 1 MB on mobile. | OK | |
