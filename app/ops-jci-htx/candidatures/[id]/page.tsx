import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { ReviewButtons } from "./ReviewButtons";
import { INTERESTS_OPTIONS, HOW_HEARD_OPTIONS, EDUCATION_OPTIONS } from "@/lib/utils/schemas";

export const metadata: Metadata = { title: "Candidature — Admin JCI" };

const INTEREST_LABELS = Object.fromEntries(INTERESTS_OPTIONS.map((o) => [o.value, o.label]));
const HOW_HEARD_LABELS = Object.fromEntries(HOW_HEARD_OPTIONS.map((o) => [o.value, o.label]));
const EDUCATION_LABELS = Object.fromEntries(EDUCATION_OPTIONS.map((o) => [o.value, o.label]));

function computeAge(birthDate: string | null): string {
  if (!birthDate) return "—";
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return `${age} ans`;
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</dt>
      <dd className="mt-1 text-sm text-navy">{value || "—"}</dd>
    </div>
  );
}

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServiceClient();

  const { data: app } = await supabase
    .from("member_applications")
    .select("*, reviewed_by:admin_users(name)")
    .eq("id", id)
    .single();

  if (!app) notFound();

  const statusStyles: Record<string, string> = {
    pending:  "bg-warning/10 text-warning border-warning/20",
    approved: "bg-success/10 text-success border-success/20",
    rejected: "bg-error/10 text-error border-error/20",
  };
  const statusLabels: Record<string, string> = {
    pending: "En attente",
    approved: "Approuvée",
    rejected: "Rejetée",
  };

  const reviewerName = (app.reviewed_by as { name: string } | null)?.name;

  return (
    <div className="p-8 max-w-3xl">
      {/* Nav */}
      <Link href="/ops-jci-htx/candidatures" className="text-cyan text-sm hover:underline mb-6 inline-block">
        ← Retour aux candidatures
      </Link>

      {/* En-tête */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="font-heading font-bold text-navy text-2xl">
            {app.first_name} {app.last_name}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Candidature reçue le {new Date(app.submitted_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <span className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border ${statusStyles[app.status] ?? "bg-gray-100 text-gray-500"}`}>
          {statusLabels[app.status] ?? app.status}
        </span>
      </div>

      {/* Informations personnelles */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="font-heading font-bold text-navy text-base mb-5">Informations personnelles</h2>
        <dl className="grid grid-cols-2 gap-5">
          <Field label="Email"            value={app.email} />
          <Field label="Téléphone"         value={app.phone} />
          <Field label="Date de naissance" value={app.birth_date ? `${app.birth_date} (${computeAge(app.birth_date)})` : null} />
          <Field label="Commune"           value={app.commune} />
          <Field label="Profession"        value={app.profession} />
          <Field label="Niveau d'études"   value={app.education_level ? (EDUCATION_LABELS[app.education_level] ?? app.education_level) : null} />
        </dl>
      </div>

      {/* Engagement */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="font-heading font-bold text-navy text-base mb-5">Engagement</h2>
        <dl className="space-y-4">
          <div>
            <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide">Domaines d'intérêt</dt>
            <dd className="mt-2 flex flex-wrap gap-2">
              {app.interests.map((i: string) => (
                <span key={i} className="text-xs bg-cyan/10 text-navy px-2.5 py-1 rounded-full font-medium">
                  {INTEREST_LABELS[i] ?? i}
                </span>
              ))}
            </dd>
          </div>
          <Field label="Comment a connu JCI" value={HOW_HEARD_LABELS[app.how_heard] ?? app.how_heard} />
        </dl>
      </div>

      {/* Motivation */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="font-heading font-bold text-navy text-base mb-3">Motivation</h2>
        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{app.motivation}</p>
      </div>

      {/* Décision admin (si déjà traitée) */}
      {app.status !== "pending" && (
        <div className={`rounded-2xl border p-5 mb-6 ${statusStyles[app.status]}`}>
          <p className="text-sm font-medium">
            Candidature {app.status === "approved" ? "approuvée" : "rejetée"}
            {reviewerName ? ` par ${reviewerName}` : ""}
            {app.reviewed_at ? ` le ${new Date(app.reviewed_at).toLocaleDateString("fr-FR")}` : ""}
          </p>
          {app.review_notes && (
            <p className="text-sm mt-2 opacity-80">{app.review_notes}</p>
          )}
          {app.member_id && (
            <Link href={`/ops-jci-htx/membres/${app.member_id}`} className="text-sm underline mt-2 inline-block">
              Voir le profil membre →
            </Link>
          )}
        </div>
      )}

      {/* Boutons d'action (uniquement si pending) */}
      {app.status === "pending" && (
        <ReviewButtons
          applicationId={app.id}
          applicantName={`${app.first_name} ${app.last_name}`}
        />
      )}
    </div>
  );
}
