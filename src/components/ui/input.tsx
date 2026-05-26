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
        <span className="block text-sm font-medium text-[var(--color-card-fg)]">
          {label}
        </span>
      ) : null}
      <input
        id={inputId}
        className={cn(
          "h-11 w-full rounded-lg border bg-[var(--color-input-bg)] px-4 text-[var(--color-input-fg)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[#4A3CC9] focus:ring-4 focus:ring-[#4A3CC9]/10",
          error ? "border-[#E13B3B]" : "border-[var(--color-input-border)]",
          className,
        )}
        {...props}
      />
      {error ? (
        <span className="block text-xs text-[#E13B3B]">{error}</span>
      ) : null}
      {!error && hint ? (
        <span className="block text-xs text-[var(--color-text-muted)]">{hint}</span>
      ) : null}
    </label>
  );
}
