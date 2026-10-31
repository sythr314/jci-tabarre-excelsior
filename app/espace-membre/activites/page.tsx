import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { ActivityRegisterButton } from "./ActivityRegisterButton";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Activités & Inscriptions — Espace Membre JCI" };

const typeLabels: Record<string, string> = {
  formation: "Formation",
  activite: "Activité",
  reunion: "Réunion",
  initiative: "Initiative",
  autre: "Autre",
};

const typeColors: Record<string, string> = {
  formation: "bg-blue/10 text-blue border-blue/20",
  activite: "bg-cyan-light text-navy border-cyan/20",
  reunion: "bg-gray-100 text-gray-700 border-gray-200",
  initiative: "bg-success/10 text-success border-success/20",
  autre: "bg-gray-100 text-gray-500 border-gray-200",
};

type ActivityItem = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  type: string;
  activity_date: string;
  location: string | null;
  status: string;
  capacity: number | null;
  registration_deadline: string | null;
  registration_link: string | null;
};

type AttendanceItem = {
  activity_id: string;
  attended: boolean;
};

export default async function MemberActivitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/espace-membre/connexion");

  const service = process.env.SUPABASE_SERVICE_ROLE_KEY ? createServiceClient() : supabase;
  const { data: member } = await service.from("members").select("id").eq("user_id", user.id).single();
  if (!member) redirect("/espace-membre/connexion");

  // Charger toutes les activités
  let query = service
    .from("activities")
    .select("id, title, slug, description, type, activity_date, location, status, capacity, registration_deadline, registration_link")
    .order("activity_date", { ascending: true });

  if (type && type !== "all") {
    query = query.eq("type", type);
  }

  const { data: activities } = await query;
  const list = (activities ?? []) as ActivityItem[];

  // Récupérer les inscriptions du membre
  const { data: userAttendances } = await service
    .from("attendances")
    .select("activity_id, attended")
    .eq("member_id", member.id);

  const attendancesList = (userAttendances ?? []) as AttendanceItem[];
  const registeredMap = new Map<string, boolean>(attendancesList.map((a: AttendanceItem) => [a.activity_id, a.attended]));

  const upcoming = list.filter((a: ActivityItem) => a.status === "upcoming" || a.status === "ongoing");
  const past = list.filter((a: ActivityItem) => a.status === "completed" || a.status === "cancelled");

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-navy text-2xl">Activités & Événements</h1>
          <p className="text-gray-500 text-sm mt-1">
            Découvrez et inscrivez-vous aux activités, formations et initiatives de la JCI Tabarre Excelsior.
          </p>
        </div>
      </div>

      {/* Filtres de catégorie */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: "Toutes", val: "all" },
          { label: "Formations", val: "formation" },
          { label: "Initiatives", val: "initiative" },
          { label: "Réunions statutaires", val: "reunion" },
          { label: "Activités & Projets", val: "activite" },
        ].map((f) => {
          const active = (type ?? "all") === f.val;
          return (
            <a
              key={f.val}
              href={f.val === "all" ? "/espace-membre/activites" : `/espace-membre/activites?type=${f.val}`}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold font-heading transition-colors ${
                active
                  ? "bg-navy text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
              }`}
            >
              {f.label}
            </a>
          );
        })}
      </div>

      {/* Prochaines activités */}
      <div>
        <h2 className="font-heading font-bold text-navy text-lg mb-4 flex items-center gap-2">
          <span>📅</span> Activités à venir ({upcoming.length})
        </h2>

        {upcoming.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <p className="text-gray-400 text-sm">Aucune activité à venir dans cette catégorie.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {upcoming.map((act: ActivityItem) => {
              const isRegistered = registeredMap.has(act.id);
              return (
                <div key={act.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${typeColors[act.type] ?? "bg-gray-100 text-gray-600"}`}>
                        {typeLabels[act.type] ?? act.type}
                      </span>
                      {act.capacity && (
                        <span className="text-xs text-gray-400">
                          Capacité : {act.capacity} pers.
                        </span>
                      )}
                    </div>

                    <h3 className="font-heading font-bold text-navy text-base mb-2">
                      {act.title}
                    </h3>

                    {act.description && (
                      <p className="text-gray-600 text-xs line-clamp-3 mb-4 leading-relaxed">
                        {act.description}
                      </p>
                    )}

                    <div className="space-y-1.5 text-xs text-gray-500 mb-5">
                      <div className="flex items-center gap-2">
                        <span>🗓️</span>
                        <span className="font-medium text-navy">
                          {new Date(act.activity_date).toLocaleDateString("fr-FR", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>📍</span>
                        <span>{act.location ?? "Lieu communiqué ultérieurement"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {isRegistered ? "Inscrit avec votre compte" : "Ouvert aux membres"}
                    </span>
                    <ActivityRegisterButton
                      activityId={act.id}
                      isRegistered={isRegistered}
                      isPast={false}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Activités passées */}
      {past.length > 0 && (
        <div className="pt-6 border-t border-gray-200">
          <h2 className="font-heading font-bold text-navy text-lg mb-4 flex items-center gap-2">
            <span>🏁</span> Activités passées & Historique ({past.length})
          </h2>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <th className="px-5 py-3">Activité</th>
                  <th className="px-5 py-3 hidden sm:table-cell">Type</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3 text-right">Votre participation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {past.map((act: ActivityItem) => {
                  const wasPresent = registeredMap.get(act.id);
                  return (
                    <tr key={act.id} className="hover:bg-gray-50/50">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-navy text-sm">{act.title}</p>
                        <p className="text-gray-400 text-xs">{act.location}</p>
                      </td>
                      <td className="px-5 py-3.5 hidden sm:table-cell">
                        <span className="text-xs text-gray-500 capitalize">{typeLabels[act.type] ?? act.type}</span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-500">
                        {new Date(act.activity_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {wasPresent ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-success bg-success/10 px-2.5 py-1 rounded-full">
                            ✓ Présent(e) (+Points)
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">Non participant</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
