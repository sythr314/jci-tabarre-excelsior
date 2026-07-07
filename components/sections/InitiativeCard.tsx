import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { SanityImage } from "@/components/ui/SanityImage";
import type { Initiative } from "@/lib/sanity/queries/initiatives";

interface InitiativeCardProps {
  initiative: Initiative;
}

const statusLabels = {
  ongoing: "En cours",
  completed: "Terminé",
  planned: "Planifié",
};

const statusColors = {
  ongoing: "bg-success/10 text-success",
  completed: "bg-gray-100 text-gray-600",
  planned: "bg-warning/10 text-warning",
};

export function InitiativeCard({ initiative }: InitiativeCardProps) {
  const { title, slug, category, summary, coverImage, status, beneficiaries } = initiative;

  return (
    <Link href={`/initiatives/${slug.current}`} className="group focus-visible:outline-none">
      <Card className="h-full hover:shadow-md transition-shadow duration-200 group-focus-visible:ring-2 group-focus-visible:ring-cyan">
        {/* Image */}
        <div className="relative h-48 bg-cyan-light overflow-hidden">
          {coverImage ? (
            <SanityImage
              source={coverImage}
              alt={title}
              width={400}
              height={200}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-cyan/20 flex items-center justify-center">
                <span className="text-cyan text-2xl font-bold font-heading">JCI</span>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-center justify-between gap-2 mb-3">
            <Badge category={category} />
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColors[status]}`}>
              {statusLabels[status]}
            </span>
          </div>

          <h3 className="font-heading font-bold text-navy text-lg mb-2 line-clamp-2 group-hover:text-blue transition-colors">
            {title}
          </h3>

          <p className="text-gray-600 text-sm line-clamp-3 mb-4">{summary}</p>

          {beneficiaries && (
            <p className="text-xs text-gray-400 font-medium">
              {beneficiaries.toLocaleString("fr")} bénéficiaires
            </p>
          )}
        </div>
      </Card>
    </Link>
  );
}
