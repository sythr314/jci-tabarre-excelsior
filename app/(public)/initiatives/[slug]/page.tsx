import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getInitiativeBySlug, getInitiativeSlugs } from "@/lib/sanity/queries/initiatives";
import { urlFor } from "@/lib/sanity/image";
import { Badge } from "@/components/ui/Badge";
import { SanityImage } from "@/components/ui/SanityImage";
import Link from "next/link";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getInitiativeSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const initiative = await getInitiativeBySlug(slug);
  if (!initiative) return { title: "Initiative introuvable" };

  const ogImage = initiative.coverImage
    ? urlFor(initiative.coverImage as Parameters<typeof urlFor>[0]).width(1200).height(630).url()
    : undefined;

  return {
    title: initiative.title,
    description: initiative.summary,
    openGraph: {
      title: initiative.title,
      description: initiative.summary,
      ...(ogImage && { images: [{ url: ogImage, width: 1200, height: 630 }] }),
    },
  };
}

const statusLabels = { ongoing: "En cours", completed: "Terminé", planned: "Planifié" };

export default async function InitiativeDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const initiative = await getInitiativeBySlug(slug);
  if (!initiative) notFound();

  const {
    title, category, summary, description, coverImage,
    gallery, startDate, endDate, status, results, beneficiaries,
  } = initiative;

  return (
    <article>
      {/* Hero */}
      <div className="relative h-64 md:h-96 bg-navy">
        {coverImage && (
          <SanityImage
            source={coverImage}
            alt={title}
            width={1200}
            height={400}
            fill
            priority
            sizes="100vw"
            className="opacity-60"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 max-w-7xl mx-auto">
          <Badge category={category} className="mb-3" />
          <h1 className="text-3xl md:text-4xl font-bold font-heading text-white">{title}</h1>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Meta */}
        <div className="flex flex-wrap gap-6 mb-8 pb-8 border-b border-gray-100 text-sm text-gray-600">
          <div>
            <span className="font-semibold text-navy">Statut : </span>
            {statusLabels[status]}
          </div>
          <div>
            <span className="font-semibold text-navy">Début : </span>
            {new Date(startDate).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
          </div>
          {endDate && (
            <div>
              <span className="font-semibold text-navy">Fin : </span>
              {new Date(endDate).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
            </div>
          )}
          {beneficiaries && (
            <div>
              <span className="font-semibold text-navy">Bénéficiaires : </span>
              {beneficiaries.toLocaleString("fr")}
            </div>
          )}
        </div>

        {/* Résumé */}
        <p className="text-xl text-gray-600 leading-relaxed mb-8">{summary}</p>

        {/* Résultats */}
        {results && (
          <div className="bg-cyan-light border-l-4 border-cyan rounded-r-lg p-5 mb-8">
            <p className="font-semibold text-navy text-sm uppercase tracking-wide mb-1">Résultats clés</p>
            <p className="text-navy/80">{results}</p>
          </div>
        )}

        {/* Description richtext (texte brut pour l'instant) */}
        {description && (
          <div className="prose prose-lg max-w-none text-gray-700">
            {(description as { _type: string; children?: { text: string }[] }[]).map((block, i) => {
              if (block._type !== "block") return null;
              return (
                <p key={i}>
                  {block.children?.map((child) => child.text).join("")}
                </p>
              );
            })}
          </div>
        )}

        {/* Galerie */}
        {gallery && gallery.length > 0 && (
          <div className="mt-12">
            <h2 className="font-heading font-bold text-navy text-2xl mb-6">Galerie photos</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {gallery.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-cyan-light">
                  <SanityImage
                    source={img}
                    alt={`${title} — photo ${i + 1}`}
                    width={400}
                    height={400}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Retour */}
        <div className="mt-12">
          <Link
            href="/initiatives"
            className="text-cyan font-semibold hover:text-cyan-dark transition-colors focus-visible:outline-none focus-visible:underline"
          >
            ← Retour aux initiatives
          </Link>
        </div>
      </div>
    </article>
  );
}
