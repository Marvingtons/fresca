import AboutStack from "@/components/AboutStack";
import Approach from "@/components/Approach";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import FounderQuote from "@/components/FounderQuote";
import Hero from "@/components/Hero";
import Navigation from "@/components/Navigation";
import ProjectShowcase from "@/components/ProjectShowcase";
import Promises from "@/components/Promises";
import StudioWall from "@/components/StudioWall";
import { faq } from "@/content/site";

// FAQ rich results, built from the same items the FAQ section renders.
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.items.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }} />
      <Navigation />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero />
        <StudioWall />
        <ProjectShowcase />
        <Promises />
        <Approach />
        <AboutStack />
        <FounderQuote />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
