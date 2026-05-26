import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[#4A3CC9] text-white hover:bg-[#3c2fb2] dark:bg-[#6B5FD9] dark:hover:bg-[#7A6FE8]",
  secondary:
    "bg-[#f4f5fb] text-[#100A36] hover:bg-[#eceef8] dark:bg-[#1A1A2E] dark:text-[#E0E0ED] dark:hover:bg-[#242438]",
  ghost:
    "bg-transparent text-[#100A36] hover:bg-[#EEF1FA] dark:text-white dark:hover:bg-[#1A1A2E]",
  outline:
    "border border-[#D7DBEA] bg-transparent text-[#100A36] hover:bg-[#F8F9FD] dark:border-[#3A3A4E] dark:text-white dark:hover:bg-[#1A1A2E]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A3CC9]/35 disabled:pointer-events-none disabled:opacity-60",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    />
  );
}
