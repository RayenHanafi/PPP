import { AlertCircle, CheckCircle, type LucideProps } from "lucide-react";
import { motion } from "framer-motion";

interface FormInputProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  helpText?: string;
  placeholder?: string;
  required?: boolean;
  icon?: React.ComponentType<LucideProps>;
  isValid?: boolean;
}

export function FormInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  onBlur,
  error,
  helpText,
  placeholder,
  required = false,
  icon: Icon,
  isValid = false,
}: FormInputProps) {
  return (
    <div className="w-full">
      <label
        htmlFor={name}
        className="block text-[#B6B6CC] text-sm font-medium mb-2"
      >
        {label}
        {required && <span className="text-[#EF4444] ml-1">*</span>}
      </label>

      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B6B6CC]/60">
            <Icon className="h-5 w-5" />
          </div>
        )}

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={helpText ? `${name}-help` : undefined}
          aria-required={required}
          className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-4 py-3 bg-[#100A36] border rounded-lg
            text-white placeholder:text-[#B6B6CC]/40
            focus:ring-2 focus:outline-none
            transition-all duration-300
            ${
              error
                ? "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/20"
                : isValid && value
                  ? "border-[#10B981] focus:border-[#10B981] focus:ring-[#10B981]/20"
                  : "border-[#2A1673]/50 focus:border-[#4A3CC9] focus:ring-[#4A3CC9]/20"
            }`}
        />
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-sm text-[#EF4444] flex items-center gap-1"
        >
          <AlertCircle className="h-4 w-4" />
          {error}
        </motion.p>
      )}

      {!error && isValid && value && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-sm text-[#10B981] flex items-center gap-1"
        >
          <CheckCircle className="h-4 w-4" />
          Valid
        </motion.p>
      )}

      {!error && helpText && (
        <p id={`${name}-help`} className="mt-1 text-sm text-[#B6B6CC]/60">
          {helpText}
        </p>
      )}
    </div>
  );
}
