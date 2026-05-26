import type { InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Input({
  className,
  label,
  hint,
  error,
  id,
  ...props
}: InputProps) {
  const inputId = id ?? props.name;

  return (
    <label className="block space-y-2">
      {label ? (
        <span className="block text-sm font-medium text-[#39415C]">
          {label}
        </span>
      ) : null}
      <input
        id={inputId}
        className={cn(
          "h-11 w-full rounded-lg border bg-white px-4 text-[#100A36] outline-none transition dark:border-[#3A3A4E] dark:bg-[#0F0F1E] dark:text-white dark:placeholder:text-[#6A6A7E] focus:border-[#4A3CC9] focus:ring-4 focus:ring-[#4A3CC9]/10 dark:focus:border-[#6B5FD9] dark:focus:ring-[#6B5FD9]/20",
          error ? "border-[#E13B3B]" : "border-[#D7DBEA]",
          className,
        )}
        {...props}
      />
      {error ? (
        <span className="block text-xs text-[#E13B3B]">{error}</span>
      ) : null}
      {!error && hint ? (
        <span className="block text-xs text-[#6B728A]">{hint}</span>
      ) : null}
    </label>
  );
}
