import { cn } from "@/lib/utils/cn";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  light?: boolean;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  centered = false,
  light = false,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn(centered && "text-center", className)}>
      <div className={cn("inline-flex items-center gap-3 mb-4", centered && "flex-col")}>
        <div className="h-1 w-12 rounded-full bg-cyan" />
        <h2
          className={cn(
            "text-3xl md:text-4xl font-bold font-heading",
            light ? "text-white" : "text-navy"
          )}
        >
          {title}
        </h2>
      </div>
      {subtitle && (
        <p
          className={cn(
            "text-lg max-w-2xl",
            centered && "mx-auto",
            light ? "text-cyan-light/80" : "text-gray-600"
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
