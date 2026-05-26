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
        <span className="block text-sm font-medium text-[var(--color-card-fg)]">
          {label}
        </span>
      ) : null}
      <select
        id={selectId}
        className={cn(
          "h-11 w-full rounded-lg border bg-[var(--color-input-bg)] px-4 text-[var(--color-input-fg)] outline-none transition focus:border-[#4A3CC9] focus:ring-4 focus:ring-[#4A3CC9]/10",
          error ? "border-[#E13B3B]" : "border-[var(--color-input-border)]",
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
        <span className="block text-xs text-[var(--color-text-muted)]">{hint}</span>
      ) : null}
    </label>
  );
}
