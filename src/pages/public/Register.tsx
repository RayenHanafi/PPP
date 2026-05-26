import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Footer } from "../../components/landing/Footer";
import { RegistrationForm } from "../../components/RegistrationForm";
import { WhatHappensNext } from "../../components/WhatHappensNext";

export function PublicRegister() {
  return (
    <div id="register" className="min-h-screen bg-[#120226] text-white">
      <section className="relative overflow-hidden px-4 pb-16 pt-32 text-center md:px-6 md:pb-24 md:pt-40">
        <div className="absolute inset-0 bg-gradient-to-br from-[#4A3CC9]/[0.05] via-transparent to-[#2A1673]/[0.05] blur-3xl" />

        <div className="relative z-10 mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl lg:text-6xl">
              Become a Contributor
            </h1>

            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-[#B6B6CC] md:text-xl">
              Join organizations already sharing threat intelligence on
              ThreatChain.
            </p>
            <Link
              to="/dashboard"
              className="mt-8 inline-flex rounded-2xl bg-[#4A3CC9] px-6 py-3 font-bold text-white transition duration-300 hover:bg-[#3A2CA9]"
            >
              Back to Dashboard
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <RegistrationForm />
      </section>

      <WhatHappensNext />
      <Footer />
    </div>
  );
}
