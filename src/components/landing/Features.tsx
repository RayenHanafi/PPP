import { motion } from "framer-motion";
import { Link2, Users, MessageSquare } from "lucide-react";
import { FeatureCard } from "../ui/FeatureCard";

const features = [
  {
    icon: Link2,
    title: "Immutable Records",
    description:
      "Every validated IOC is permanently recorded on the blockchain. No tampering, no deletion—only transparent, traceable history.",
  },
  {
    icon: Users,
    title: "Community-Driven",
    description:
      "Organizations share threat intelligence via API keys. Automatic validation ensures scalability while maintaining data quality.",
  },
  {
    icon: MessageSquare,
    title: "Chatbot Assistance",
    description:
      "Query the threat intelligence database in natural language. No complex filters—just ask and explore.",
  },
];

export function Features() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section id="features" className="py-20 md:py-32 bg-[#120226] relative z-10 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 md:mb-24">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            Why ThreatChain?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-[#B6B6CC] text-lg md:text-xl max-w-2xl mx-auto"
          >
            Secure, transparent, and collaborative threat intelligence
            management designed for modern enterprises.
          </motion.p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12"
        >
          {features.map((feature, i) => (
            <motion.div key={i} variants={item}>
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
