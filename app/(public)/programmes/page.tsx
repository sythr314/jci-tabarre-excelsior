import type { Metadata } from "next";
import { TOYP_CATEGORIES } from "@/lib/data/national";
import { ToypNominationForm } from "./ToypNominationForm";

export const metadata: Metadata = {
  title: "Programmes Nationaux & JCI TOYP | JCI Haïti & Tabarre Excelsior",
  description:
    "Découvrez les grands programmes nationaux de la JCI : JCI TOYP (Les 10 Jeunes les Plus Remarquables), JCI CYEA (Prix du Jeune Entrepreneur Créatif), JCI RISE et Débat & Art Oratoire.",
};

const NATIONAL_PILLARS = [
  {
    badge: "Distinction Internationale",
    title: "JCI TOYP — Ten Outstanding Young Persons",
    desc: "Programme phare mondial honorant chaque année jusqu'à 10 jeunes de 18 à 40 ans dont les réalisations exceptionnelles transforment leur communauté et inspirent toute la nation.",
    icon: "🏆",
  },
  {
    badge: "Entrepreneuriat & Innovation",
    title: "JCI CYEA — Creative Young Entrepreneur Award",
    desc: "Compétition nationale et internationale récompensant les jeunes fondateurs d'entreprises qui résolvent des problèmes économiques ou sociaux par un modèle d'affaires innovant.",
    icon: "🚀",
  },
  {
    badge: "Éloquence & Gouvernance",
    title: "Championnats Nationaux de Débat & d'Art Oratoire",
    desc: "Compétitions inter-OLM formant les jeunes citoyens à la rhétorique, l'argumentation structurée et la prise de parole en public jusqu'à la Conférence des Amériques.",
    icon: "🎙️",
  },
  {
    badge: "Résilience Économique",
    title: "Initiative Mondiale JCI RISE",
    desc: "Rebuild, Invest, Sustain, Evolve : soutenir les PME, l'employabilité des jeunes et la santé mentale au travail à travers des projets locaux mesurables.",
    icon: "🌍",
  },
];

export default function ProgrammesPage() {
  return (
    <div className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* En-tête */}
        <div className="max-w-3xl">
          <span className="inline-block px-3 py-1 rounded-full bg-cyan/15 text-navy text-xs font-heading font-semibold uppercase tracking-wider mb-3">
            Grands Programmes Nationaux JCI
          </span>
          <h1 className="font-heading font-bold text-3xl sm:text-4xl text-navy mb-4">
            Célébrer l&apos;Excellence, Former les Leaders & Soutenir l&apos;Impact
          </h1>
          <p className="text-gray-600 leading-relaxed">
            Au niveau local comme national, la Jeune Chambre Internationale déploie des programmes
            standardisés mondialement pour révéler les talents, encourager l&apos;entrepreneuriat
            responsable et honorer les jeunes acteurs de changement.
          </p>
        </div>

        {/* Les 4 grands programmes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {NATIONAL_PILLARS.map((p) => (
            <div
              key={p.title}
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex gap-4"
            >
              <div className="text-3xl shrink-0">{p.icon}</div>
              <div>
                <span className="text-[11px] font-heading font-semibold uppercase tracking-wider text-cyan">
                  {p.badge}
                </span>
                <h2 className="font-heading font-bold text-lg text-navy mt-0.5 mb-2">
                  {p.title}
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Les 10 catégories TOYP */}
        <section>
          <div className="mb-6">
            <h2 className="font-heading font-bold text-2xl text-navy">
              Les 10 Catégories Officielles JCI TOYP
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Chaque candidat peut être nominé dans l&apos;une des dix catégories reconnues par JCI
              Monde :
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {TOYP_CATEGORIES.map((cat) => (
              <div
                key={cat.code}
                className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
              >
                <h3 className="font-heading font-semibold text-xs text-navy mb-1.5 leading-snug">
                  {cat.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">{cat.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Formulaire de nomination TOYP */}
        <section id="nomination-toyp" className="max-w-4xl mx-auto">
          <ToypNominationForm />
        </section>
      </div>
    </div>
  );
}
