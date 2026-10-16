import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk, IBM_Plex_Mono, Instrument_Serif } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";
import { site } from "@/content/site";
import { introScript } from "@/lib/intro";
import { heroMedia } from "@/lib/media/hero";
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
  icons: {
    icon: [
      { url: "/brand/favicon.ico", sizes: "any" },
      { url: "/brand/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/brand/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/brand/site.webmanifest",
  openGraph: {
    type: "website",
    url: "/",
    siteName: site.name,
    title: site.share.title,
    description: site.share.description,
    locale: "en_US",
    images: [site.ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: site.share.title,
    description: site.share.description,
    images: [site.ogImage.url],
  },
};

export const viewport: Viewport = {
  themeColor: "#F3EFE8",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // `intro` may be added to <html> before hydration by introScript.
    <html lang="en" className={`${serif.variable} ${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
        {/* The hero poster is the first painted frame. */}
        <link rel="preload" as="image" href={heroMedia.posterWebp} type="image/webp" fetchPriority="high" />
      </head>
      <body>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
