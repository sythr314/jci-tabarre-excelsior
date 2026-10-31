import type { Metadata } from "next";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getAllInitiatives } from "@/lib/sanity/queries/initiatives";
import { InitiativesFilterList } from "@/components/sections/InitiativesFilterList";

export const metadata: Metadata = {
  title: "Nos initiatives",
  description:
    "Découvrez toutes les initiatives menées par JCI Tabarre Excelsior pour le développement de la communauté de Tabarre, Haïti.",
};

export default async function InitiativesPage() {
  const initiatives = await getAllInitiatives();

  return (
    <>
      {/* Hero */}
      <section className="bg-navy py-20 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#00A3E0_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <SectionHeader
            title="Nos initiatives citoyennes"
            subtitle="Des projets à fort impact social, menés par de jeunes leaders engagés pour la commune de Tabarre et Haïti."
            light
          />
        </div>
      </section>

      {/* Grille avec filtres */}
      <section className="py-16 bg-gray-50 min-h-[50vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {initiatives.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">
                Les initiatives arrivent bientôt. Revenez nous voir !
              </p>
            </div>
          ) : (
            <InitiativesFilterList initiatives={initiatives} />
          )}
        </div>
      </section>
    </>
  );
}
