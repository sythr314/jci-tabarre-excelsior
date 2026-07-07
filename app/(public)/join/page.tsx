import type { Metadata } from "next";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { JoinForm } from "@/components/sections/JoinForm";

export const metadata: Metadata = {
  title: "Nous rejoindre",
  description:
    "Rejoignez JCI Tabarre Excelsior. Devenez membre et développez votre leadership au sein d'un réseau de jeunes engagés.",
};

const benefits = [
  {
    icon: "🌐",
    title: "Réseau mondial",
    description: "Accédez au réseau JCI de 200 000 membres dans 124 pays.",
  },
  {
    icon: "🎯",
    title: "Leadership",
    description: "Développez vos compétences en leadership à travers des formations et des projets concrets.",
  },
  {
    icon: "🤝",
    title: "Impact local",
    description: "Contribuez directement au développement de votre communauté à Tabarre.",
  },
  {
    icon: "📈",
    title: "Croissance pro",
    description: "Élargissez votre réseau professionnel et créez de nouvelles opportunités.",
  },
];

export default function JoinPage() {
  return (
    <>
      <section className="bg-navy py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Nous rejoindre"
            subtitle="Vous avez entre 18 et 40 ans et vous souhaitez faire une différence ? JCI Tabarre Excelsior vous attend."
            light
          />
        </div>
      </section>

      {/* Bénéfices */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {benefits.map(({ icon, title, description }) => (
              <div key={title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
                <div className="text-3xl mb-3" aria-hidden="true">{icon}</div>
                <h3 className="font-heading font-bold text-navy mb-2">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>

          {/* Formulaire */}
          <div className="max-w-2xl mx-auto">
            <h2 className="font-heading font-bold text-navy text-2xl text-center mb-8">
              Formulaire d&apos;adhésion
            </h2>
            <JoinForm />
          </div>
        </div>
      </section>
    </>
  );
}
