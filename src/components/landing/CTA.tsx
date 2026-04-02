import { motion } from "framer-motion";

export function CTA() {
  return (
    <section className="py-24 md:py-40 bg-[#100A36] relative overflow-hidden px-4 md:px-6">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-[600px] h-[600px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#4A3CC9] blur-[150px] opacity-[0.15]"></div>
      </div>
      <div className="max-w-4xl mx-auto relative z-10 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-6xl font-bold text-white mb-6"
        >
          Ready to Contribute?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-[#B6B6CC] text-lg md:text-xl mb-12"
        >
          Join organizations already sharing threat intelligence on ThreatChain.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <button className="relative group overflow-hidden bg-[#4A3CC9] text-white px-10 py-5 rounded-lg shadow-[0_0_40px_rgba(100,86,238,0.4)] transition-all duration-300 hover:scale-105 font-bold text-lg min-w-[280px]">
            <span className="relative z-10">Become a Contributor</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
          </button>
          <button className="border-2 border-[#4A3CC9] text-[#A789D6] bg-transparent px-10 py-5 rounded-lg hover:bg-[#4A3CC9]/10 transition-all duration-300 font-bold justify-center text-lg min-w-[280px]">
            View Documentation
          </button>
        </motion.div>
      </div>
    </section>
  );
}
