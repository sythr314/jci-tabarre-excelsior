"use client";

import { useState } from "react";
import Link from "next/link";
import {
  DEFAULT_LOCAL_ORGANIZATIONS,
  JCI_REGIONS,
  type JciRegion,
} from "@/lib/data/national";

export function OrganisationsClient() {
  const [selectedRegion, setSelectedRegion] = useState<JciRegion | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = DEFAULT_LOCAL_ORGANIZATIONS.filter((org) => {
    const matchesRegion = selectedRegion === "all" || org.region === selectedRegion;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      org.name.toLowerCase().includes(q) ||
      org.city.toLowerCase().includes(q) ||
      org.president_name.toLowerCase().includes(q) ||
      org.flagship_project.toLowerCase().includes(q);
    return matchesRegion && matchesSearch;
  });

  const totalMembers = DEFAULT_LOCAL_ORGANIZATIONS.reduce((acc, o) => acc + o.members_count, 0);
  const avgEfficiency = Math.round(
    DEFAULT_LOCAL_ORGANIZATIONS.reduce((acc, o) => acc + o.efficiency_score, 0) /
      DEFAULT_LOCAL_ORGANIZATIONS.length
  );

  return (
    <div className="space-y-10">
      {/* Statistiques Nationales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm text-center">
          <p className="text-3xl font-heading font-bold text-navy">
            {DEFAULT_LOCAL_ORGANIZATIONS.length}
          </p>
          <p className="text-xs text-gray-500 mt-1">Organisations Locales (OLM)</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm text-center">
          <p className="text-3xl font-heading font-bold text-cyan">{JCI_REGIONS.length}</p>
          <p className="text-xs text-gray-500 mt-1">Régions Nationales</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm text-center">
          <p className="text-3xl font-heading font-bold text-navy">{totalMembers}+</p>
          <p className="text-xs text-gray-500 mt-1">Jeunes Citoyens Actifs</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm text-center">
          <p className="text-3xl font-heading font-bold text-emerald-600">{avgEfficiency}%</p>
          <p className="text-xs text-gray-500 mt-1">Score Moyen 100% Efficacité</p>
        </div>
      </div>

      {/* Filtres par Région et Recherche */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedRegion("all")}
            className={`px-4 py-2 rounded-lg text-xs font-heading font-semibold transition-colors ${
              selectedRegion === "all"
                ? "bg-navy text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Toutes les régions ({DEFAULT_LOCAL_ORGANIZATIONS.length})
          </button>
          {JCI_REGIONS.map((r) => {
            const count = DEFAULT_LOCAL_ORGANIZATIONS.filter((o) => o.region === r.value).length;
            return (
              <button
                key={r.value}
                type="button"
                onClick={() => setSelectedRegion(r.value)}
                className={`px-3.5 py-2 rounded-lg text-xs font-heading font-semibold transition-colors ${
                  selectedRegion === r.value
                    ? "bg-cyan text-navy"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {r.label} ({count})
              </button>
            );
          })}
        </div>

        <div className="relative min-w-[240px]">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une ville, une OLM…"
            className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan"
          />
        </div>
      </div>

      {/* Grille des OLM */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((org) => {
          const isExcelsior = org.slug === "tabarre-excelsior";
          return (
            <article
              key={org.id}
              className={`bg-white rounded-2xl border p-6 shadow-sm flex flex-col justify-between transition-all hover:shadow-md ${
                isExcelsior ? "border-cyan ring-1 ring-cyan/30" : "border-gray-100"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold uppercase tracking-wider text-cyan">
                        {org.regionLabel}
                      </span>
                      {isExcelsior && (
                        <span className="text-[11px] bg-cyan/15 text-navy font-semibold px-2.5 py-0.5 rounded-full">
                          OLM Phare
                        </span>
                      )}
                    </div>
                    <h2 className="font-heading font-bold text-xl text-navy mt-1">
                      {org.name}
                    </h2>
                    <p className="text-xs text-gray-400">
                      📍 {org.city} • Fondée en {org.founded_year}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        org.efficiency_score >= 90
                          ? "bg-emerald-50 text-emerald-700"
                          : org.efficiency_score >= 80
                          ? "bg-blue-50 text-blue-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      🏆 {org.efficiency_score}% Efficacité
                    </span>
                    <p className="text-[11px] text-gray-400 mt-1">
                      {org.status === "affiliated" ? "OLM Affiliée" : "OLM Provisoire"}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  {org.description}
                </p>

                <div className="bg-gray-50 rounded-xl p-3.5 mb-4 space-y-2 text-xs">
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-400">Président(e) Local(e) :</span>
                    <span className="font-medium text-navy text-right">{org.president_name}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-400">Membres actifs :</span>
                    <span className="font-medium text-navy">{org.members_count} membres</span>
                  </div>
                  <div className="pt-1 border-t border-gray-200/70">
                    <span className="text-gray-400 block mb-0.5">Programme phare :</span>
                    <span className="font-medium text-navy">{org.flagship_project}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
                <a
                  href={`mailto:${org.contact_email}`}
                  className="text-xs text-gray-500 hover:text-navy transition-colors truncate"
                >
                  ✉️ {org.contact_email}
                </a>
                <Link
                  href={`/join?olm=${org.slug}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-navy text-white text-xs font-heading font-semibold hover:bg-navy/90 transition-colors shrink-0"
                >
                  Rejoindre cette OLM →
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
