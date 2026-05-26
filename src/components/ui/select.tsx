import type { SelectHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Select({
  className,
  label,
  hint,
  error,
  children,
  id,
  ...props
}: SelectProps) {
  const selectId = id ?? props.name;

  return (
    <label className="block space-y-2">
      {label ? (
        <span className="block text-sm font-medium text-[#39415C]">
          {label}
        </span>
      ) : null}
      <select
        id={selectId}
        className={cn(
          "h-11 w-full rounded-lg border bg-white px-4 text-[#100A36] outline-none transition dark:border-[#3A3A4E] dark:bg-[#0F0F1E] dark:text-white focus:border-[#4A3CC9] focus:ring-4 focus:ring-[#4A3CC9]/10 dark:focus:border-[#6B5FD9] dark:focus:ring-[#6B5FD9]/20",
          error ? "border-[#E13B3B]" : "border-[#D7DBEA]",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error ? (
        <span className="block text-xs text-[#E13B3B]">{error}</span>
      ) : null}
      {!error && hint ? (
        <span className="block text-xs text-[#6B728A]">{hint}</span>
      ) : null}
    </label>
  );
}
