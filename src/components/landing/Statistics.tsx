import { motion } from "framer-motion";
import { StatCounter } from "../ui/StatCounter";

export function Statistics() {
  return (
    <section className="py-20 md:py-32 bg-[#120226] relative z-10 px-4 md:px-6 border-b border-[#2A1673]/20 text-center">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold text-white mb-16 md:mb-24"
        >
          Platform at a Glance
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          <StatCounter end={4530} label="IOCs Validated" />
          <StatCounter end={120} label="Organizations Contributing" />
          <StatCounter end={100} label="% Immutable Records" />
          <StatCounter end={25400} label="Blockchain Transactions" />
        </div>
      </div>
    </section>
  );
}
