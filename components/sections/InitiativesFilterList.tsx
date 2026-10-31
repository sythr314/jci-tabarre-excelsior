"use client";

import { useState } from "react";
import type { Initiative } from "@/lib/sanity/queries/initiatives";
import { InitiativeCard } from "@/components/sections/InitiativeCard";

interface InitiativesFilterListProps {
  initiatives: Initiative[];
}

type FilterCategory = "all" | Initiative["category"];

const categories: { key: FilterCategory; label: string }[] = [
  { key: "all", label: "Toutes les initiatives" },
  { key: "formation", label: "Formation & Leadership" },
  { key: "sante", label: "Santé Communautaire" },
  { key: "entrepreneuriat", label: "Entrepreneuriat" },
  { key: "environnement", label: "Environnement" },
  { key: "communaute", label: "Action Civique" },
];

export function InitiativesFilterList({ initiatives }: InitiativesFilterListProps) {
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>("all");

  const filtered = selectedCategory === "all"
    ? initiatives
    : initiatives.filter((i) => i.category === selectedCategory);

  return (
    <div>
      {/* Filtres par catégorie */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
        {categories.map((cat) => {
          const count =
            cat.key === "all"
              ? initiatives.length
              : initiatives.filter((i) => i.category === cat.key).length;

          // Ne pas afficher les catégories vides sauf "all"
          if (cat.key !== "all" && count === 0) return null;

          const isActive = selectedCategory === cat.key;

          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                isActive
                  ? "bg-navy text-white shadow-md shadow-navy/20 scale-105"
                  : "bg-white text-gray-600 hover:text-navy hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  isActive ? "bg-cyan text-navy font-bold" : "bg-gray-100 text-gray-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grille des initiatives */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 p-8 max-w-md mx-auto">
          <p className="text-gray-500 font-medium">
            Aucune initiative dans cette catégorie pour le moment.
          </p>
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className="mt-4 text-cyan hover:underline font-semibold text-sm cursor-pointer"
          >
            Voir toutes les initiatives
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((initiative) => (
            <InitiativeCard key={initiative._id} initiative={initiative} />
          ))}
        </div>
      )}
    </div>
  );
}
