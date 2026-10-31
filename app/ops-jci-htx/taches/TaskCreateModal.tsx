"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/Spinner";

interface MemberOption {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  community_role?: string;
}

interface ActivityOption {
  id: string;
  title: string;
}

interface TaskCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: MemberOption[];
  activities: ActivityOption[];
}

const COMMISSIONS = [
  "Commission Formation & Leadership",
  "Commission Santé & Action Communautaire",
  "Commission Entrepreneuriat & Finance",
  "Commission Environnement & Salubrité",
  "Commission Communication & Médias",
  "Commission Protocole & Organisation",
  "Comité Directeur",
];

export function TaskCreateModal({ isOpen, onClose, members, activities }: TaskCreateModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const data = new FormData(form);

    const body = {
      title: data.get("title"),
      description: data.get("description") || undefined,
      commission: data.get("commission") || undefined,
      assigned_to: data.get("assigned_to") || null,
      activity_id: data.get("activity_id") || null,
      priority: data.get("priority") || "normale",
      due_date: data.get("due_date") || null,
      status: "a_faire",
    };

    try {
      const res = await fetch("/api/admin/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Erreur lors de l'assignation de la tâche");
        return;
      }

      onClose();
      router.refresh();
    } catch {
      setError("Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-lg p-6 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h2 className="font-heading font-bold text-navy text-lg">Assigner une nouvelle tâche</h2>
            <p className="text-gray-400 text-xs mt-0.5">Délégation aux membres et responsables de commission</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-semibold cursor-pointer"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-error/10 border border-error/20 text-error text-xs p-3 rounded-lg mt-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 overflow-y-auto pr-1">
          <div>
            <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1">
              Intitulé de la tâche *
            </label>
            <input
              name="title"
              type="text"
              required
              placeholder="Ex : Rédiger le rapport d'impact QCAN 2026"
              className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1">
              Consignes / Description
            </label>
            <textarea
              name="description"
              rows={3}
              placeholder="Détails, livrables attendus, ressources disponibles..."
              className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1">
                Commission concernée
              </label>
              <select
                name="commission"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan bg-white"
              >
                <option value="">Sélectionner une commission</option>
                {COMMISSIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1">
                Priorité
              </label>
              <select
                name="priority"
                defaultValue="normale"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan bg-white"
              >
                <option value="basse">Basse</option>
                <option value="normale">Normale</option>
                <option value="haute">Haute</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1">
                Assigner à un membre
              </label>
              <select
                name="assigned_to"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan bg-white"
              >
                <option value="">Non assigné (ouvert)</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.first_name} {m.last_name} {m.community_role ? `(${m.community_role})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1">
                Activité associée
              </label>
              <select
                name="activity_id"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan bg-white"
              >
                <option value="">Aucune (Tâche générale)</option>
                {activities.map((a) => (
                  <option key={a.id} value={a.id}>{a.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1">
              Date limite d&apos;exécution (Échéance)
            </label>
            <input
              name="due_date"
              type="date"
              className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan bg-white"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-navy text-white text-sm font-semibold hover:bg-navy/90 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? <Spinner className="w-4 h-4 text-white" /> : null}
              Assigner la tâche
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
