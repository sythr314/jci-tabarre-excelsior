import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Tableau de bord — Admin JCI" };

type RecentApplication = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  commune: string | null;
  profession: string | null;
  status: string;
  submitted_at: string;
};

async function getDashboardStats() {
  const supabase = createServiceClient();
  const currentYear = new Date().getFullYear();

  const [members, applicationsCount, recentApplications, paidDues, upcomingActivities, recentActivities] =
    await Promise.allSettled([
      supabase.from("members").select("id, status", { count: "exact" }).eq("status", "active"),
      supabase.from("member_applications").select("id", { count: "exact" }).eq("status", "pending"),
      supabase
        .from("member_applications")
        .select("id, first_name, last_name, email, commune, profession, status, submitted_at")
        .order("submitted_at", { ascending: false })
        .limit(5),
      supabase.from("dues").select("id", { count: "exact" }).eq("year", currentYear).not("paid_at", "is", null),
      supabase.from("activities").select("id, title, activity_date, type, status").eq("status", "upcoming").order("activity_date").limit(5),
      supabase.from("activities").select("id, title, activity_date").eq("status", "completed").order("activity_date", { ascending: false }).limit(3),
    ]);

  return {
    activeMembers:       members.status === "fulfilled" ? (members.value.count ?? 0) : 0,
    pendingApplications: applicationsCount.status === "fulfilled" ? (applicationsCount.value.count ?? 0) : 0,
    recentApplications:  (recentApplications.status === "fulfilled" ? (recentApplications.value.data ?? []) : []) as RecentApplication[],
    paidDues:            paidDues.status === "fulfilled" ? (paidDues.value.count ?? 0) : 0,
    upcomingActivities:  upcomingActivities.status === "fulfilled" ? (upcomingActivities.value.data ?? []) : [],
    recentActivities:    recentActivities.status === "fulfilled" ? (recentActivities.value.data ?? []) : [],
  };
}

const typeLabels: Record<string, string> = {
  formation: "Formation", activite: "Activité", reunion: "Réunion", initiative: "Initiative", autre: "Autre",
};
const typeColors: Record<string, string> = {
  formation: "bg-blue/10 text-blue", activite: "bg-cyan-light text-navy",
  reunion: "bg-gray-100 text-gray-600", initiative: "bg-success/10 text-success", autre: "bg-gray-100 text-gray-500",
};

const appStatusBadges: Record<string, { label: string; className: string }> = {
  pending:  { label: "En attente", className: "bg-warning/10 text-warning border border-warning/20" },
  approved: { label: "Approuvée",  className: "bg-success/10 text-success border border-success/20" },
  rejected: { label: "Rejetée",    className: "bg-error/10 text-error border border-error/20" },
};

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const kpis = [
    { label: "Membres actifs",           value: stats.activeMembers,               icon: "👥", color: "bg-navy",       textColor: "text-white",   href: "/ops-jci-htx/membres" },
    { label: "Candidatures en attente",  value: stats.pendingApplications,         icon: "📋", color: "bg-warning/10", textColor: "text-warning", href: "/ops-jci-htx/candidatures", alert: stats.pendingApplications > 0 },
    { label: "Cotisations payées (2026)",value: stats.paidDues,                    icon: "✅", color: "bg-success/10", textColor: "text-success", href: "/ops-jci-htx/membres" },
    { label: "Activités à venir",        value: stats.upcomingActivities.length,   icon: "📅", color: "bg-cyan-light", textColor: "text-navy",    href: "/ops-jci-htx/activites" },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="font-heading font-bold text-navy text-2xl">Tableau de bord</h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* KPIs cliquables */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon, color, textColor, alert, href }) => (
          <Link
            key={label}
            href={href}
            className={`rounded-2xl p-5 transition-transform hover:-translate-y-0.5 ${color} ${alert ? "ring-2 ring-warning" : ""}`}
          >
            <div className="text-2xl mb-2" aria-hidden="true">{icon}</div>
            <div className={`text-3xl font-bold font-heading ${textColor}`}>{value}</div>
            <div className={`text-sm mt-1 ${textColor} opacity-80`}>{label} →</div>
          </Link>
        ))}
      </div>

      {/* Section Demandes d'adhésion récentes directement sur le tableau de bord */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-heading font-bold text-navy text-lg">Demandes d&apos;adhésion récentes</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Candidatures soumises depuis le formulaire public « Nous rejoindre »
            </p>
          </div>
          <Link
            href="/ops-jci-htx/candidatures"
            className="text-xs font-semibold text-cyan hover:underline"
          >
            Voir toutes les candidatures →
          </Link>
        </div>

        {stats.recentApplications.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">
            Aucune demande d&apos;adhésion enregistrée pour le moment.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-gray-400">
                  <th className="pb-2.5 font-medium">Candidat</th>
                  <th className="pb-2.5 font-medium hidden sm:table-cell">Commune / Profession</th>
                  <th className="pb-2.5 font-medium hidden md:table-cell">Date</th>
                  <th className="pb-2.5 font-medium">Statut</th>
                  <th className="pb-2.5 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.recentApplications.map((app) => {
                  const badge = appStatusBadges[app.status] ?? {
                    label: app.status,
                    className: "bg-gray-100 text-gray-600",
                  };
                  return (
                    <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 pr-4">
                        <p className="font-semibold text-navy">{app.first_name} {app.last_name}</p>
                        <p className="text-xs text-gray-400">{app.email}</p>
                      </td>
                      <td className="py-3 pr-4 text-xs text-gray-600 hidden sm:table-cell">
                        {app.commune ?? "—"}
                        {app.profession ? ` • ${app.profession}` : ""}
                      </td>
                      <td className="py-3 pr-4 text-xs text-gray-400 hidden md:table-cell">
                        {new Date(app.submitted_at).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full ${badge.className}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          href={`/ops-jci-htx/candidatures/${app.id}`}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg bg-navy/5 hover:bg-navy text-navy hover:text-white text-xs font-semibold transition-colors"
                        >
                          Examiner →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Prochaines activités */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading font-bold text-navy text-lg">Prochaines activités</h2>
            <Link href="/ops-jci-htx/activites" className="text-xs text-cyan font-semibold hover:underline">
              Gérer →
            </Link>
          </div>
          {stats.upcomingActivities.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Aucune activité planifiée</p>
          ) : (
            <div className="space-y-3">
              {stats.upcomingActivities.map((act: { id: string; title: string; activity_date: string; type: string }) => (
                <Link
                  key={act.id}
                  href={`/ops-jci-htx/activites/${act.id}`}
                  className="flex items-center justify-between gap-4 py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50/60 rounded px-1 transition-colors"
                >
                  <div>
                    <p className="text-navy font-medium text-sm">{act.title}</p>
                    <p className="text-gray-400 text-xs">
                      {new Date(act.activity_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${typeColors[act.type] ?? "bg-gray-100 text-gray-500"}`}>
                    {typeLabels[act.type] ?? act.type}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Alertes */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-heading font-bold text-navy text-lg mb-5">Alertes & Actions rapides</h2>
          <div className="space-y-3">
            {stats.pendingApplications > 0 && (
              <div className="flex items-center gap-3 p-3 bg-warning/5 border border-warning/20 rounded-lg">
                <span aria-hidden="true">⚠️</span>
                <div>
                  <p className="text-sm font-medium text-navy">
                    {stats.pendingApplications} candidature{stats.pendingApplications > 1 ? "s" : ""} en attente d&apos;examen
                  </p>
                  <Link href="/ops-jci-htx/candidatures" className="text-xs text-cyan hover:underline">
                    Voir les candidatures →
                  </Link>
                </div>
              </div>
            )}
            <div className="flex flex-wrap gap-2 pt-2">
              <Link
                href="/ops-jci-htx/activites/nouveau"
                className="px-3.5 py-2 rounded-lg bg-navy text-white text-xs font-semibold hover:bg-navy/90 transition-colors"
              >
                + Nouvelle activité
              </Link>
              <Link
                href="/ops-jci-htx/taches"
                className="px-3.5 py-2 rounded-lg bg-cyan/15 text-navy text-xs font-semibold hover:bg-cyan/25 transition-colors"
              >
                Assigner une tâche
              </Link>
              <Link
                href="/ops-jci-htx/audit"
                className="px-3.5 py-2 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 transition-colors"
              >
                Journal d&apos;audit
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
