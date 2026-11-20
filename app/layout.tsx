import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { photoSrcSet } from "@/lib/photos";
import SmoothScroll from "@/components/SmoothScroll";
import { heroFilm } from "@/content/media";
import { hero, site } from "@/content/site";
import { INTRO_SIZES, introScript } from "@/lib/intro";
import { sharing } from "@/lib/metadata";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

// The site's only two families, self-hosted by next/font (latin subset, swap,
// preloaded). Serif headings and the hero: Cormorant Garamond 500.
const cormorant = Cormorant_Garamond({
  weight: "500",
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cormorant",
});

// Body, labels and captions: Outfit 300 and 400.
const outfit = Outfit({
  weight: ["300", "400"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  // Defaults; each page sets its own title, description, canonical and sharing tags
  // with pageMetadata (lib/metadata.ts).
  title: site.title,
  description: site.description,
  // Temporary set from public/icon.svg (scripts/make-favicons.mjs) until the logo is final.
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
  },
  ...sharing,
};

// The intro's first frame (AVIF), preloaded by introScript only when the intro plays.
const introFrame = { srcSet: photoSrcSet(hero.cycle[0], "avif"), sizes: INTRO_SIZES };

export const viewport: Viewport = {
  themeColor: "#F4F2EB",
};

/**
 * `ld` is the @ld parallel route: each page's structured data graph
 * (lib/structured-data.ts), rendered here so it lands in <head> as one block.
 */
export default function RootLayout({ children, ld }: Readonly<{ children: React.ReactNode; ld: React.ReactNode }>) {
  return (
    // `intro` may be added to <html> before hydration by introScript.
    <html lang="en" className={`${cormorant.variable} ${outfit.variable}`} suppressHydrationWarning>
      <head>
        {/* Also preloads the LCP image: the intro's first frame, or the hero poster. */}
        <script dangerouslySetInnerHTML={{ __html: introScript(introFrame, heroFilm.poster.avif) }} />
        {ld}
      </head>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
