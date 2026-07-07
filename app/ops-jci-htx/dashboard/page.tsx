import { createServiceClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Tableau de bord — Admin JCI" };

async function getDashboardStats() {
  const supabase = createServiceClient();
  const currentYear = new Date().getFullYear();

  const [members, applications, paidDues, upcomingActivities, recentActivities] = await Promise.allSettled([
    supabase.from("members").select("id, status", { count: "exact" }).eq("status", "active"),
    supabase.from("member_applications").select("id", { count: "exact" }).eq("status", "pending"),
    supabase.from("dues").select("id", { count: "exact" }).eq("year", currentYear).not("paid_at", "is", null),
    supabase.from("activities").select("id, title, activity_date, type, status").eq("status", "upcoming").order("activity_date").limit(5),
    supabase.from("activities").select("id, title, activity_date").eq("status", "completed").order("activity_date", { ascending: false }).limit(3),
  ]);

  return {
    activeMembers:      members.status === "fulfilled" ? (members.value.count ?? 0) : 0,
    pendingApplications: applications.status === "fulfilled" ? (applications.value.count ?? 0) : 0,
    paidDues:           paidDues.status === "fulfilled" ? (paidDues.value.count ?? 0) : 0,
    upcomingActivities: upcomingActivities.status === "fulfilled" ? (upcomingActivities.value.data ?? []) : [],
    recentActivities:   recentActivities.status === "fulfilled" ? (recentActivities.value.data ?? []) : [],
  };
}

const typeLabels: Record<string, string> = {
  formation: "Formation", activite: "Activité", reunion: "Réunion", initiative: "Initiative", autre: "Autre",
};
const typeColors: Record<string, string> = {
  formation: "bg-blue/10 text-blue", activite: "bg-cyan-light text-navy",
  reunion: "bg-gray-100 text-gray-600", initiative: "bg-success/10 text-success", autre: "bg-gray-100 text-gray-500",
};

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const kpis = [
    { label: "Membres actifs",          value: stats.activeMembers,       icon: "👥", color: "bg-navy",       textColor: "text-white" },
    { label: "Candidatures en attente", value: stats.pendingApplications, icon: "📋", color: "bg-warning/10", textColor: "text-warning", alert: stats.pendingApplications > 0 },
    { label: "Cotisations payées (2026)",value: stats.paidDues,           icon: "✅", color: "bg-success/10", textColor: "text-success" },
    { label: "Activités à venir",        value: stats.upcomingActivities.length, icon: "📅", color: "bg-cyan-light", textColor: "text-navy" },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-navy text-2xl">Tableau de bord</h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {kpis.map(({ label, value, icon, color, textColor, alert }) => (
          <div key={label} className={`rounded-2xl p-5 ${color} ${alert ? "ring-2 ring-warning" : ""}`}>
            <div className="text-2xl mb-2" aria-hidden="true">{icon}</div>
            <div className={`text-3xl font-bold font-heading ${textColor}`}>{value}</div>
            <div className={`text-sm mt-1 ${textColor} opacity-70`}>{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Prochaines activités */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-heading font-bold text-navy text-lg mb-5">Prochaines activités</h2>
          {stats.upcomingActivities.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Aucune activité planifiée</p>
          ) : (
            <div className="space-y-3">
              {stats.upcomingActivities.map((act: { id: string; title: string; activity_date: string; type: string }) => (
                <div key={act.id} className="flex items-center justify-between gap-4 py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-navy font-medium text-sm">{act.title}</p>
                    <p className="text-gray-400 text-xs">
                      {new Date(act.activity_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${typeColors[act.type] ?? "bg-gray-100 text-gray-500"}`}>
                    {typeLabels[act.type] ?? act.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alertes */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-heading font-bold text-navy text-lg mb-5">Alertes</h2>
          <div className="space-y-3">
            {stats.pendingApplications > 0 && (
              <div className="flex items-center gap-3 p-3 bg-warning/5 border border-warning/20 rounded-lg">
                <span aria-hidden="true">⚠️</span>
                <div>
                  <p className="text-sm font-medium text-navy">
                    {stats.pendingApplications} candidature{stats.pendingApplications > 1 ? "s" : ""} à examiner
                  </p>
                  <a href="/ops-jci-htx/candidatures" className="text-xs text-cyan hover:underline">Voir les candidatures →</a>
                </div>
              </div>
            )}
            {stats.pendingApplications === 0 && stats.upcomingActivities.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-8">Aucune alerte</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
