import type { Metadata } from "next";
import { OrganisationsClient } from "./OrganisationsClient";

export const metadata: Metadata = {
  title: "Organisations Locales Membres (OLM) | JCI Haïti & Tabarre Excelsior",
  description:
    "Découvrez le réseau national des Organisations Locales Membres (OLM) de JCI Haïti réparties dans les 4 grandes régions du pays, dont JCI Tabarre Excelsior.",
};

export default function OrganisationsPage() {
  return (
    <div className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-10">
          <span className="inline-block px-3 py-1 rounded-full bg-cyan/15 text-navy text-xs font-heading font-semibold uppercase tracking-wider mb-3">
            Réseau National JCI Haïti
          </span>
          <h1 className="font-heading font-bold text-3xl sm:text-4xl text-navy mb-4">
            Annuaire des Organisations Locales Membres (OLM)
          </h1>
          <p className="text-gray-600 leading-relaxed">
            La Jeune Chambre Internationale Haïti fédère des Organisations Locales Membres (OLM) à
            travers les 4 grandes régions du pays. Chaque OLM forme des jeunes leaders de 18 à 40
            ans et mène des projets d&apos;impact citoyen évalués selon le standard national{" "}
            <strong className="text-navy">100 % Efficacité</strong>.
          </p>
        </div>

        <OrganisationsClient />
      </div>
    </div>
  );
}
