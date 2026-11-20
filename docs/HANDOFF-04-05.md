# Handoff: sections 04 and 05, reveal system

Branch `sections-04-05`, cut from `karen-round1-plates` at `2390e17`. Not merged.
Screenshots are in `.review/sections-04-05/`.

## Files changed

| File | What changed |
| --- | --- |
| `components/Reveal.tsx` | New. The shared text reveal (lines, fade, rule). |
| `components/BodyCta.tsx` | New. The body call to action. |
| `components/Approach.tsx` | Rebuilt: three beats, cards without photos, quiet ruler. |
| `components/AboutStack.tsx` | Rebuilt: 12-column layout, portrait slot, quote below. Now a server component. |
| `components/FAQ.tsx` | Eyebrow, heading and question rows use `Reveal`. |
| `components/Footer.tsx` | (07) eyebrow, heading and intro use `Reveal`. `revealLines` and `Line` removed here. |
| `app/globals.css` | Approach block rewritten in place. Three new blocks appended at the end: reveal system, body CTA, About quote. Nothing else touched. |
| `content/site.ts` | `about.portrait` added. `board` removed from the three approach panels. `photo` kept (unused, for the TODO slot). |
| `content/placeholders.ts` | `[PLACEHOLDER: About portrait of Karen, 4:5]` added. The navy-chair entry reworded, since that photo is not shown now. |

Not touched: header and menu, hero, plate wall, slider, process rows, image pipeline, `content/media.ts`, `docs/PERF.md`, `tailwind.config.ts`, `app/layout.tsx`, `lib/*`.

## Reveal: the variants and how to apply them

```tsx
import Reveal from "./Reveal";

// Headings. Split where the text really wraps, re-split on resize.
<Reveal as="p" variant="lines" className="font-serif ...">
  {heading[0]} <br />
  <em>{heading[1]}</em>
</Reveal>

// Headings whose breaks are fixed and always fit: masks are rendered on the server.
<Reveal as="p" variant="lines" lines={[heading[0], <em key="2">{heading[1]}</em>]} />

// Paragraphs, captions, labels.
<Reveal as="p" variant="fade">...</Reveal>

// A group: either number the items...
<Reveal as="p" variant="fade" index={0}>...</Reveal>
<Reveal as="p" variant="fade" index={1}>...</Reveal>
// ...or let one wrapper stagger its direct children.
<Reveal variant="fade" stagger><p>...</p><p>...</p></Reveal>

// Hairlines. Colour comes from the text colour.
<Reveal variant="rule" className="text-ground/20" />
```

| Variant | Motion | Timing |
| --- | --- | --- |
| `lines` | each line in an overflow mask, translateY 100% to 0, opacity 0 to 1 | 900ms, 80ms between lines |
| `fade` | opacity 0 to 1, translateY 12px to 0 | 600ms, 60ms per `index` step or per staggered child |
| `rule` | scaleX 0 to 1 from the left | 800ms |

All three use `cubic-bezier(.2,.6,.2,1)`. Timings live in `app/globals.css` under "reveal system".

Behaviour:

- Plays once, when the element's top is 20% up the viewport. It never replays.
- Anything already in view on load plays on load. If the intro is running (`html.intro`) it waits for the class to be removed.
- `prefers-reduced-motion`: nothing is split, observed or hidden. Checked: 0 observers created, 0 hidden elements.
- The hidden states sit behind `@media (prefers-reduced-motion: no-preference) and (scripting: enabled)`, so without JavaScript the page is final.
- No layout shift: masks only clip, everything else is transform and opacity.
- `axis="x"` is for content that enters a held section sideways and never moves vertically (the Approach cards). Everything else leaves it alone.
- SplitText (in the gsap package already, no new dependency) is imported on demand, so it is not in the first-load bundle.
- Do not put `text-indent` on an element with `variant="lines"` and expect it to survive: Reveal zeroes it before splitting because it moves the line breaks. Hang the first line with a margin on `.rv-line-mask:first-child > .rv-line`, as `.about-quote` does.
- `as` takes any element, and other props pass through.

## Body CTA

`<BodyCta href={cta.href}>{cta.label}</BodyCta>`. Outfit 400, 13px, 0.2em, uppercase, ink, 1px line 6px under the text, arrow that moves 4px right on hover and focus. Styles are `.body-cta` in `app/globals.css`. Applied in (05) About, the only "Book a consultation" in a section I own.

## Changes wanted in the other session's files

I did not edit any of these.

1. **`components/Promises.tsx` line 53**: the last dark pill that says "Book a consultation". Swap `<a className="pill pill-dark" href={cta.href}>` for `<BodyCta href={cta.href}>{cta.label}</BodyCta>`. After that `.pill-dark` is only used by the 404 page.
2. **`components/Promises.tsx`, `components/StudioWall.tsx`**: headings still use `Line` + `revealLines` (1.2s, power4, 110%, trigger at 88%). Replace with `<Reveal variant="lines">`. Intro paragraphs and row text can take `variant="fade"`; the row hairlines (`border-b border-line`) can become `variant="rule"`.
3. **`components/Hero.tsx` lines 79 and 80**: the headline rises with a 100ms stagger over 1.2s, and `.hero-fade` travels 14px. To match the system: 80ms stagger, 900ms, the shared curve, and 12px. The headline should also start only after the poster has painted (wait for the poster `<img>`'s `load`/`decode()` before adding the reveal), which matters on repeat visits when there is no intro to wait for.
4. **`components/ProjectShowcase.tsx` line 62**: `.sc-fade` moves 24px with a 150ms stagger. Over the 12px limit.
5. **`components/StudioWall.tsx` lines 127 and 128**: the column and ruler labels fade in with their own 40ms and 30ms staggers. Within the 12px limit, but not the shared timing.
6. **Cleanup once 2 and 3 are done**: `lib/motion.ts` `revealLines`, `components/LineReveal.tsx` and the `.ln` rules in `globals.css` have no users left and can go.
7. **Margins**: (04) and (05) now use the header's side margin (`px-6 md:px-12`, 24px and 48px). (06), (07) and your sections are still on `--pad` (16 to 32px), so the left edges differ by 16px at 1440. Worth settling on one site-wide.
8. **Breakpoints**: the brief's 1024 and 768 are not in `tailwind.config.ts` (only `sm` 640 and `md` 861). I used `min-[1024px]:` and plain media queries rather than add screens to a shared config.
9. **`docs/PERF.md`**: if it lists bundles, note the on-demand SplitText chunk. Lighthouse on this branch's production build: desktop performance 99, CLS 0, LCP 0.9s; mobile performance 83, CLS 0, LCP 4.7s. I did not measure the base branch, so I cannot say whether the mobile LCP moved. Nothing in this branch touches the hero.

## Left as they are, for a decision

- **Footer wordmark** (`Footer.tsx`): the giant "Fresca" still rises about 36% of its height on scroll. That breaks "nothing moves more than 12px", but it is a scrubbed parallax, not a text reveal, so I left it and am flagging it.
- **Other pills**: the form's "Send inquiry" button and the 404's "Back to the home page" are still pills. The brief only named "Book a consultation".
- **Terracotta on navy**: the card numbers and the dimension lines are #B5593A on #2B3A55, about 2.4:1. Fine for the drawing lines; low for the 20px numbers. CLAUDE.md also reserves terracotta for placeholders until the palette is confirmed, so this is the first other use.
- **Ruler numbers at bone 25%** are close to invisible by design. Say if they should come up a step.
- **Docked headline on phones** is 20px, not 28px: one line at 28px does not fit in 390px.
- **Portrait stand-in** is 1200px wide. At 1440 the slot is 660px, so it is slightly soft on a 2x screen. It shows the terracotta placeholder marker under it.
- **Playhead**: the gold triangle and feet-and-inches readout that sat on the old ruler are gone. They were the loudest part of it.

## Checks

- Build passes. Copy-lint: 0 errors (16 service-area warnings, all existing). ESLint: clean when run with this branch's config.
- `npm run lint` itself fails inside this worktree only, because the worktree sits inside the main checkout and ESLint finds both `.eslintrc.json` files. Run from a normal checkout it is not affected.
- Layout shift, full-page scroll on the production build at 1440 and 390: 0 for the whole page, 0 on (04), 0 on (05).
- (04) holds with CSS `position: sticky` in a section whose height is set in CSS, not with a ScrollTrigger pin. The pin version registered a layout shift each time it engaged and released.
- Letter and word split animation: none left. The About quote's word stagger is removed. Remaining `stagger` uses are line or element staggers in files listed above.
