import { type LucideProps } from "lucide-react";

export function FeatureCard({
  icon: Icon,
  title,
  description,
  glowColor = "#4A3CC9",
}: {
  icon: React.ComponentType<LucideProps>;
  title: string;
  description: string;
  glowColor?: string;
}) {
  return (
    <div
      className="group relative bg-[#100A36] border border-[#2A1673]/30 rounded-xl p-8 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2"
      style={{
        boxShadow: "0 0 0 rgba(0,0,0,0)",
      }}
      onMouseOver={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          `0 10px 30px -10px ${glowColor}40`;
        (e.currentTarget as HTMLDivElement).style.borderColor = glowColor;
      }}
      onMouseOut={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 0 0 rgba(0,0,0,0)";
        (e.currentTarget as HTMLDivElement).style.borderColor =
          "rgba(58, 31, 156, 0.3)";
      }}
    >
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-lg bg-[#2A1673]/20 mb-6">
        <Icon size={32} color="#A789D6" />
      </div>
      <h3 className="text-2xl font-semibold text-white mb-4">{title}</h3>
      <p className="text-[#B6B6CC] text-base leading-relaxed">{description}</p>
      <div
        className="absolute inset-0 rounded-xl transition-all duration-500 opacity-0 group-hover:opacity-100 pointer-events-none"
        style={{
          boxShadow: `inset 0 0 20px ${glowColor}15`,
        }}
      />
    </div>
  );
}
