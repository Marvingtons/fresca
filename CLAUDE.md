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
- Location is Solana Beach. "San Diego" and "North County" only in service-area phrasing.

## Brand
- Ivory #F3EFE8, ink #2A2521, terracotta #B5593A as the only accent.
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
