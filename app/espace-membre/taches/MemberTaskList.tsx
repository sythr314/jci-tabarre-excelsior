"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/Spinner";

export interface MemberTask {
  id: string;
  title: string;
  description: string | null;
  commission: string | null;
  priority: "basse" | "normale" | "haute" | "urgente";
  status: "a_faire" | "en_cours" | "termine" | "valide";
  due_date: string | null;
  created_at: string;
  activity?: { id: string; title: string } | null;
  assigned_by_admin?: { name: string; role: string } | null;
}

interface MemberTaskListProps {
  tasks: MemberTask[];
}

const priorityBadges = {
  basse: "bg-gray-100 text-gray-600",
  normale: "bg-blue-50 text-blue-700",
  haute: "bg-amber-50 text-amber-700",
  urgente: "bg-red-50 text-red-700 font-bold",
};

export function MemberTaskList({ tasks }: MemberTaskListProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "en_cours" | "termine">("all");

  const filtered = tasks.filter((t) => {
    if (activeTab === "en_cours") return t.status === "a_faire" || t.status === "en_cours";
    if (activeTab === "termine") return t.status === "termine" || t.status === "valide";
    return true;
  });

  async function updateStatus(taskId: string, newStatus: "a_faire" | "en_cours" | "termine") {
    setLoadingId(taskId);
    try {
      const res = await fetch(`/api/member/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoadingId(null);
    }
  }

  const pendingCount = tasks.filter((t) => t.status === "a_faire" || t.status === "en_cours").length;
  const completedCount = tasks.filter((t) => t.status === "termine" || t.status === "valide").length;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <h1 className="font-heading font-bold text-navy text-2xl">Mes Tâches & Missions</h1>
          <p className="text-gray-500 text-sm mt-1">
            Les missions qui vous ont été confiées par le Bureau et vos responsables de commission
          </p>
        </div>

        {/* Badges de synthèse */}
        <div className="flex items-center gap-3">
          <div className="bg-cyan-50 border border-cyan/20 px-3.5 py-1.5 rounded-xl text-center">
            <span className="text-xs text-navy/70 block">En attente</span>
            <span className="font-heading font-bold text-navy text-lg">{pendingCount}</span>
          </div>
          <div className="bg-green-50 border border-green/20 px-3.5 py-1.5 rounded-xl text-center">
            <span className="text-xs text-green-700 block">Accomplies</span>
            <span className="font-heading font-bold text-green-800 text-lg">{completedCount}</span>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
            activeTab === "all" ? "bg-navy text-white" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          Toutes ({tasks.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("en_cours")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
            activeTab === "en_cours" ? "bg-navy text-white" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          À faire / En cours ({pendingCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("termine")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
            activeTab === "termine" ? "bg-navy text-white" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          Terminées ({completedCount})
        </button>
      </div>

      {/* Liste des tâches */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center max-w-md mx-auto">
          <div className="w-12 h-12 rounded-full bg-cyan/15 text-cyan flex items-center justify-center mx-auto mb-3">
            ✓
          </div>
          <h3 className="font-heading font-bold text-navy text-base">Aucune tâche en attente</h3>
          <p className="text-gray-400 text-xs mt-1">
            {activeTab === "all"
              ? "Vous n'avez actuellement aucune tâche assignée. Continuez votre bel engagement !"
              : "Aucune tâche dans cette catégorie."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((task) => {
            const isLoading = loadingId === task.id;
            const isDone = task.status === "termine" || task.status === "valide";

            return (
              <div
                key={task.id}
                className={`bg-white rounded-xl border p-5 transition-all shadow-xs ${
                  isDone ? "border-green-100 bg-green-50/20" : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${priorityBadges[task.priority]}`}>
                        Priorité {task.priority}
                      </span>
                      {task.commission && (
                        <span className="text-[11px] font-medium text-navy bg-cyan-light px-2.5 py-0.5 rounded-full border border-cyan/20">
                          {task.commission}
                        </span>
                      )}
                      {task.status === "valide" && (
                        <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full">
                          Validée par le Comité ✓
                        </span>
                      )}
                    </div>

                    <h3 className={`font-heading font-bold text-navy text-base ${isDone ? "line-through text-gray-400" : ""}`}>
                      {task.title}
                    </h3>

                    {task.description && (
                      <p className="text-xs text-gray-600 bg-gray-50/70 p-3 rounded-lg leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 pt-1">
                      {task.due_date && (
                        <span>
                          Échéance : <strong>{new Date(task.due_date).toLocaleDateString("fr-FR")}</strong>
                        </span>
                      )}
                      {task.activity && (
                        <span className="text-cyan font-medium">
                          Activité liée : {task.activity.title}
                        </span>
                      )}
                      {task.assigned_by_admin && (
                        <span>
                          Assignée par : {task.assigned_by_admin.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Boutons d'état pour le membre */}
                  <div className="flex items-center gap-2 pt-2 md:pt-0">
                    {task.status === "a_faire" && (
                      <button
                        type="button"
                        onClick={() => updateStatus(task.id, "en_cours")}
                        disabled={isLoading}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-cyan text-navy hover:bg-cyan/90 cursor-pointer disabled:opacity-50"
                      >
                        {isLoading ? <Spinner className="w-3 h-3" /> : "Démarrer (En cours)"}
                      </button>
                    )}

                    {task.status === "en_cours" && (
                      <button
                        type="button"
                        onClick={() => updateStatus(task.id, "termine")}
                        disabled={isLoading}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-green-600 text-white hover:bg-green-700 cursor-pointer disabled:opacity-50"
                      >
                        {isLoading ? <Spinner className="w-3 h-3" /> : "Marquer comme terminée ✓"}
                      </button>
                    )}

                    {task.status === "termine" && (
                      <button
                        type="button"
                        onClick={() => updateStatus(task.id, "en_cours")}
                        disabled={isLoading}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-100 cursor-pointer"
                        title="Rouvrir la tâche"
                      >
                        Rouvrir
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
