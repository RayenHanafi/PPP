import { AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface FormCheckboxProps {
  label: string | React.ReactNode;
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  required?: boolean;
}

export function FormCheckbox({
  label,
  name,
  checked,
  onChange,
  error,
  required = false,
}: FormCheckboxProps) {
  return (
    <div className="w-full">
      <div className="flex items-start gap-3">
        <div className="flex items-center h-6">
          <input
            id={name}
            name={name}
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            aria-invalid={!!error}
            aria-required={required}
            className="w-5 h-5 rounded border-2 border-[#2A1673] bg-[#100A36]
              text-[#4A3CC9] focus:ring-2 focus:ring-[#4A3CC9]/20 focus:outline-none
              transition-all duration-200 cursor-pointer
              checked:bg-[#4A3CC9] checked:border-[#4A3CC9]"
          />
        </div>

        <label
          htmlFor={name}
          className="text-sm text-[#B6B6CC] leading-relaxed cursor-pointer flex-1"
        >
          {label}
          {required && <span className="text-[#EF4444] ml-1">*</span>}
        </label>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 ml-8 text-sm text-[#EF4444] flex items-center gap-1"
        >
          <AlertCircle className="h-4 w-4" />
          {error}
        </motion.p>
      )}
    </div>
  );
}
