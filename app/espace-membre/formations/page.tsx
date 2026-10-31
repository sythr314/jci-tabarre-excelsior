import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { ActivityRegisterButton } from "../activites/ActivityRegisterButton";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mes Formations & Parcours JCI — Espace Membre" };

const jciOfficialModules = [
  {
    code: "JCI-ACF",
    title: "Cadre du Citoyen Actif (ACF)",
    description: "Méthodologie fondamentale de la JCI pour analyser les besoins réels, élaborer des projets durables et mesurer l'impact dans la communauté.",
    level: "Obligatoire",
    icon: "🌱",
  },
  {
    code: "JCI-ORAT",
    title: "Art Oratoire & Prise de Parole",
    description: "Techniques de communication persuasive, gestion du stress, structure de discours et concours annuel de prise de parole.",
    level: "Fondamental",
    icon: "🎙️",
  },
  {
    code: "JCI-PARL",
    title: "Procédure Parlementaire & Règles de Robert",
    description: "Principes de gouvernance démocratique, motions, amendements et conduite efficace des assemblées et réunions d'affaires.",
    level: "Gouvernance",
    icon: "⚖️",
  },
  {
    code: "JCI-LEAD",
    title: "Leadership d'Impact & Gestion d'Équipe",
    description: "Mobilisation des talents, résolution de conflits, leadership situationnel et conduite du changement positif.",
    level: "Avancé",
    icon: "⭐",
  },
];

type TrainingItem = {
  id: string;
  title: string;
  description: string | null;
  activity_date: string;
  location: string | null;
  status: string;
  capacity: number | null;
};

type AttendanceItem = {
  activity_id: string;
  attended: boolean;
};

export default async function MemberFormationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/espace-membre/connexion");

  const service = createServiceClient();
  const { data: member } = await service.from("members").select("id").eq("user_id", user.id).single();
  if (!member) redirect("/espace-membre/connexion");

  // Charger toutes les activités de type 'formation'
  const { data: trainingActivities } = await service
    .from("activities")
    .select("id, title, description, activity_date, location, status, capacity")
    .eq("type", "formation")
    .order("activity_date", { ascending: true });

  const trainings = (trainingActivities ?? []) as TrainingItem[];

  // Récupérer les présences du membre aux formations
  const { data: attendances } = await service
    .from("attendances")
    .select("activity_id, attended")
    .eq("member_id", member.id);

  const attendancesList = (attendances ?? []) as AttendanceItem[];
  const attendanceMap = new Map<string, boolean>(attendancesList.map((a: AttendanceItem) => [a.activity_id, a.attended]));

  const upcomingTrainings = trainings.filter((t: TrainingItem) => t.status === "upcoming" || t.status === "ongoing");
  const completedTrainings = trainings.filter((t: TrainingItem) => attendanceMap.get(t.id) === true);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading font-bold text-navy text-2xl">Parcours de Formation & Leadership</h1>
        <p className="text-gray-500 text-sm mt-1">
          Développez vos compétences en leadership, gestion de projet et prise de parole grâce aux programmes officiels de la Jeune Chambre Internationale.
        </p>
      </div>

      {/* Résumé compétences */}
      <div className="bg-gradient-to-r from-navy to-navy/90 text-white rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-cyan text-xs font-semibold uppercase tracking-wider font-heading">Votre progression</span>
            <h2 className="text-2xl font-bold font-heading mt-1">
              {completedTrainings.length} formation{completedTrainings.length !== 1 ? "s" : ""} validée{completedTrainings.length !== 1 ? "s" : ""}
            </h2>
            <p className="text-white/70 text-xs mt-1">
              Chaque atelier suivi renforce votre score d'engagement (+25 pts max) et votre profil de jeune leader.
            </p>
          </div>
          <div className="bg-white/10 rounded-xl px-5 py-3 border border-white/15 text-center">
            <div className="text-2xl font-bold font-heading text-cyan">{completedTrainings.length * 5} pts</div>
            <div className="text-xs text-white/60">Points formations</div>
          </div>
        </div>
      </div>

      {/* Formations planifiées à venir */}
      <div>
        <h2 className="font-heading font-bold text-navy text-lg mb-4 flex items-center gap-2">
          <span>🎓</span> Prochains Ateliers de Formation ({upcomingTrainings.length})
        </h2>

        {upcomingTrainings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <p className="text-gray-400 text-sm">Aucun atelier de formation planifié pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {upcomingTrainings.map((t: TrainingItem) => {
              const isRegistered = attendanceMap.has(t.id);
              return (
                <div key={t.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue/10 text-blue border border-blue/20">
                        Formation certifiante
                      </span>
                      {t.capacity && (
                        <span className="text-xs text-gray-400">{t.capacity} places max</span>
                      )}
                    </div>

                    <h3 className="font-heading font-bold text-navy text-base mb-2">
                      {t.title}
                    </h3>

                    {t.description && (
                      <p className="text-gray-600 text-xs line-clamp-3 mb-4 leading-relaxed">
                        {t.description}
                      </p>
                    )}

                    <div className="space-y-1.5 text-xs text-gray-500 mb-5">
                      <div className="flex items-center gap-2">
                        <span>🗓️</span>
                        <span className="font-medium text-navy">
                          {new Date(t.activity_date).toLocaleDateString("fr-FR", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>📍</span>
                        <span>{t.location ?? "Lieu communiqué aux inscrits"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {isRegistered ? "Votre place est réservée" : "Inscription gratuite"}
                    </span>
                    <ActivityRegisterButton
                      activityId={t.id}
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

      {/* Modules officiels JCI du parcours */}
      <div>
        <h2 className="font-heading font-bold text-navy text-lg mb-4 flex items-center gap-2">
          <span>📚</span> Modules Pédagogiques JCI
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {jciOfficialModules.map((m) => (
            <div key={m.code} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3 mb-2">
                <span className="text-2xl" aria-hidden="true">{m.icon}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-heading">
                  {m.level}
                </span>
              </div>
              <h3 className="font-heading font-bold text-navy text-sm mb-1">{m.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{m.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
