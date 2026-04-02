import { Navbar } from "../components/Navbar";
import { HeroGeometric } from "../components/landing/Hero";
import { Features } from "../components/landing/Features";
import { HowItWorks } from "../components/landing/HowItWorks";
import { Statistics } from "../components/landing/Statistics";
import { CTA } from "../components/landing/CTA";
import { Footer } from "../components/landing/Footer";

export function Landing() {
  return (
    <main className="min-h-screen bg-[#120226] text-white overflow-x-hidden font-sans">
      <Navbar />
      <HeroGeometric
        badge="Blockchain-Powered Security Intelligence"
        title1="ThreatChain"
        title2="Collaborative Threat Intelligence"
      />
      <Features />
      <HowItWorks />
      <Statistics />
      <CTA />
      <Footer />
    </main>
  );
}
