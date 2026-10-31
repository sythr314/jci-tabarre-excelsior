"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TaskCreateModal } from "./TaskCreateModal";
import { Spinner } from "@/components/ui/Spinner";

export interface TaskItem {
  id: string;
  title: string;
  description: string | null;
  commission: string | null;
  priority: "basse" | "normale" | "haute" | "urgente";
  status: "a_faire" | "en_cours" | "termine" | "valide";
  due_date: string | null;
  created_at: string;
  assigned_member: { id: string; first_name: string; last_name: string; email: string } | null;
  assigned_by_admin: { id: string; name: string; role: string } | null;
  activity: { id: string; title: string } | null;
}

interface TaskListClientProps {
  tasks: TaskItem[];
  members: { id: string; first_name: string; last_name: string; email: string; community_role?: string }[];
  activities: { id: string; title: string }[];
}

const priorityColors = {
  basse: "bg-gray-100 text-gray-600",
  normale: "bg-blue-50 text-blue-700 border-blue-200",
  haute: "bg-amber-50 text-amber-700 border-amber-200",
  urgente: "bg-red-50 text-red-700 border-red-200",
};

const statusLabels = {
  a_faire: "À faire",
  en_cours: "En cours",
  termine: "Terminée",
  valide: "Validée par CDL",
};

const statusColors = {
  a_faire: "bg-gray-100 text-gray-600",
  en_cours: "bg-cyan-50 text-navy font-semibold",
  termine: "bg-green-50 text-green-700",
  valide: "bg-purple-50 text-purple-700",
};

export function TaskListClient({ tasks, members, activities }: TaskListClientProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCommission, setFilterCommission] = useState<string>("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filteredTasks = tasks.filter((t) => {
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    if (filterCommission !== "all" && t.commission !== filterCommission) return false;
    return true;
  });

  const commissions = Array.from(new Set(tasks.map((t) => t.commission).filter(Boolean))) as string[];

  async function handleStatusChange(taskId: string, newStatus: TaskItem["status"]) {
    setLoadingId(taskId);
    try {
      const res = await fetch(`/api/admin/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoadingId(null);
    }
  }

  async function handleDelete(taskId: string) {
    if (!confirm("Êtes-vous certain de vouloir supprimer cette tâche ?")) return;
    setLoadingId(taskId);
    try {
      const res = await fetch(`/api/admin/tasks/${taskId}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div>
      {/* Barre d'action supérieure */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading font-bold text-navy text-2xl">Répartition des Tâches & Commissions</h1>
          <p className="text-gray-500 text-sm mt-1">
            Déléguez, suivez les missions et assurez la responsabilité au sein des commissions JCI
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-navy text-white text-sm font-semibold hover:bg-navy/90 transition-colors shadow-sm cursor-pointer"
        >
          <span>+</span> Assigner une tâche
        </button>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-3 mb-6 bg-white p-3 rounded-xl border border-gray-100">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Filtres :</span>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="text-xs font-medium rounded-lg border border-gray-200 px-3 py-1.5 bg-gray-50 text-navy"
        >
          <option value="all">Tous les statuts ({tasks.length})</option>
          <option value="a_faire">À faire ({tasks.filter((t) => t.status === "a_faire").length})</option>
          <option value="en_cours">En cours ({tasks.filter((t) => t.status === "en_cours").length})</option>
          <option value="termine">Terminée ({tasks.filter((t) => t.status === "termine").length})</option>
          <option value="valide">Validée ({tasks.filter((t) => t.status === "valide").length})</option>
        </select>

        {commissions.length > 0 && (
          <select
            value={filterCommission}
            onChange={(e) => setFilterCommission(e.target.value)}
            className="text-xs font-medium rounded-lg border border-gray-200 px-3 py-1.5 bg-gray-50 text-navy"
          >
            <option value="all">Toutes les commissions</option>
            {commissions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}
      </div>

      {/* Liste des tâches */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-cyan/10 text-cyan flex items-center justify-center mx-auto mb-3">
            ✓
          </div>
          <h3 className="font-heading font-semibold text-navy text-base">Aucune tâche trouvée</h3>
          <p className="text-gray-400 text-xs mt-1">
            {tasks.length === 0
              ? "Aucune tâche n'a encore été assignée. Cliquez sur le bouton ci-dessus pour assigner votre première mission."
              : "Aucune tâche ne correspond aux critères de filtre sélectionnés."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredTasks.map((task) => {
            const isLoading = loadingId === task.id;

            return (
              <div
                key={task.id}
                className="bg-white rounded-xl border border-gray-100 shadow-xs p-5 hover:border-gray-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${priorityColors[task.priority]}`}>
                      Priorité {task.priority}
                    </span>
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${statusColors[task.status]}`}>
                      {statusLabels[task.status]}
                    </span>
                    {task.commission && (
                      <span className="text-[11px] font-medium text-navy/70 bg-gray-100 px-2.5 py-0.5 rounded-full">
                        {task.commission}
                      </span>
                    )}
                  </div>

                  <h3 className="font-heading font-bold text-navy text-base">{task.title}</h3>

                  {task.description && (
                    <p className="text-xs text-gray-600 line-clamp-2">{task.description}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 pt-1">
                    {task.assigned_member ? (
                      <span className="text-navy font-medium">
                        Assignée à : <strong>{task.assigned_member.first_name} {task.assigned_member.last_name}</strong>
                      </span>
                    ) : (
                      <span className="text-amber-600 font-medium">Non assignée</span>
                    )}

                    {task.due_date && (
                      <span>
                        Échéance : <strong>{new Date(task.due_date).toLocaleDateString("fr-FR")}</strong>
                      </span>
                    )}

                    {task.activity && (
                      <span className="text-cyan">
                        Activité : {task.activity.title}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions admin */}
                <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
                  {task.status !== "en_cours" && task.status !== "termine" && task.status !== "valide" && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(task.id, "en_cours")}
                      disabled={isLoading}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan/10 text-navy hover:bg-cyan/20 cursor-pointer"
                    >
                      En cours
                    </button>
                  )}

                  {task.status !== "termine" && task.status !== "valide" && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(task.id, "termine")}
                      disabled={isLoading}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 cursor-pointer"
                    >
                      Terminer
                    </button>
                  )}

                  {task.status === "termine" && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(task.id, "valide")}
                      disabled={isLoading}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-50 text-purple-700 hover:bg-purple-100 cursor-pointer"
                      title="Valider par le Comité Directeur"
                    >
                      Valider ✓
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDelete(task.id)}
                    disabled={isLoading}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    title="Supprimer la tâche"
                  >
                    {isLoading ? <Spinner className="w-3.5 h-3.5" /> : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <TaskCreateModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        members={members}
        activities={activities}
      />
    </div>
  );
}
