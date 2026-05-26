import type { ReactNode } from "react";

interface SectionHeadingProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function SectionHeading({
  title,
  description,
  action,
}: SectionHeadingProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl space-y-2">
        <h2 className="text-xl font-semibold tracking-tight text-[#100A36] dark:text-white sm:text-2xl">
          {title}
        </h2>
        {description ? (
          <p className="text-sm leading-6 text-[#616B82] dark:text-[#A1A5AF]">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
