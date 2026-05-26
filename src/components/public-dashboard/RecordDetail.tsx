import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Badge, Button, Card, CardContent } from "../ui";
import type { ReactNode } from "react";

interface DetailField {
  label: string;
  value: string;
}

interface RecordDetailProps {
  title: string;
  description: string;
  badges: Array<{
    label: string;
    tone?: "neutral" | "success" | "warning" | "danger" | "blue";
  }>;
  fields: DetailField[];
  backHref: string;
  backLabel: string;
  asideTitle: string;
  asideBody: string;
  children?: ReactNode;
}

export function RecordDetail({
  title,
  description,
  badges,
  fields,
  backHref,
  backLabel,
  asideTitle,
  asideBody,
  children,
}: RecordDetailProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.8fr)]">
      <Card className="border-[#E5E8F2] dark:border-[#2A2A3E]">
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {badges.map((badge) => (
              <Badge key={badge.label} tone={badge.tone ?? "neutral"}>
                {badge.label}
              </Badge>
            ))}
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-semibold tracking-tight text-[#100A36] dark:text-white">
              {title}
            </h2>
            <p className="max-w-3xl text-sm leading-7 text-[#616B82] dark:text-[#A1A5AF]">
              {description}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {fields.map((field) => (
              <div
                key={field.label}
                className="rounded-lg bg-[#F8F9FD] p-4 dark:bg-[#0F0F1E] dark:text-white"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#707A91] dark:text-[#A1A5AF]">
                  {field.label}
                </p>
                <p className="mt-2 text-sm leading-6 text-[#100A36] dark:text-white">
                  {field.value}
                </p>
              </div>
            ))}
          </div>

          {children}

          <Link to={backHref}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card className="border-[#E5E8F2] bg-[#FBFCFF] dark:border-[#2A2A3E] dark:bg-[#0F0F1E]">
        <CardContent className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#707A91] dark:text-[#A1A5AF]">
            {asideTitle}
          </p>
          <p className="text-sm leading-7 text-[#616B82] dark:text-[#A1A5AF]">
            {asideBody}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
