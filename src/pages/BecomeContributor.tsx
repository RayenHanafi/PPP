import { motion } from "framer-motion";
import { Navbar } from "../components/Navbar";
import { RegistrationForm } from "../components/RegistrationForm";
import { WhatHappensNext } from "../components/WhatHappensNext";
import { Footer } from "../components/landing/Footer";

export function BecomeContributor() {
  return (
    <div className="min-h-screen bg-[#120226] text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 px-4 md:px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#4A3CC9]/[0.05] via-transparent to-[#2A1673]/[0.05] blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Become a Contributor
            </h1>

            <p className="text-lg md:text-xl text-[#B6B6CC] max-w-2xl mx-auto leading-relaxed">
              Join organizations already sharing threat intelligence on ThreatChain. 
              Request your API key to start contributing.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Registration Form Section */}
      <section className="py-12 md:py-16">
        <RegistrationForm />
      </section>

      {/* What Happens Next Section */}
      <WhatHappensNext />

      {/* Footer */}
      <Footer />
    </div>
  );
}
