import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { calculateEngagementScore } from "@/lib/supabase/engagement";
import { ENGAGEMENT_LEVELS } from "@/lib/supabase/types";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mon tableau de bord — JCI Tabarre Excelsior" };

export default async function MemberDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/espace-membre/connexion");

  const service = createServiceClient();
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
    <div>
      <h1 className="font-heading font-bold text-navy text-2xl mb-8">
        Bonjour, {member.first_name} !
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Score d'engagement */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-heading font-semibold text-navy mb-4">Mon engagement</h2>
          <div className={`text-5xl font-bold font-heading ${scoreColor} mb-1`}>{score.total}</div>
          <div className="text-gray-400 text-sm mb-3">points sur 100</div>
          <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
            <div className={`h-2 rounded-full transition-all ${
              score.level === "champion" ? "bg-amber-400" :
              score.level === "tres_actif" ? "bg-cyan" :
              score.level === "actif" ? "bg-blue" : "bg-gray-300"
            }`} style={{ width: `${score.total}%` }} />
          </div>
          <span className={`inline-block text-sm font-semibold ${scoreColor}`}>{levelInfo.label}</span>

          <div className="mt-4 space-y-2 text-sm border-t border-gray-50 pt-4">
            <div className="flex justify-between text-gray-500">
              <span>Présences aux activités</span><span className="text-navy font-medium">{score.breakdown.presence}/40</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Formations</span><span className="text-navy font-medium">{score.breakdown.formations}/25</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Cotisation {currentYear}</span>
              <span className={score.breakdown.cotisation > 0 ? "text-success font-medium" : "text-error font-medium"}>
                {score.breakdown.cotisation > 0 ? "✓ À jour" : "✗ Impayée"}
              </span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Rôle actif</span><span className="text-navy font-medium">{score.breakdown.role}/15</span>
            </div>
          </div>
        </div>

        {/* Infos rapides */}
        <div className="space-y-4">
          {/* Cotisation */}
          <div className={`rounded-2xl border p-5 ${cotisationPaid ? "bg-success/5 border-success/20" : "bg-warning/5 border-warning/20"}`}>
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="text-2xl">{cotisationPaid ? "✅" : "⚠️"}</span>
              <div>
                <p className="font-semibold text-navy text-sm">Cotisation {currentYear}</p>
                <p className={`text-sm ${cotisationPaid ? "text-success" : "text-warning"}`}>
                  {cotisationPaid ? "À jour" : "Non confirmée — Contactez le secrétaire"}
                </p>
              </div>
            </div>
          </div>

          {/* Dernière présence */}
          {lastAttendance && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-gray-400 text-xs mb-1">Dernière activité</p>
              <p className="font-medium text-navy text-sm">{lastAttendance.activities?.title}</p>
              <p className="text-gray-400 text-xs">
                {lastAttendance.activities?.activity_date
                  ? new Date(lastAttendance.activities.activity_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })
                  : "—"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Prochaines activités */}
      {upcoming.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-heading font-semibold text-navy mb-4">Prochaines activités</h2>
          <div className="space-y-3">
            {upcoming.map((act: { id: string; title: string; activity_date: string; registration_link: string | null }) => (
              <div key={act.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div>
                  <p className="font-medium text-navy text-sm">{act.title}</p>
                  <p className="text-gray-400 text-xs">
                    {new Date(act.activity_date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                  </p>
                </div>
                {act.registration_link && (
                  <a href={act.registration_link} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-cyan font-medium hover:underline focus-visible:outline-none focus-visible:underline">
                    S'inscrire →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
