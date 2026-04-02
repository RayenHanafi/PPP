import { motion } from "framer-motion";
import { ClipboardCheck, Key, Upload } from "lucide-react";

const steps = [
  {
    icon: ClipboardCheck,
    title: "Review (24-48h)",
    description:
      "Our team reviews your application and verifies your organization's legitimacy",
  },
  {
    icon: Key,
    title: "Approval & API Key",
    description: "Once approved, you'll receive your unique API key via email",
  },
  {
    icon: Upload,
    title: "Start Contributing",
    description:
      "Use your API key to start submitting IOCs, threat actors, and malware samples",
  },
];

export function WhatHappensNext() {
  return (
    <section className="py-20 md:py-32 bg-[#120226] px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            What Happens Next?
          </h2>
          <p className="text-lg text-[#B6B6CC] max-w-2xl mx-auto">
            Here's what to expect after submitting your registration
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="bg-[#100A36] border border-[#2A1673]/30 rounded-xl p-8 
                hover:-translate-y-2 transition-transform duration-300"
            >
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-lg bg-[#2A1673]/20 mb-6">
                <step.icon size={32} className="text-[#A789D6]" />
              </div>

              <h3 className="text-2xl font-semibold text-white mb-4">
                {step.title}
              </h3>

              <p className="text-[#B6B6CC] leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
