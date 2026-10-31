"use client";

import { useState } from "react";

export interface AuditLogEntry {
  id: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
  admin_user: {
    name: string;
    email: string;
    role: string;
  } | null;
}

interface AuditLogClientProps {
  logs: AuditLogEntry[];
}

const roleLabels: Record<string, string> = {
  president: "Président(e)",
  secretaire: "Secrétaire Général(e)",
  charge_formation: "VP Formation",
  charge_communication: "VP Communication",
  tresorier: "Trésorier(e)",
};

const actionBadges: Record<string, { label: string; color: string }> = {
  "activity.create": { label: "Création d'activité", color: "bg-green-50 text-green-700 border-green-200" },
  "activity.update": { label: "Modification d'activité", color: "bg-blue-50 text-blue-700 border-blue-200" },
  "activity.delete": { label: "Suppression d'activité", color: "bg-red-50 text-red-700 border-red-200" },
  "member.role_assign": { label: "Attribution de rôle", color: "bg-purple-50 text-purple-700 border-purple-200" },
  "member.invite": { label: "Invitation membre", color: "bg-amber-50 text-amber-700 border-amber-200" },
  "application.approve": { label: "Validation candidature", color: "bg-green-50 text-green-700 border-green-200" },
  "application.reject": { label: "Rejet candidature", color: "bg-red-50 text-red-700 border-red-200" },
  "dues.confirm": { label: "Validation cotisation", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  "task.assign": { label: "Assignation de tâche", color: "bg-cyan-50 text-navy border-cyan-200" },
  "task.update": { label: "Mise à jour tâche", color: "bg-blue-50 text-blue-700 border-blue-200" },
  "task.delete": { label: "Suppression tâche", color: "bg-gray-100 text-gray-700 border-gray-200" },
};

export function AuditLogClient({ logs }: AuditLogClientProps) {
  const [filterAction, setFilterAction] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const actionTypes = Array.from(new Set(logs.map((l) => l.action)));

  const filtered = logs.filter((l) => {
    if (filterAction !== "all" && l.action !== filterAction) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <h1 className="font-heading font-bold text-navy text-2xl">Journal d&apos;Audit & Traçabilité</h1>
          <p className="text-gray-500 text-sm mt-1">
            Historique infalsifiable des opérations administratives pour la conformité et la redevabilité JCI
          </p>
        </div>

        <div className="text-xs text-gray-400 bg-white px-3 py-1.5 rounded-lg border border-gray-100">
          Total actions enregistrées : <strong>{logs.length}</strong>
        </div>
      </div>

      {/* Barre de filtres */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl border border-gray-100">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Filtrer par action :</span>
        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="text-xs font-medium rounded-lg border border-gray-200 px-3 py-1.5 bg-gray-50 text-navy"
        >
          <option value="all">Toutes les actions ({logs.length})</option>
          {actionTypes.map((action) => (
            <option key={action} value={action}>
              {actionBadges[action]?.label ?? action} ({logs.filter((l) => l.action === action).length})
            </option>
          ))}
        </select>
      </div>

      {/* Tableau de traçabilité */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center max-w-md mx-auto">
          <p className="text-gray-400 text-sm">Aucun événement d&apos;audit enregistré.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold text-gray-500">
                  <th className="px-5 py-3">Date & Heure</th>
                  <th className="px-5 py-3">Administrateur</th>
                  <th className="px-5 py-3">Action</th>
                  <th className="px-5 py-3 hidden md:table-cell">Cible</th>
                  <th className="px-5 py-3 hidden lg:table-cell">Adresse IP</th>
                  <th className="px-5 py-3 text-right">Détails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((log) => {
                  const badge = actionBadges[log.action] ?? {
                    label: log.action,
                    color: "bg-gray-100 text-gray-600",
                  };
                  const isExpanded = expandedId === log.id;

                  return (
                    <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {log.admin_user ? (
                          <div>
                            <span className="font-semibold text-navy text-xs block">
                              {log.admin_user.name}
                            </span>
                            <span className="text-[11px] text-gray-400">
                              {roleLabels[log.admin_user.role] ?? log.admin_user.role}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Système / Anonyme</span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badge.color}`}>
                          {badge.label}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-xs text-gray-600 hidden md:table-cell whitespace-nowrap">
                        {log.target_type ? (
                          <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-[11px]">
                            {log.target_type}:{log.target_id?.slice(0, 8)}...
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-xs text-gray-400 font-mono hidden lg:table-cell whitespace-nowrap">
                        {log.ip_address ?? "—"}
                      </td>

                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        {log.details && Object.keys(log.details).length > 0 ? (
                          <button
                            type="button"
                            onClick={() => setExpandedId(isExpanded ? null : log.id)}
                            className="text-xs text-cyan hover:underline font-medium cursor-pointer"
                          >
                            {isExpanded ? "Masquer ▲" : "Voir détails ▼"}
                          </button>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}

                        {isExpanded && log.details && (
                          <div className="mt-2 text-left bg-gray-900 text-gray-100 p-3 rounded-lg text-xs font-mono overflow-x-auto max-w-sm">
                            <pre className="whitespace-pre-wrap">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </div>
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
