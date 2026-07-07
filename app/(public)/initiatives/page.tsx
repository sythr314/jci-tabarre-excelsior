import type { Metadata } from "next";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { InitiativeCard } from "@/components/sections/InitiativeCard";
import { getAllInitiatives } from "@/lib/sanity/queries/initiatives";

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
      <section className="bg-navy py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Nos initiatives"
            subtitle="Des actions concrètes au service du développement communautaire, de la formation et de l'entrepreneuriat."
            light
          />
        </div>
      </section>

      {/* Grille */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {initiatives.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">
                Les initiatives arrivent bientôt. Revenez nous voir !
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {initiatives.map((initiative) => (
                <InitiativeCard key={initiative._id} initiative={initiative} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
