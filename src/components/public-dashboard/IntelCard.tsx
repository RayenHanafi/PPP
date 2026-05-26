import { Link } from "react-router-dom";
import { Badge, Card, CardContent } from "../ui";

interface IntelCardProps {
  href: string;
  title: string;
  description: string;
  tags: string[];
  meta: string[];
  tone?: "blue" | "success";
}

export function IntelCard({
  href,
  title,
  description,
  tags,
  meta,
  tone = "blue",
}: IntelCardProps) {
  return (
    <Link to={href} className="block">
      <Card className="h-full border-[#E5E8F2] transition dark:border-[#2A2A3E] hover:-translate-y-1">
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={tone}>Validated</Badge>
            <Badge tone="neutral">Public</Badge>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-[#100A36] dark:text-white">
              {title}
            </h3>
            <p className="text-sm leading-6 text-[#616B82] dark:text-[#A1A5AF]">
              {description}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag}
                tone="neutral"
                className="uppercase tracking-[0.16em]"
              >
                {tag}
              </Badge>
            ))}
          </div>
          <div className="grid gap-1 text-sm text-[#51607B] dark:text-[#B0B5C3]">
            {meta.map((entry) => (
              <span key={entry}>{entry}</span>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
