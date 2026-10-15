import AboutStack from "@/components/AboutStack";
import Approach from "@/components/Approach";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Navigation from "@/components/Navigation";
import ProjectShowcase from "@/components/ProjectShowcase";
import Promises from "@/components/Promises";
import StudioWall from "@/components/StudioWall";

export default function Home() {
  return (
    <>
      <Navigation />
      <main>
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
