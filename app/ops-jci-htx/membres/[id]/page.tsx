import { createServiceClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { calculateEngagementScore } from "@/lib/supabase/engagement";
import { ENGAGEMENT_LEVELS } from "@/lib/supabase/types";
import type { Metadata } from "next";
import { ConfirmDuesButton } from "./ConfirmDuesButton";

export const metadata: Metadata = { title: "Profil membre — Admin JCI" };

export default async function MembreDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServiceClient();
  const currentYear = new Date().getFullYear();

  const [memberRes, rolesRes, attendancesRes, duesRes, projectsRes] = await Promise.allSettled([
    supabase.from("members").select("*").eq("id", id).single(),
    supabase.from("member_roles").select("*").eq("member_id", id).order("start_date", { ascending: false }),
    supabase.from("attendances").select("*, activities(title, activity_date, type)").eq("member_id", id).order("registered_at", { ascending: false }),
    supabase.from("dues").select("*").eq("member_id", id).order("year", { ascending: false }),
    supabase.from("project_members").select("*, projects(title, status)").eq("member_id", id),
  ]);

  const member = memberRes.status === "fulfilled" ? memberRes.value.data : null;
  if (!member) notFound();

  const roles       = rolesRes.status === "fulfilled" ? (rolesRes.value.data ?? []) : [];
  const attendances = attendancesRes.status === "fulfilled" ? (attendancesRes.value.data ?? []) : [];
  const dues        = duesRes.status === "fulfilled" ? (duesRes.value.data ?? []) : [];
  const projects    = projectsRes.status === "fulfilled" ? (projectsRes.value.data ?? []) : [];

  const score = await calculateEngagementScore(id);
  const levelInfo = ENGAGEMENT_LEVELS[score.level];

  const currentDue = dues.find((d: { year: number }) => d.year === currentYear);
  const statusLabels = { active: "Actif", pending: "En attente", inactive: "Inactif", alumni: "Alumni" };
  const statusColors = { active: "bg-success/10 text-success", pending: "bg-warning/10 text-warning", inactive: "bg-gray-100 text-gray-500", alumni: "bg-blue/10 text-blue" };

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-heading font-bold text-navy text-2xl">{member.first_name} {member.last_name}</h1>
          <p className="text-gray-500 text-sm">{member.email}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[member.status as keyof typeof statusColors]}`}>
          {statusLabels[member.status as keyof typeof statusLabels]}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score d'engagement */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-heading font-bold text-navy mb-4">Score d'engagement</h2>
          <div className="text-4xl font-bold font-heading text-navy mb-2">{score.total}<span className="text-lg text-gray-400">/100</span></div>
          <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-4 ${
            score.level === "champion" ? "bg-amber-100 text-amber-700" :
            score.level === "tres_actif" ? "bg-cyan-light text-navy" :
            score.level === "actif" ? "bg-blue/10 text-blue" : "bg-gray-100 text-gray-500"
          }`}>{levelInfo.label}</div>

          {/* Barre */}
          <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
            <div className="bg-cyan h-2 rounded-full transition-all" style={{ width: `${score.total}%` }} />
          </div>

          {/* Détail */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Présences</span><span className="font-medium text-navy">{score.breakdown.presence}/40</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Formations</span><span className="font-medium text-navy">{score.breakdown.formations}/25</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Cotisation</span><span className="font-medium text-navy">{score.breakdown.cotisation}/20</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Rôle actif</span><span className="font-medium text-navy">{score.breakdown.role}/15</span></div>
          </div>
        </div>

        {/* Infos personnelles */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-heading font-bold text-navy mb-4">Informations</h2>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div><dt className="text-gray-400">Téléphone</dt><dd className="text-navy font-medium mt-1">{member.phone ?? "—"}</dd></div>
            <div><dt className="text-gray-400">Profession</dt><dd className="text-navy font-medium mt-1">{member.profession ?? "—"}</dd></div>
            <div><dt className="text-gray-400">Niveau JCI</dt><dd className="text-navy font-medium mt-1 capitalize">{member.jci_level}</dd></div>
            <div><dt className="text-gray-400">Rôle communautaire</dt><dd className="text-navy font-medium mt-1">{member.community_role ?? "—"}</dd></div>
            <div><dt className="text-gray-400">Date d'adhésion</dt><dd className="text-navy font-medium mt-1">{member.join_date ? new Date(member.join_date).toLocaleDateString("fr-FR") : "—"}</dd></div>
          </dl>
          {member.bio && <p className="mt-4 text-gray-600 text-sm bg-gray-50 rounded-lg p-3">{member.bio}</p>}
        </div>

        {/* Cotisations */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-navy">Cotisations</h2>
            {!currentDue?.paid_at && <ConfirmDuesButton memberId={id} year={currentYear} />}
          </div>
          {dues.length === 0 ? (
            <p className="text-gray-400 text-sm">Aucune cotisation enregistrée</p>
          ) : (
            <div className="space-y-2">
              {dues.map((due: { id: string; year: number; paid_at: string | null; amount: number | null }) => (
                <div key={due.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{due.year}</span>
                  <span className={due.paid_at ? "text-success font-medium" : "text-error font-medium"}>
                    {due.paid_at ? `Payée — ${due.amount ? `${due.amount} HTG` : ""}` : "Impayée"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rôles et commissions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-heading font-bold text-navy mb-4">Rôles & commissions</h2>
          {roles.length === 0 ? (
            <p className="text-gray-400 text-sm">Aucun rôle enregistré</p>
          ) : (
            <div className="space-y-3">
              {roles.map((r: { id: string; role_title: string; commission: string | null; is_current: boolean; start_date: string }) => (
                <div key={r.id} className="text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-navy">{r.role_title}</span>
                    {r.is_current && <span className="text-xs bg-cyan-light text-navy px-2 py-0.5 rounded-full">Actuel</span>}
                  </div>
                  <div className="text-gray-400 text-xs">{r.commission ?? "Bureau général"} · depuis {new Date(r.start_date).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Présences */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-heading font-bold text-navy mb-4">Historique des présences ({attendances.length})</h2>
          {attendances.length === 0 ? (
            <p className="text-gray-400 text-sm">Aucune participation enregistrée</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-100">
                    <th className="pb-2 font-medium">Activité</th>
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">Présent</th>
                    <th className="pb-2 font-medium">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {attendances.map((a: { id: string; attended: boolean; source: string; activities?: { title: string; activity_date: string } }) => (
                    <tr key={a.id}>
                      <td className="py-2 text-navy">{a.activities?.title ?? "—"}</td>
                      <td className="py-2 text-gray-500">{a.activities?.activity_date ? new Date(a.activities.activity_date).toLocaleDateString("fr-FR") : "—"}</td>
                      <td className="py-2">{a.attended ? <span className="text-success">✓ Oui</span> : <span className="text-gray-400">Non</span>}</td>
                      <td className="py-2 text-gray-400 text-xs capitalize">{a.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
