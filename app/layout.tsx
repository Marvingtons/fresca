import type { Metadata, Viewport } from "next";
import { getImageProps } from "next/image";
import { Hanken_Grotesk, IBM_Plex_Mono, Instrument_Serif } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";
import { heroFilm } from "@/content/media";
import { hero, site } from "@/content/site";
import { INTRO_FRAME, introScript } from "@/lib/intro";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

const serif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-instrument",
});

const sans = Hanken_Grotesk({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-hanken",
});

const mono = IBM_Plex_Mono({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: site.title,
  description: site.description,
  alternates: { canonical: "/" },
  // Temporary set from public/icon.svg (scripts/make-favicons.mjs) until the logo is final.
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: site.name,
    title: site.title,
    description: site.description,
    locale: "en_US",
    images: [site.ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
    images: [site.ogImage.url],
  },
};

// The intro's first frame, preloaded by introScript only when the intro plays.
const { props: introFrame } = getImageProps({ src: hero.cycle[0], alt: "", ...INTRO_FRAME });

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
    <html lang="en" className={`${serif.variable} ${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: introScript(introFrame) }} />
        {/* The hero poster is the LCP image. */}
        <link rel="preload" as="image" href={heroFilm.poster.webp} type="image/webp" fetchPriority="high" />
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
