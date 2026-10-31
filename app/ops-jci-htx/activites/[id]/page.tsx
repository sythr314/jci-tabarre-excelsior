import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { safeUrl } from "@/lib/utils/security";
import type { ActivityType, ActivityStatus } from "@/lib/supabase/types";
import { ImportButton } from "./ImportButton";
import { ActivityStatusActions } from "./ActivityStatusActions";

export const metadata: Metadata = { title: "Détail activité — Admin JCI" };

const typeLabels: Record<ActivityType, string> = {
  formation: "Formation",
  activite: "Activité",
  reunion: "Réunion",
  initiative: "Initiative",
  autre: "Autre",
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

type AttendanceMember = { first_name: string; last_name: string; email: string };
type AttendanceRow = {
  id: string;
  attended: boolean;
  source: string;
  external_email: string | null;
  external_name: string | null;
  members: AttendanceMember | null;
};

export default async function ActiviteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServiceClient();

  const { data: activity } = await supabase
    .from("activities")
    .select("*")
    .eq("id", id)
    .single();

  if (!activity) notFound();

  const [attendancesRes, countRes] = await Promise.allSettled([
    supabase
      .from("attendances")
      .select("id, attended, source, external_email, external_name, registered_at, members(first_name, last_name, email)")
      .eq("activity_id", id)
      .order("registered_at", { ascending: false }),
    supabase
      .from("attendances")
      .select("id", { count: "exact", head: true })
      .eq("activity_id", id)
      .eq("attended", true),
  ]);

  const rawAttendances = (
    attendancesRes.status === "fulfilled" ? (attendancesRes.value.data ?? []) : []
  ) as Array<{
    id: string;
    attended: boolean;
    source: string;
    external_email: string | null;
    external_name: string | null;
    members: unknown;
  }>;

  const attendances: AttendanceRow[] = rawAttendances.map((row) => {
    const m = row.members as AttendanceMember | AttendanceMember[] | null;
    return {
      id: row.id,
      attended: row.attended,
      source: row.source,
      external_email: row.external_email,
      external_name: row.external_name,
      members: Array.isArray(m) ? (m[0] ?? null) : m,
    };
  });
  const presentCount = countRes.status === "fulfilled" ? (countRes.value.count ?? 0) : 0;

  const act = activity as {
    id: string;
    title: string;
    type: ActivityType;
    status: ActivityStatus;
    activity_date: string;
    location: string | null;
    capacity: number | null;
    registration_deadline: string | null;
    registration_link: string | null;
    description: string | null;
    google_sheet_id: string | null;
    sheet_email_column: string | null;
  };

  return (
    <div className="p-8 max-w-5xl">
      {/* En-tête */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <Link
            href="/ops-jci-htx/activites"
            className="text-sm text-gray-400 hover:text-gray-600 mb-3 inline-block"
          >
            ← Retour aux activités
          </Link>
          <h1 className="font-heading font-bold text-navy text-2xl">{act.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
              {typeLabels[act.type] ?? act.type}
            </span>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[act.status] ?? "bg-gray-100 text-gray-500"}`}>
              {statusLabels[act.status] ?? act.status}
            </span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-end gap-3">
          <ActivityStatusActions activityId={id} currentStatus={act.status} />
          <Link
            href={`/ops-jci-htx/activites/${id}/modifier`}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Modifier
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Infos */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-heading font-bold text-navy mb-4">Informations</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-400">Date</dt>
                <dd className="text-navy font-medium mt-1">
                  {new Date(act.activity_date).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </dd>
              </div>
              <div>
                <dt className="text-gray-400">Lieu</dt>
                <dd className="text-navy font-medium mt-1">{act.location ?? "—"}</dd>
              </div>
              {act.capacity && (
                <div>
                  <dt className="text-gray-400">Capacité</dt>
                  <dd className="text-navy font-medium mt-1">{act.capacity} participants</dd>
                </div>
              )}
              {act.registration_deadline && (
                <div>
                  <dt className="text-gray-400">Limite inscription</dt>
                  <dd className="text-navy font-medium mt-1">
                    {new Date(act.registration_deadline).toLocaleDateString("fr-FR")}
                  </dd>
                </div>
              )}
              {safeUrl(act.registration_link) && (
                <div className="col-span-2">
                  <dt className="text-gray-400">Lien d&apos;inscription</dt>
                  <dd className="mt-1">
                    <a
                      href={safeUrl(act.registration_link)!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan text-sm hover:underline break-all"
                    >
                      {safeUrl(act.registration_link)}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
            {act.description && (
              <p className="mt-4 text-gray-600 text-sm bg-gray-50 rounded-lg p-3">{act.description}</p>
            )}
          </div>

          {/* Présences */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-navy">
                Présences ({presentCount})
              </h2>
              <span className="text-xs text-gray-400">{attendances.length} inscrit{attendances.length !== 1 ? "s" : ""}</span>
            </div>

            {attendances.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">Aucune présence enregistrée</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-400 border-b border-gray-100">
                      <th className="pb-2 font-medium">Participant</th>
                      <th className="pb-2 font-medium">Présent</th>
                      <th className="pb-2 font-medium hidden md:table-cell">Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {attendances.map((a: AttendanceRow) => {
                      const name = a.members
                        ? `${a.members.first_name} ${a.members.last_name}`
                        : a.external_name ?? a.external_email ?? "—";
                      const email = a.members?.email ?? a.external_email;
                      return (
                        <tr key={a.id}>
                          <td className="py-2">
                            <p className="text-navy font-medium">{name}</p>
                            {email && <p className="text-gray-400 text-xs">{email}</p>}
                            {!a.members && (
                              <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Externe</span>
                            )}
                          </td>
                          <td className="py-2">
                            {a.attended
                              ? <span className="text-green-600 font-medium">✓ Oui</span>
                              : <span className="text-gray-400">Non</span>
                            }
                          </td>
                          <td className="py-2 text-gray-400 text-xs capitalize hidden md:table-cell">
                            {a.source.replace("_", " ")}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Panneau latéral */}
        <div className="space-y-6">
          {/* Import Google Sheets */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-heading font-bold text-navy mb-1">Google Sheets</h2>
            {act.google_sheet_id ? (
              <div className="space-y-3">
                <p className="text-xs text-gray-500 break-all">ID : {act.google_sheet_id}</p>
                <p className="text-xs text-gray-400">Colonne email : <span className="font-medium text-gray-600">{act.sheet_email_column ?? "Email"}</span></p>
                <ImportButton activityId={id} />
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-400 text-sm mb-3">Aucun Google Sheet configuré</p>
                <Link
                  href={`/ops-jci-htx/activites/${id}/modifier`}
                  className="text-cyan text-xs font-medium hover:underline"
                >
                  Configurer →
                </Link>
              </div>
            )}
          </div>

          {/* Statistiques rapides */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-heading font-bold text-navy mb-4">Statistiques</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-400">Inscrits</dt>
                <dd className="font-medium text-navy">{attendances.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-400">Présents</dt>
                <dd className="font-medium text-navy">{presentCount}</dd>
              </div>
              {act.capacity && (
                <div className="flex justify-between">
                  <dt className="text-gray-400">Taux remplissage</dt>
                  <dd className="font-medium text-navy">
                    {Math.round((attendances.length / act.capacity) * 100)}%
                  </dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-gray-400">Membres JCI</dt>
                <dd className="font-medium text-navy">
                  {attendances.filter((a: AttendanceRow) => a.members).length}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-400">Externes</dt>
                <dd className="font-medium text-navy">
                  {attendances.filter((a: AttendanceRow) => !a.members).length}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
