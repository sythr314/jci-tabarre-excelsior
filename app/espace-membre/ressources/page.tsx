import Link from "next/link";
import { DEFAULT_TRAINERS, DEFAULT_CERTIFICATES } from "@/lib/data/national";

const OFFICIAL_DOCS = [
  {
    category: "Identité & Valeurs",
    title: "Credo, Mission & Vision de la JCI",
    desc: "Texte officiel du Credo JCI (« Nous croyons que la foi en Dieu donne à la vie son véritable sens… ») et guide d'utilisation lors des cérémonies.",
    badge: "Officiel JCI",
  },
  {
    category: "Gouvernance & Assemblées",
    title: "Guide de Procédure Parlementaire (Robert's Rules of Order)",
    desc: "Règles de conduite des Assemblées Générales, prise de parole, motions d'ordre, amendements et scrutins statutaires.",
    badge: "Protocole",
  },
  {
    category: "Gestion de Projet",
    title: "Cadre JCI Action Framework (Analyse, Planification, Exécution, Évaluation)",
    desc: "Méthodologie officielle en 4 étapes pour concevoir des projets d'impact citoyen alignés sur les Objectifs de Développement Durable (ODD) et JCI RISE.",
    badge: "Méthodologie",
  },
  {
    category: "Excellence Nationale",
    title: "Cahier des Charges du Programme 100 % Efficacité Nationale",
    desc: "Grille complète des 100 points répartis entre Administration (/25), Croissance (/25), Impact JCI RISE (/30) et Participation Nationale (/20).",
    badge: "Standard ONM",
  },
];

export default function MemberRessourcesPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-heading font-bold text-2xl text-navy">
          Bibliothèque Nationale, Protocole & Formateurs Certifiés
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Ressources officielles JCI Haïti, répertoire de l&apos;Institut National de Formation et
          registre de vérification des certificats.
        </p>
      </div>

      {/* Bibliothèque Documentaire */}
      <section className="space-y-4">
        <h2 className="font-heading font-bold text-lg text-navy">
          📚 Documents Statutaires & Guides Officiels JCI
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {OFFICIAL_DOCS.map((doc) => (
            <div
              key={doc.title}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold text-cyan uppercase tracking-wider">
                    {doc.category}
                  </span>
                  <span className="text-[11px] bg-gray-100 text-navy px-2.5 py-0.5 rounded-full font-medium">
                    {doc.badge}
                  </span>
                </div>
                <h3 className="font-heading font-bold text-base text-navy mb-1.5">
                  {doc.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">{doc.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Répertoire des Formateurs Certifiés */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading font-bold text-lg text-navy">
              🎓 Répertoire National des Formateurs Certifiés JCI (IG, CNT, CLT)
            </h2>
            <p className="text-xs text-gray-500">
              Formateurs accrédités par l&apos;Institut de Formation JCI Haïti disponibles pour
              animer des sessions officielles dans votre OLM.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DEFAULT_TRAINERS.map((tr) => (
            <div
              key={tr.id}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-heading font-bold text-base text-navy">{tr.name}</h3>
                  <p className="text-xs text-gray-400">
                    {tr.homeOlm} {tr.senatorNumber ? `• ${tr.senatorNumber}` : ""}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-cyan/15 text-navy text-xs font-heading font-bold">
                  {tr.grade}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {tr.specialties.map((s) => (
                  <span
                    key={s}
                    className="text-[11px] bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg"
                  >
                    {s}
                  </span>
                ))}
              </div>

              <div className="pt-2 border-t border-gray-50 flex items-center justify-between text-xs">
                <span className="text-gray-400">{tr.gradeLabel}</span>
                <a
                  href={`mailto:${tr.email}`}
                  className="text-navy font-semibold hover:text-cyan transition-colors"
                >
                  Contacter →
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Registre des Certificats Vérifiables */}
      <section className="bg-navy text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <span className="text-xs font-heading font-semibold uppercase tracking-wider text-cyan">
            Passeport de Compétences JCI
          </span>
          <h2 className="font-heading font-bold text-xl">
            Vérification Publique des Certificats de Formation
          </h2>
          <p className="text-xs text-white/70 max-w-xl leading-relaxed">
            Tous les certificats officiels délivrés (ex :{" "}
            <code className="text-cyan">{DEFAULT_CERTIFICATES[0].certificate_code}</code>) disposent
            d&apos;un lien public vérifiable pouvant être ajouté sur votre profil LinkedIn ou CV.
          </p>
        </div>
        <Link
          href="/verifier?code=JCI-HT-2026-0001"
          className="px-5 py-3 rounded-xl bg-cyan text-navy font-heading font-semibold text-xs hover:bg-cyan/90 transition-colors shrink-0"
        >
          Ouvrir le vérificateur public →
        </Link>
      </section>
    </div>
  );
}
