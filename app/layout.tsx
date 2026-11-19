import type { Metadata, Viewport } from "next";
import { getImageProps } from "next/image";
import { Hanken_Grotesk, IBM_Plex_Mono, Instrument_Serif } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";
import { heroFilm } from "@/content/media";
import { founder, hero, site } from "@/content/site";
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

// Structured data for search engines (schema.org LocalBusiness).
const jsonLd = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "ProfessionalService"],
  name: site.legalName,
  legalName: site.legalName,
  description: site.description,
  url: siteUrl,
  image: new URL(site.ogImage.url, siteUrl).toString(),
  email: site.email,
  telephone: "+1-858-750-0665",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Solana Beach",
    addressRegion: "CA",
    addressCountry: "US",
  },
  areaServed: ["Solana Beach"],
  knowsAbout: ["Interior design", "Kitchen design", "Bathroom design", "Whole home design"],
  founder: { "@type": "Person", name: founder.name, jobTitle: founder.role },
  sameAs: [site.instagram.href],
};

// The intro's first frame, preloaded by introScript only when the intro plays.
const { props: introFrame } = getImageProps({ src: hero.cycle[0], alt: "", ...INTRO_FRAME });

export const viewport: Viewport = {
  themeColor: "#F4F2EB",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // `intro` may be added to <html> before hydration by introScript.
    <html lang="en" className={`${serif.variable} ${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: introScript(introFrame) }} />
        {/* The hero poster is the LCP image. */}
        <link rel="preload" as="image" href={heroFilm.poster.webp} type="image/webp" fetchPriority="high" />
      </head>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
