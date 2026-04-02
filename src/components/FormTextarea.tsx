import { AlertCircle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

interface FormTextareaProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  helpText?: string;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  maxLength?: number;
  showCharCount?: boolean;
  isValid?: boolean;
}

export function FormTextarea({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  helpText,
  placeholder,
  required = false,
  rows = 6,
  maxLength,
  showCharCount = false,
  isValid = false,
}: FormTextareaProps) {
  return (
    <div className="w-full">
      <label
        htmlFor={name}
        className="block text-[#B6B6CC] text-sm font-medium mb-2"
      >
        {label}
        {required && <span className="text-[#EF4444] ml-1">*</span>}
      </label>

      <textarea
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        aria-invalid={!!error}
        aria-describedby={helpText ? `${name}-help` : undefined}
        aria-required={required}
        className={`w-full px-4 py-3 bg-[#100A36] border rounded-lg
          text-white placeholder:text-[#B6B6CC]/40
          focus:ring-2 focus:outline-none
          transition-all duration-300 resize-none
          ${
            error
              ? "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/20"
              : isValid && value
                ? "border-[#10B981] focus:border-[#10B981] focus:ring-[#10B981]/20"
                : "border-[#2A1673]/50 focus:border-[#4A3CC9] focus:ring-[#4A3CC9]/20"
          }`}
      />

      {showCharCount && maxLength && (
        <div className="mt-1 text-right">
          <span
            className={`text-sm ${
              value.length > maxLength * 0.9
                ? "text-[#EF4444]"
                : "text-[#B6B6CC]/60"
            }`}
          >
            {value.length}/{maxLength} characters
          </span>
        </div>
      )}

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

      {!error && !showCharCount && helpText && (
        <p id={`${name}-help`} className="mt-1 text-sm text-[#B6B6CC]/60">
          {helpText}
        </p>
      )}
    </div>
  );
}
