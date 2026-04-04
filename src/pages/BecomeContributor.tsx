import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { RegistrationForm } from "../components/RegistrationForm";
import { WhatHappensNext } from "../components/WhatHappensNext";
import { Footer } from "../components/landing/Footer";

export function BecomeContributor() {
  return (
    <div
      id="become-contributor"
      className="min-h-screen bg-[#120226] text-white"
    >
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
              Join organizations already sharing threat intelligence on
              ThreatChain.
            </p>
            <button className="mt-8 bg-[#4A3CC9] hover:bg-[#3A2CA9] text-white font-bold py-3 px-6 rounded-2xl transition duration-300">
              <Link to="/">Back to Home</Link>
            </button>
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
