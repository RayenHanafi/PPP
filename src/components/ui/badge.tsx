import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

type BadgeTone = "neutral" | "success" | "warning" | "danger" | "blue";

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}

const toneStyles: Record<BadgeTone, string> = {
  neutral: "bg-[#EEF1FA] text-[#39415C] dark:bg-[#2A2A3E] dark:text-[#B0B5C3]",
  success: "bg-[#E7F8EF] text-[#0F7A43] dark:bg-[#1B3A2A] dark:text-[#4EDC7F]",
  warning: "bg-[#FFF6DF] text-[#9A6600] dark:bg-[#3A2F1A] dark:text-[#FFD166]",
  danger: "bg-[#FDE8E8] text-[#C11E1E] dark:bg-[#3A1F1F] dark:text-[#FF6B6B]",
  blue: "bg-[#E7EEFF] text-[#2D4DB8] dark:bg-[#1F2A4A] dark:text-[#88ADFF]",
};

export function Badge({ children, tone = "neutral", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide",
        toneStyles[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
