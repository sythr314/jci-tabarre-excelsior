"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AssignRoleButton({ memberId }: { memberId: string }) {
  const [open, setOpen] = useState(false);
  const [roleTitle, setRoleTitle] = useState("");
  const [commission, setCommission] = useState("");
  const [jciLevel, setJciLevel] = useState<"member" | "senator" | "alumnus">("member");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!roleTitle.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/members/${memberId}/role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role_title: roleTitle.trim(),
          commission: commission.trim() || null,
          community_role: `${roleTitle.trim()}${commission.trim() ? ` — ${commission.trim()}` : ""}`,
          jci_level: jciLevel,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur");
      } else {
        setOpen(false);
        setRoleTitle("");
        setCommission("");
        router.refresh();
      }
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-3.5 py-1.5 rounded-lg bg-navy text-white text-xs font-semibold hover:bg-navy/90 transition-colors font-heading"
      >
        + Assigner un rôle / commission
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-heading font-bold text-navy text-lg">
                Assigner un rôle ou une commission
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 bg-error/10 text-error text-xs rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1">
                  Titre du rôle / Mandat
                </label>
                <input
                  type="text"
                  required
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder="Ex : Directeur de Projet QCAN, Trésorier Adjoint..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1">
                  Commission / Département
                </label>
                <select
                  value={commission}
                  onChange={(e) => setCommission(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan/40 bg-white"
                >
                  <option value="">Commission Générale</option>
                  <option value="Commission Formation & Compétences">Commission Formation & Compétences</option>
                  <option value="Commission Projets & Impact Communautaire">Commission Projets & Impact Communautaire</option>
                  <option value="Commission Affaires & Entrepreneuriat">Commission Affaires & Entrepreneuriat</option>
                  <option value="Commission Communication & Relations Publiques">Commission Communication & Relations Publiques</option>
                  <option value="Bureau Exécutif / CDL">Bureau Exécutif / CDL</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1">
                  Niveau JCI
                </label>
                <select
                  value={jciLevel}
                  onChange={(e) => setJciLevel(e.target.value as "member" | "senator" | "alumnus")}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan/40 bg-white"
                >
                  <option value="member">Membre individuel</option>
                  <option value="senator">Sénateur JCI</option>
                  <option value="alumnus">Alumnus / Ancien</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-cyan text-navy hover:bg-cyan/90 disabled:opacity-50 font-heading"
                >
                  {loading ? "Attribution..." : "Confirmer le mandat"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
