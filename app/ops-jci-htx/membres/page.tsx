import { createServiceClient } from "@/lib/supabase/server";
import { sanitizePostgrestFilter } from "@/lib/utils/security";
import Link from "next/link";
import type { Metadata } from "next";
import type { Member } from "@/lib/supabase/types";

export const metadata: Metadata = { title: "Membres — Admin JCI" };

const statusLabels = { active: "Actif", pending: "En attente", inactive: "Inactif", alumni: "Alumni" };
const statusColors = {
  active:   "bg-success/10 text-success",
  pending:  "bg-warning/10 text-warning",
  inactive: "bg-gray-100 text-gray-500",
  alumni:   "bg-blue/10 text-blue",
};

export default async function MembresPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const params = await searchParams;
  const supabase = createServiceClient();

  let query = supabase
    .from("members")
    .select("id, first_name, last_name, email, status, jci_level, join_date, community_role")
    .order("last_name");

  if (params.status && params.status !== "all") query = query.eq("status", params.status);
  if (params.q) {
    const cleanQ = sanitizePostgrestFilter(params.q);
    if (cleanQ.length > 0) {
      query = query.or(`first_name.ilike.%${cleanQ}%,last_name.ilike.%${cleanQ}%,email.ilike.%${cleanQ}%`);
    }
  }

  const { data: members } = await query;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-bold text-navy text-2xl">Membres</h1>
          <p className="text-gray-500 text-sm mt-1">{members?.length ?? 0} résultat(s)</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/ops-jci-htx/membres/nouveau"
            className="px-4 py-2 bg-navy text-white text-sm font-medium rounded-lg hover:bg-navy/90 transition-colors"
          >
            + Inviter un membre
          </Link>
        </div>
      </div>

      {/* Filtres */}
      <form method="GET" className="flex gap-3 mb-6">
        <input
          name="q"
          defaultValue={params.q}
          placeholder="Rechercher par nom ou email..."
          className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan"
        />
        <select
          name="status"
          defaultValue={params.status ?? "all"}
          className="px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan bg-white"
        >
          <option value="all">Tous les statuts</option>
          <option value="active">Actifs</option>
          <option value="pending">En attente</option>
          <option value="inactive">Inactifs</option>
          <option value="alumni">Alumni</option>
        </select>
        <button type="submit" className="px-4 py-2 bg-cyan text-navy text-sm font-medium rounded-lg hover:bg-cyan-dark transition-colors">
          Filtrer
        </button>
      </form>

      {/* Tableau */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-3 font-semibold text-gray-600">Membre</th>
              <th className="text-left px-6 py-3 font-semibold text-gray-600">Statut</th>
              <th className="text-left px-6 py-3 font-semibold text-gray-600">Rôle</th>
              <th className="text-left px-6 py-3 font-semibold text-gray-600">Adhésion</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(members ?? []).map((m: Partial<Member> & { id: string; first_name: string; last_name: string; email: string }) => (
              <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-navy">{m.first_name} {m.last_name}</div>
                  <div className="text-gray-400 text-xs">{m.email}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[m.status as keyof typeof statusColors] ?? ""}`}>
                    {statusLabels[m.status as keyof typeof statusLabels] ?? m.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600 text-xs">{m.community_role ?? "—"}</td>
                <td className="px-6 py-4 text-gray-400 text-xs">
                  {m.join_date ? new Date(m.join_date).toLocaleDateString("fr-FR") : "—"}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/ops-jci-htx/membres/${m.id}`}
                    className="text-cyan text-xs font-medium hover:underline"
                  >
                    Voir →
                  </Link>
                </td>
              </tr>
            ))}
            {(!members || members.length === 0) && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                  Aucun membre trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
