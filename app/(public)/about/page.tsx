import type { Metadata } from "next";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { MissionSection } from "@/components/sections/MissionSection";
import { CallToAction } from "@/components/sections/CallToAction";
import { getTeamMembers, getPastPresidents } from "@/lib/sanity/queries/team";
import { getPartners } from "@/lib/sanity/queries/partners";
import { SanityImage } from "@/components/ui/SanityImage";
import { safeUrl } from "@/lib/utils/security";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Découvrez l'histoire, la mission, le comité et les partenaires de JCI Tabarre Excelsior — locale JCI Haïti engagée pour le développement communautaire.",
};

const CATEGORY_LABELS: Record<string, string> = {
  institutionnel: "Institutionnel",
  communautaire: "Communautaire",
  financier: "Financier / Sponsor",
  medias: "Médias",
};

export default async function AboutPage() {
  const [team, pastPresidents, partners] = await Promise.all([
    getTeamMembers(),
    getPastPresidents(),
    getPartners(),
  ]);

  return (
    <>
      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="bg-navy py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="À propos de nous"
            subtitle="JCI Tabarre Excelsior est une locale de la Junior Chamber International (JCI), une organisation mondiale dédiée au développement des jeunes leaders."
            light
          />
        </div>
      </section>

      {/* ── Notre histoire ─────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Notre histoire" className="mb-8" />
          <div className="prose prose-lg max-w-none text-gray-600 space-y-4">
            <p>
              JCI Tabarre Excelsior est une locale de la Junior Chamber International
              implantée dans la commune de Tabarre, en Haïti. Fondée par un groupe de
              jeunes professionnels passionnés, notre locale s&apos;inscrit dans la mission
              mondiale de JCI : offrir aux jeunes adultes les outils pour développer
              leur leadership et créer un impact positif.
            </p>
            <p>
              Affiliée à JCI Haïti, notre locale œuvre dans les domaines de la
              communauté, de l&apos;entrepreneuriat, de la formation, de la santé et de
              l&apos;environnement. Chaque initiative que nous menons est le reflet de notre
              engagement collectif pour un Haïti meilleur.
            </p>
            <p>
              Nos membres, âgés de 18 à 40 ans, sont des professionnels, des étudiants
              et des entrepreneurs qui partagent une vision commune : contribuer au
              développement durable de leur pays.
            </p>
          </div>
        </div>
      </section>

      {/* ── Notre mission ──────────────────────────────────────── */}
      <MissionSection />

      {/* ── Notre comité ───────────────────────────────────────── */}
      {team.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              title="Notre comité"
              subtitle="Notre comité exécutif est composé de membres élus pour un mandat d'un an. Ensemble, ils pilotent les projets, coordonnent les commissions et représentent la locale."
              centered
              className="mb-14"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12">
              {team.map((member) => (
                <div key={member._id} className="flex flex-col items-center text-center group">
                  <div className="relative w-32 h-32 mb-4 rounded-full overflow-hidden ring-2 ring-gray-100 group-hover:ring-cyan transition-all duration-300 shadow-sm">
                    {member.photo ? (
                      <SanityImage
                        source={member.photo}
                        alt={member.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-navy">
                        <span className="text-white font-bold font-heading text-2xl opacity-60">
                          {member.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <h3 className="font-heading font-bold text-navy leading-tight">{member.name}</h3>
                  <p className="text-cyan text-sm font-medium mt-1">{member.role}</p>
                  {member.bio && (
                    <p className="text-gray-500 text-xs mt-2 leading-relaxed line-clamp-3">
                      {member.bio}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Nos partenaires ────────────────────────────────────── */}
      {partners.length > 0 && (
        <section className="py-20 bg-navy">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              title="Nos partenaires"
              subtitle="Des organisations qui partagent notre vision et accompagnent JCI Tabarre Excelsior dans son engagement pour le développement de la jeunesse haïtienne."
              centered
              light
              className="mb-14"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {partners.map((p) => {
                const card = (
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col">
                    {/* Zone logo */}
                    <div className="relative aspect-[3/2] bg-gray-50 flex items-center justify-center p-6">
                      {p.logo ? (
                        <SanityImage
                          source={p.logo}
                          alt={p.name}
                          fill
                          className="object-contain p-4"
                        />
                      ) : (
                        <span className="font-heading font-bold text-navy text-4xl opacity-20">
                          {p.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    {/* Infos */}
                    <div className="px-4 py-3 flex-1 flex flex-col justify-center">
                      <p className="font-heading font-bold text-navy text-sm text-center leading-tight">
                        {p.name}
                      </p>
                      {p.category && (
                        <p className="text-cyan text-xs text-center mt-1">
                          {CATEGORY_LABELS[p.category]}
                        </p>
                      )}
                      {p.description && (
                        <p className="text-gray-500 text-xs text-center mt-1 line-clamp-2 leading-relaxed">
                          {p.description}
                        </p>
                      )}
                    </div>
                  </div>
                );

                const validWebsite = safeUrl(p.website);
                return validWebsite ? (
                  <a
                    key={p._id}
                    href={validWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visiter le site de ${p.name}`}
                  >
                    {card}
                  </a>
                ) : (
                  <div key={p._id}>{card}</div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Galerie des présidents ─────────────────────────────── */}
      {pastPresidents.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              title="Galerie des présidents"
              subtitle="Les leaders qui ont façonné l'identité et l'héritage de JCI Tabarre Excelsior."
              centered
              className="mb-14"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {pastPresidents.map((president) => (
                <article
                  key={president._id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
                >
                  {/* Photo */}
                  <div className="relative aspect-[4/3] bg-navy/5">
                    {president.photo ? (
                      <SanityImage
                        source={president.photo}
                        alt={president.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-navy">
                        <span className="text-white font-bold font-heading text-6xl opacity-20">
                          {president.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-cyan text-navy text-xs font-bold font-heading px-3 py-1 rounded-full shadow">
                      {president.mandateStart}–{president.mandateEnd}
                    </div>
                  </div>

                  {/* Contenu */}
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-heading font-bold text-navy text-lg leading-tight">
                      {president.name}
                    </h3>
                    <p className="text-cyan text-sm font-medium mt-1 mb-3">
                      Président · {president.mandateStart}–{president.mandateEnd}
                    </p>

                    {president.bio && (
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                        {president.bio}
                      </p>
                    )}

                    {president.achievements && president.achievements.length > 0 && (
                      <ul className="mt-4 space-y-1.5">
                        {president.achievements.slice(0, 4).map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-gray-500">
                            <span className="text-cyan mt-0.5 shrink-0 font-bold">▸</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {president.quote && (
                      <blockquote className="mt-auto pt-4 border-t border-gray-100 text-xs text-gray-400 italic leading-relaxed">
                        &ldquo;{president.quote}&rdquo;
                      </blockquote>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <CallToAction />
    </>
  );
}
