import type { Metadata } from "next";
import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import type { ActivityType, ActivityStatus } from "@/lib/supabase/types";

export const metadata: Metadata = { title: "Activités — Admin JCI" };

const typeLabels: Record<ActivityType, string> = {
  formation: "Formation",
  activite: "Activité",
  reunion: "Réunion",
  initiative: "Initiative",
  autre: "Autre",
};

const typeColors: Record<ActivityType, string> = {
  formation: "bg-blue-50 text-blue-700 border-blue-200",
  activite: "bg-cyan-50 text-navy border-cyan-200",
  reunion: "bg-gray-100 text-gray-600 border-gray-200",
  initiative: "bg-green-50 text-green-700 border-green-200",
  autre: "bg-gray-100 text-gray-500 border-gray-200",
};

const statusLabels: Record<ActivityStatus, string> = {
  upcoming: "À venir",
  ongoing: "En cours",
  completed: "Terminée",
  cancelled: "Annulée",
};

const statusColors: Record<ActivityStatus, string> = {
  upcoming: "bg-cyan-50 text-navy",
  ongoing: "bg-green-50 text-green-700",
  completed: "bg-gray-100 text-gray-500",
  cancelled: "bg-red-50 text-red-600",
};

type SearchParams = { type?: string; status?: string };

export default async function ActivitesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { type, status } = await searchParams;
  const supabase = createServiceClient();

  let query = supabase
    .from("activities")
    .select("id, title, type, activity_date, location, status, capacity, created_at")
    .order("activity_date", { ascending: false });

  if (type && type !== "all") query = query.eq("type", type);
  if (status && status !== "all") query = query.eq("status", status);

  const { data: activities } = await query;
  const list = activities ?? [];

  const counts = {
    total: list.length,
    upcoming: list.filter((a) => a.status === "upcoming").length,
    completed: list.filter((a) => a.status === "completed").length,
  };

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-heading font-bold text-navy text-2xl">Activités</h1>
          <p className="text-gray-500 text-sm mt-1">
            {counts.upcoming > 0
              ? `${counts.upcoming} activité${counts.upcoming > 1 ? "s" : ""} à venir`
              : "Gérez les activités et formations de la locale"}
          </p>
        </div>
        <Link
          href="/ops-jci-htx/activites/nouveau"
          className="inline-flex items-center gap-2 bg-cyan text-navy font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-cyan/90 transition-colors font-heading"
        >
          + Nouvelle activité
        </Link>
      </div>

      {/* Compteurs */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total", count: counts.total, color: "bg-gray-50 text-gray-700" },
          { label: "À venir", count: counts.upcoming, color: "bg-cyan-50 text-navy" },
          { label: "Terminées", count: counts.completed, color: "bg-gray-100 text-gray-500" },
        ].map(({ label, count, color }) => (
          <div key={label} className={`rounded-2xl p-5 ${color}`}>
            <div className="text-3xl font-bold font-heading">{count}</div>
            <div className="text-sm mt-1 opacity-80">{label}</div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <form method="GET" className="flex flex-wrap gap-3 mb-6">
        <select
          name="type"
          defaultValue={type ?? "all"}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30"
        >
          <option value="all">Tous les types</option>
          {(Object.keys(typeLabels) as ActivityType[]).map((t) => (
            <option key={t} value={t}>{typeLabels[t]}</option>
          ))}
        </select>
        <select
          name="status"
          defaultValue={status ?? "all"}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30"
        >
          <option value="all">Tous les statuts</option>
          {(Object.keys(statusLabels) as ActivityStatus[]).map((s) => (
            <option key={s} value={s}>{statusLabels[s]}</option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Filtrer
        </button>
        {(type || status) && (
          <Link
            href="/ops-jci-htx/activites"
            className="rounded-lg px-4 py-2 text-sm text-gray-400 hover:text-gray-600"
          >
            Réinitialiser
          </Link>
        )}
      </form>

      {/* Tableau */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {list.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">Aucune activité trouvée</p>
            <Link
              href="/ops-jci-htx/activites/nouveau"
              className="inline-block mt-4 text-cyan text-sm font-medium hover:underline"
            >
              Créer la première activité →
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 font-medium text-gray-500">Activité</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500 hidden md:table-cell">Type</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500 hidden lg:table-cell">Date</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500 hidden lg:table-cell">Lieu</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Statut</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {list.map((act) => (
                <tr key={act.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-navy">{act.title}</p>
                    {act.capacity && (
                      <p className="text-gray-400 text-xs mt-0.5">Cap. {act.capacity}</p>
                    )}
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full border ${typeColors[act.type as ActivityType] ?? "bg-gray-100 text-gray-500"}`}>
                      {typeLabels[act.type as ActivityType] ?? act.type}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600 hidden lg:table-cell">
                    {new Date(act.activity_date).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 text-xs hidden lg:table-cell">
                    {act.location ?? "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[act.status as ActivityStatus] ?? "bg-gray-100 text-gray-500"}`}>
                      {statusLabels[act.status as ActivityStatus] ?? act.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      href={`/ops-jci-htx/activites/${act.id}`}
                      className="text-cyan text-xs font-medium hover:underline"
                    >
                      Voir →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
