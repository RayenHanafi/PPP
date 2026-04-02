import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

export function StatCounter({
  end,
  label,
  duration = 2,
}: {
  end: number;
  label: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) {
      let start = 0;
      const stepTime = Math.abs(Math.floor((duration * 1000) / end));
      const timer = setInterval(() => {
        start += Math.ceil(end / 100);
        if (start >= end) {
          clearInterval(timer);
          setCount(end);
        } else {
          setCount(start);
        }
      }, stepTime || 10);
      return () => clearInterval(timer);
    }
  }, [inView, end, duration]);

  return (
    <div
      ref={ref}
      className="flex flex-col items-center justify-center p-6 sm:p-8 bg-[#100A36]/50 rounded-2xl border border-[#2A1673]/30 backdrop-blur-md"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-4xl sm:text-5xl font-bold text-white mb-2 tracking-tight"
      >
        {count.toLocaleString()}+
      </motion.div>
      <p className="text-[#B6B6CC] text-sm sm:text-base tracking-wide uppercase font-medium">
        {label}
      </p>
    </div>
  );
}
