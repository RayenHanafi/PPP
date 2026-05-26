import { Card, CardContent } from "../ui/card";
import type { DashboardStat } from "./data";

interface StatsGridProps {
  stats: DashboardStat[];
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className="border-[#E5E8F2] bg-white dark:border-[#2A2A3E] dark:bg-[#0F0F1E]"
        >
          <CardContent>
            <p className="text-sm font-medium text-[#6A728A] dark:text-[#A1A5AF]">
              {stat.label}
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-[#100A36] dark:text-white">
              {stat.value}
            </p>
            <p className="mt-2 text-sm leading-6 text-[#667089] dark:text-[#B0B5C3]">
              {stat.detail}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
