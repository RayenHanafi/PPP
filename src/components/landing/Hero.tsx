import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { Circle } from "lucide-react";
import { cn } from "../../lib/utils";
import { GLSLHills } from "../ui/glsl-hills";

export function HeroGeometric({
  badge = "Blockchain-Powered Security Intelligence",
  title1 = "ThreatChain",
  title2 = "Collaborative Threat Intelligence Platform",
}: {
  badge?: string;
  title1?: string;
  title2?: string;
}) {
  const fadeUpVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.5 + i * 0.2,
        ease: [0.25, 0.4, 0.25, 1] as const,
      },
    }),
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#120226]">
      {/* GLSLHills Background */}
      <div className="absolute inset-0 z-0">
        <GLSLHills 
          width="100%" 
          height="100vh" 
          cameraZ={125}
          planeSize={256}
          speed={0.3}
          color="#4A3CC9"
          opacity={0.4}
        />
      </div>

      <div className="relative z-[10] container mx-auto px-4 md:px-6 pt-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            custom={0}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] mb-8 md:mb-12"
          >
            <Circle className="h-2 w-2 fill-[#4A3CC9]/80" />
            <span className="text-sm text-white/60 tracking-wide">{badge}</span>
          </motion.div>

          <motion.div
            custom={1}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
          >
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold mb-6 md:mb-8 tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">
                {title1}
              </span>
              <br />
              <span
                className={cn(
                  "bg-clip-text text-transparent bg-gradient-to-r from-[#A789D6] via-white/80 to-[#4A3CC9]",
                )}
              >
                {title2}
              </span>
            </h1>
          </motion.div>

          <motion.div
            custom={2}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
          >
            <p className="text-base sm:text-lg md:text-xl text-[#B6B6CC] mb-10 leading-relaxed font-light tracking-wide max-w-2xl mx-auto px-4">
              Share, validate, and track cybersecurity threats with immutable
              blockchain technology. Complete transparency and no tampering.
            </p>
          </motion.div>

          <motion.div
            custom={3}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button className="bg-[#4A3CC9] text-white px-8 py-4 rounded-lg hover:bg-[#5A49DA] shadow-lg shadow-[#4A3CC9]/50 transition-all duration-300 hover:scale-105 font-medium min-w-[220px]">
              Explore Threats
            </button>
            <button className="border-2 border-[#4A3CC9] text-[#A789D6] bg-transparent px-8 py-4 rounded-lg hover:bg-[#4A3CC9]/10 transition-all duration-300 font-medium min-w-[220px]">
              <a href="/become-contributor" className="text-[#A789D6]">
                Become a Contributor
              </a>
            </button>
          </motion.div>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-[#120226] via-transparent to-[#120226]/80 pointer-events-none z-[4]" />
    </div>
  );
}
