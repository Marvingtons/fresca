# Fonts for build scripts

TrueType copies of the site's two display fonts, used only by
`scripts/make-og-image.mjs` to draw the Open Graph image. The site itself loads
its fonts through `next/font` (app/layout.tsx).

- `InstrumentSerif-Italic.ttf`: Instrument Serif, italic 400
- `HankenGrotesk-Medium.ttf`: Hanken Grotesk, 500

Both from Google Fonts, under the SIL Open Font License 1.1. If the brand fonts
change, replace these files and rebuild.
