import type { Metadata } from "next";
import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Candidatures — Admin JCI" };

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending:  "bg-warning/10 text-warning border border-warning/20",
    approved: "bg-success/10 text-success border border-success/20",
    rejected: "bg-error/10 text-error border border-error/20",
  };
  const labels: Record<string, string> = {
    pending:  "En attente",
    approved: "Approuvée",
    rejected: "Rejetée",
  };
  return (
    <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${styles[status] ?? "bg-gray-100 text-gray-500"}`}>
      {labels[status] ?? status}
    </span>
  );
}

function computeAge(birthDate: string | null): string {
  if (!birthDate) return "—";
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return `${age} ans`;
}

export default async function CandidaturesPage() {
  const supabase = createServiceClient();
  const { data: applications } = await supabase
    .from("member_applications")
    .select("id, first_name, last_name, email, commune, birth_date, status, submitted_at, how_heard")
    .order("submitted_at", { ascending: false });

  const list = applications ?? [];
  const pending  = list.filter((a) => a.status === "pending").length;
  const approved = list.filter((a) => a.status === "approved").length;
  const rejected = list.filter((a) => a.status === "rejected").length;

  return (
    <div className="p-8">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="font-heading font-bold text-navy text-2xl">Candidatures</h1>
        <p className="text-gray-500 text-sm mt-1">
          {pending > 0
            ? `${pending} candidature${pending > 1 ? "s" : ""} en attente d'examen`
            : "Toutes les candidatures sont traitées"}
        </p>
      </div>

      {/* Compteurs */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "En attente", count: pending,  color: "bg-warning/10 text-warning" },
          { label: "Approuvées", count: approved, color: "bg-success/10 text-success" },
          { label: "Rejetées",   count: rejected, color: "bg-error/10 text-error" },
        ].map(({ label, count, color }) => (
          <div key={label} className={`rounded-2xl p-5 ${color}`}>
            <div className="text-3xl font-bold font-heading">{count}</div>
            <div className="text-sm mt-1 opacity-80">{label}</div>
          </div>
        ))}
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {list.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-12">Aucune candidature reçue</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 font-medium text-gray-500">Candidat</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500 hidden md:table-cell">Commune</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500 hidden lg:table-cell">Âge</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500 hidden lg:table-cell">Reçue le</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Statut</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {list.map((app) => (
                <tr key={app.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-navy">{app.first_name} {app.last_name}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{app.email}</p>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600 hidden md:table-cell">{app.commune ?? "—"}</td>
                  <td className="px-5 py-3.5 text-gray-600 hidden lg:table-cell">{computeAge(app.birth_date)}</td>
                  <td className="px-5 py-3.5 text-gray-500 text-xs hidden lg:table-cell">
                    {new Date(app.submitted_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={app.status} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      href={`/ops-jci-htx/candidatures/${app.id}`}
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
