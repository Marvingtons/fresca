/**
 * The site's structured data: one schema.org @graph per page, rendered once in
 * <head> by the @ld parallel route (app/@ld). Every value comes from
 * content/site.ts, so the graph says exactly what the page says.
 *
 * Typed with schema-dts; `npm run check:schema` checks the built pages.
 */
import type {
  City,
  FAQPageLeaf,
  ImageObject,
  LocalBusinessLeaf,
  MergeLeafTypes,
  Place,
  ProfessionalServiceLeaf,
  Question,
  Thing,
  WebPage,
  WebPageLeaf,
  WebSite,
} from "schema-dts";
import { faq, founder, privacy, serviceArea, showcase, site } from "@/content/site";
import { siteUrl } from "@/lib/site-url";

const home = `${siteUrl}/`;
const abs = (path: string) => new URL(path, home).toString();
const slug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

type Business = MergeLeafTypes<[LocalBusinessLeaf, ProfessionalServiceLeaf]>;
type HomePage = MergeLeafTypes<[WebPageLeaf, FAQPageLeaf]>;
/** schema-dts's Graph, widened to allow the two multi-typed nodes. */
export type Graph = { "@context": "https://schema.org"; "@graph": readonly (Thing | Business | HomePage)[] };

export const ids = {
  business: `${home}#business`,
  website: `${home}#website`,
  home: `${home}#webpage`,
  privacy: `${abs(privacy.link.href)}#webpage`,
};

const city = (name: string): City => ({ "@type": "City", name });

function business(): Business {
  return {
    "@type": ["LocalBusiness", "ProfessionalService"],
    "@id": ids.business,
    name: site.legalName,
    alternateName: site.name,
    description: site.description,
    url: home,
    telephone: site.phone.intl,
    email: site.email,
    image: abs(site.ogImage.url),
    // Temporary icon (public/icon.svg) until the logo is final.
    logo: abs("/icon-512.png"),
    // Karen hasn't given a street address, so there is none.
    address: {
      "@type": "PostalAddress",
      addressLocality: "Solana Beach",
      addressRegion: "CA",
      addressCountry: "US",
    },
    areaServed: [...serviceArea.cities.map(city), { "@type": "Place", name: serviceArea.region } satisfies Place],
    knowsAbout: ["Interior design", "Kitchen design", "Bathroom design", "Whole home renovation design", "Space planning"],
    founder: { "@type": "Person", name: founder.name, jobTitle: founder.role },
    sameAs: [site.instagram.href],
    // priceRange and openingHours are left out: Karen hasn't given them.
  };
}

function website(): WebSite {
  return {
    "@type": "WebSite",
    "@id": ids.website,
    url: home,
    name: site.name,
    inLanguage: "en-US",
    publisher: { "@id": ids.business },
  };
}

/** One ImageObject per project in the Selected work slider. */
function projectImages(): ImageObject[] {
  return showcase.projects.map((project) => ({
    "@type": "ImageObject",
    "@id": `${home}#project-${slug(project.title)}`,
    contentUrl: abs(project.image.src),
    name: project.title,
    // Only where Karen gave a city.
    ...(project.city ? { contentLocation: city(project.city) } : {}),
  }));
}

function homePage(images: ImageObject[]): HomePage {
  return {
    "@type": ["WebPage", "FAQPage"],
    "@id": ids.home,
    url: home,
    name: site.title,
    description: site.description,
    inLanguage: "en-US",
    isPartOf: { "@id": ids.website },
    about: { "@id": ids.business },
    image: images.map((image) => ({ "@id": (image as { "@id": string })["@id"] })),
    // The FAQ section's questions and answers, word for word.
    mainEntity: faq.items.map(
      (item): Question => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      }),
    ),
  };
}

function privacyPage(): WebPage {
  return {
    "@type": "WebPage",
    "@id": ids.privacy,
    url: abs(privacy.link.href),
    name: privacy.title,
    description: privacy.description,
    inLanguage: "en-US",
    isPartOf: { "@id": ids.website },
  };
}

const graph = (...nodes: Graph["@graph"]): Graph => ({ "@context": "https://schema.org", "@graph": nodes });

export const homeGraph = () => {
  const images = projectImages();
  return graph(business(), website(), homePage(images), ...images);
};
export const privacyGraph = () => graph(business(), website(), privacyPage());
/** Pages without their own entry (the 404). */
export const siteGraph = () => graph(business(), website());
