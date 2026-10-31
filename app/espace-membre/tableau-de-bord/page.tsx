import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { calculateEngagementScore } from "@/lib/supabase/engagement";
import { ENGAGEMENT_LEVELS } from "@/lib/supabase/types";
import { safeUrl } from "@/lib/utils/security";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mon tableau de bord — JCI Tabarre Excelsior" };

export default async function MemberDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/espace-membre/connexion");

  const service = process.env.SUPABASE_SERVICE_ROLE_KEY ? createServiceClient() : supabase;
  const { data: member } = await service.from("members").select("*").eq("user_id", user.id).single();
  if (!member) redirect("/espace-membre/connexion");

  const currentYear = new Date().getFullYear();
  const score = await calculateEngagementScore(member.id);
  const levelInfo = ENGAGEMENT_LEVELS[score.level];

  const [dueRes, lastAttendanceRes, upcomingRes] = await Promise.allSettled([
    service.from("dues").select("paid_at").eq("member_id", member.id).eq("year", currentYear).single(),
    service.from("attendances")
      .select("*, activities(title, activity_date)")
      .eq("member_id", member.id)
      .eq("attended", true)
      .order("registered_at", { ascending: false })
      .limit(1),
    service.from("activities")
      .select("id, title, activity_date, type, registration_link")
      .eq("status", "upcoming")
      .order("activity_date")
      .limit(3),
  ]);

  const cotisationPaid = dueRes.status === "fulfilled" && dueRes.value.data?.paid_at != null;
  const lastAttendance = lastAttendanceRes.status === "fulfilled" ? lastAttendanceRes.value.data?.[0] : null;
  const upcoming = upcomingRes.status === "fulfilled" ? (upcomingRes.value.data ?? []) : [];

  const scoreColor =
    score.level === "champion"   ? "text-amber-600" :
    score.level === "tres_actif" ? "text-cyan"      :
    score.level === "actif"      ? "text-blue"      : "text-gray-400";

  return (
    <div className="space-y-8">
      {/* Salutation & Rôle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <h1 className="font-heading font-bold text-navy text-2xl">
            Bonjour, {member.first_name} {member.last_name} !
          </h1>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-light text-navy border border-cyan/20">
              {member.community_role ?? "Membre Actif"}
            </span>
            <span className="text-xs text-gray-400 capitalize">
              • JCI Tabarre Excelsior ({member.jci_level})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/espace-membre/activites"
            className="px-4 py-2 rounded-lg bg-navy text-white text-xs font-semibold hover:bg-navy/90 transition-colors font-heading"
          >
            S'inscrire à une activité →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Score d'engagement */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-navy">Mon engagement civique</h2>
            <span className={`text-xs font-bold uppercase tracking-wider ${scoreColor}`}>
              {levelInfo.label}
            </span>
          </div>
          <div className={`text-5xl font-bold font-heading ${scoreColor} mb-1`}>{score.total}</div>
          <div className="text-gray-400 text-xs mb-3">points sur 100</div>
          <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
            <div
              className={`h-2 rounded-full transition-all ${
                score.level === "champion" ? "bg-amber-400" :
                score.level === "tres_actif" ? "bg-cyan" :
                score.level === "actif" ? "bg-blue" : "bg-gray-300"
              }`}
              style={{ width: `${score.total}%` }}
            />
          </div>

          <div className="space-y-2 text-sm border-t border-gray-50 pt-4">
            <div className="flex justify-between text-gray-500">
              <span>Présences aux activités</span>
              <span className="text-navy font-medium">{score.breakdown.presence}/40</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Formations certifiantes</span>
              <span className="text-navy font-medium">{score.breakdown.formations}/25</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Cotisation {currentYear}</span>
              <span className={score.breakdown.cotisation > 0 ? "text-success font-medium" : "text-error font-medium"}>
                {score.breakdown.cotisation > 0 ? "✓ À jour (20/20)" : "✗ Impayée (0/20)"}
              </span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Rôle actif / Commission</span>
              <span className="text-navy font-medium">{score.breakdown.role}/15</span>
            </div>
          </div>
        </div>

        {/* Statut rapide */}
        <div className="space-y-5">
          {/* Cotisation */}
          <div className={`rounded-2xl border p-5 ${cotisationPaid ? "bg-success/5 border-success/20" : "bg-warning/5 border-warning/20"}`}>
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="text-2xl">{cotisationPaid ? "✅" : "⚠️"}</span>
              <div>
                <p className="font-semibold text-navy text-sm">Cotisation annuelle {currentYear}</p>
                <p className={`text-sm ${cotisationPaid ? "text-success" : "text-warning"}`}>
                  {cotisationPaid ? "En règle" : "Non confirmée — Contactez le trésorier ou le secrétaire"}
                </p>
              </div>
            </div>
          </div>

          {/* Raccourcis Espace Membre */}
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/espace-membre/formations"
              className="p-4 rounded-xl bg-white border border-gray-100 hover:border-cyan/40 shadow-sm transition-all group"
            >
              <div className="text-xl mb-1">🎓</div>
              <p className="text-xs font-bold text-navy font-heading group-hover:text-cyan">Mes Formations</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Parcours & Ateliers JCI</p>
            </Link>

            <Link
              href="/espace-membre/profil"
              className="p-4 rounded-xl bg-white border border-gray-100 hover:border-cyan/40 shadow-sm transition-all group"
            >
              <div className="text-xl mb-1">👤</div>
              <p className="text-xs font-bold text-navy font-heading group-hover:text-cyan">Mon Profil</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Coordonnées & Mandat</p>
            </Link>
          </div>

          {/* Dernière présence */}
          {lastAttendance && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <p className="text-gray-400 text-xs mb-1">Dernière activité enregistrée</p>
              <p className="font-semibold text-navy text-sm">{lastAttendance.activities?.title}</p>
              <p className="text-gray-400 text-xs mt-0.5">
                {lastAttendance.activities?.activity_date
                  ? new Date(lastAttendance.activities.activity_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
                  : "—"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Prochaines activités */}
      {upcoming.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-navy text-base">Prochaines activités de la locale</h2>
            <Link href="/espace-membre/activites" className="text-xs text-cyan font-semibold hover:underline">
              Tout voir →
            </Link>
          </div>
          <div className="space-y-3">
            {upcoming.map((act: { id: string; title: string; activity_date: string; registration_link: string | null }) => (
              <div key={act.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div>
                  <p className="font-medium text-navy text-sm">{act.title}</p>
                  <p className="text-gray-400 text-xs">
                    {new Date(act.activity_date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                  </p>
                </div>
                <Link
                  href="/espace-membre/activites"
                  className="text-xs px-3 py-1.5 rounded-lg bg-cyan-light text-navy font-semibold hover:bg-cyan/30 transition-colors font-heading"
                >
                  Détails & Inscription →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
