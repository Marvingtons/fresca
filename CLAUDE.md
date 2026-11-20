# Fresca site rules

## Content
- Facts about the studio come only from Karen's edits document and her messages.
- Never invent names, places, dates, stats or client details.
- Unknown content goes in content/placeholders.ts as [PLACEHOLDER: ...], rendered in terracotta.

## Voice
- First person, Karen speaking.
- No "we", "our", "one designer".
- Section names like "The studio" and "Working with us" are fine.
- No em dashes anywhere in copy, alt text or metadata. The copy-lint script enforces it.
- `npm run copy-lint` checks source copy, and the rendered HTML when a build exists. New approved "we"/"us" phrases go in its ALLOWED list.
- Location is Solana Beach. "San Diego" and "North County" only in service-area phrasing.

## Brand
- Current site values (tailwind.config.ts): ground #F4F2EB, ink #1D1C1A, accent #2B3A55 (navy).
- Target brand palette is pending (proposed: ivory #F3EFE8, ink #2A2521, terracotta #B5593A). Don't switch until it's confirmed.
- Terracotta #B5593A is used today only for [PLACEHOLDER: ...] markers.
- Fonts and logo are being decided. Don't change them without being asked.

## Photos
- Never upscale past the source.
- Karen's phone photos stay out of the hero.

## Build and deploy
- Mobile first. Check 390 and 1440 before reporting done.
- Deploys on Cloudflare Workers via OpenNext.
- No packages that need native binaries.

## Definition of done
- Build, lint and copy-lint pass.
- Grep report for "San Diego", "we ", "our ", em dashes.
- Screenshots shown.
