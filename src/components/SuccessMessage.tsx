import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

interface SuccessMessageProps {
  email: string;
  onReturnHome: () => void;
}

export function SuccessMessage({ email, onReturnHome }: SuccessMessageProps) {
  return (
    <div className="text-center py-12">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="w-20 h-20 mx-auto mb-6 bg-[#10B981]/20 rounded-full flex items-center justify-center"
      >
        <CheckCircle className="w-10 h-10 text-[#10B981]" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-3xl md:text-4xl font-bold text-white mb-4"
      >
        Request Submitted Successfully!
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-lg text-[#B6B6CC] mb-6 max-w-xl mx-auto"
      >
        Your contributor request has been submitted successfully. An
        administrator will review your organization. If approved, we will send
        your contributor portal credentials, temporary password, and automation
        API key to{" "}
        <strong className="text-[#A789D6]">{email}</strong> within 24-48 hours.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-4 justify-center"
      >
        <button
          onClick={onReturnHome}
          className="px-8 py-3 bg-[#4A3CC9] text-white rounded-lg hover:bg-[#5A49DA] 
            shadow-lg shadow-[#4A3CC9]/30 transition-all duration-300 hover:scale-105 font-medium"
        >
          Return to Home
        </button>

        <button
          onClick={() => window.open("#docs", "_blank")}
          className="px-8 py-3 border-2 border-[#4A3CC9] text-[#A789D6] rounded-lg 
            hover:bg-[#4A3CC9]/10 transition-all duration-300 font-medium"
        >
          View Documentation
        </button>
      </motion.div>
    </div>
  );
}
