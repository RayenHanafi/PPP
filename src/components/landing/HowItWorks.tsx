import { motion } from "framer-motion";
import { UploadCloud, ShieldCheck, Database, Globe } from "lucide-react";

const steps = [
  {
    icon: UploadCloud,
    title: "1. Submit Threats",
    description:
      "Organizations submit IOCs, threat actors, or malware samples via API.",
  },
  {
    icon: ShieldCheck,
    title: "2. Automatic Validation",
    description:
      "Submissions are automatically validated or marked pending for review.",
  },
  {
    icon: Database,
    title: "3. Blockchain Recording",
    description: "Validated IOCs are permanently recorded on the blockchain.",
  },
  {
    icon: Globe,
    title: "4. Share & Explore",
    description:
      "Public dashboard displays threats: IOCs, Threat Actors and Malware.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-[#100A36] relative overflow-hidden px-4 md:px-6">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, #4A3CC9 10%, transparent 60%)",
        }}
      ></div>
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 md:mb-24">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            Simple, Secure, Scalable
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-[#B6B6CC] text-lg md:text-xl max-w-2xl mx-auto"
          >
            A unified pipeline securely transitioning threat data from
            submission to global distribution without compromising data
            integrity.
          </motion.p>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-[120px] left-0 right-0 h-1 bg-gradient-to-r from-[#100A36] via-[#2A1673] to-[#100A36] z-0" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 relative z-10">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                className="flex flex-col items-center text-center relative"
              >
                <div className="w-24 h-24 rounded-full bg-[#120226] border-2 border-[#4A3CC9] flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(100,86,238,0.4)] transition-transform duration-300 hover:scale-110">
                  <step.icon size={40} className="text-[#A789D6]" />
                  <div className="absolute -bottom-3 -right-3 w-10 h-10 rounded-full bg-[#2A1673] border-4 border-[#120226] flex items-center justify-center font-bold text-white shadow-lg">
                    {i + 1}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  {step.title.split(". ")[1]}
                </h3>
                <p className="text-[#B6B6CC] leading-relaxed px-4">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
