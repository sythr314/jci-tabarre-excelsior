import { cn } from "@/lib/utils/cn";

type Category = "communaute" | "entrepreneuriat" | "formation" | "sante" | "environnement";

const categoryLabels: Record<Category, string> = {
  communaute: "Communauté",
  entrepreneuriat: "Entrepreneuriat",
  formation: "Formation",
  sante: "Santé",
  environnement: "Environnement",
};

const categoryColors: Record<Category, string> = {
  communaute:    "bg-cyan-light text-navy",
  entrepreneuriat: "bg-blue/10 text-blue",
  formation:     "bg-success/10 text-success",
  sante:         "bg-error/10 text-error",
  environnement: "bg-success/15 text-success",
};

interface BadgeProps {
  category: Category;
  className?: string;
}

export function Badge({ category, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-block px-3 py-1 rounded-full text-xs font-semibold font-heading uppercase tracking-wide",
        categoryColors[category],
        className
      )}
    >
      {categoryLabels[category]}
    </span>
  );
}
