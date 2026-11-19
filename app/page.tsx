import AboutStack from "@/components/AboutStack";
import Approach from "@/components/Approach";
import type { Metadata } from "next";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Navigation from "@/components/Navigation";
import ProjectShowcase from "@/components/ProjectShowcase";
import Promises from "@/components/Promises";
import StudioWall from "@/components/StudioWall";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({ title: site.title, description: site.description, path: "/" });

export default function Home() {
  return (
    <>
      <Navigation />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero />
        <StudioWall />
        <ProjectShowcase />
        <Promises />
        <Approach />
        <AboutStack />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
