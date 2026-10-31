"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/Spinner";
import type { ActivityStatus } from "@/lib/supabase/types";

interface ActivityStatusActionsProps {
  activityId: string;
  currentStatus: ActivityStatus;
}

export function ActivityStatusActions({ activityId, currentStatus }: ActivityStatusActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(newStatus: ActivityStatus) {
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/activities/${activityId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error ?? "Erreur lors du changement de statut");
        return;
      }

      router.refresh();
    } catch {
      setError("Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {error && (
        <p className="text-xs text-error font-medium">{error}</p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {currentStatus !== "completed" && (
          <button
            type="button"
            onClick={() => updateStatus("completed")}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors disabled:opacity-50 cursor-pointer"
            title="Archiver l'activité comme terminée"
          >
            {loading ? <Spinner className="w-3 h-3" /> : (
              <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            )}
            Archiver (Terminée)
          </button>
        )}

        {currentStatus !== "ongoing" && currentStatus !== "completed" && (
          <button
            type="button"
            onClick={() => updateStatus("ongoing")}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-50 hover:bg-green-100 text-green-700 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Spinner className="w-3 h-3" /> : (
              <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              </svg>
            )}
            Passer En cours
          </button>
        )}

        {currentStatus !== "upcoming" && (
          <button
            type="button"
            onClick={() => updateStatus("upcoming")}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-50 hover:bg-cyan-100 text-navy transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Spinner className="w-3 h-3" /> : "Repasser À venir"}
          </button>
        )}

        {currentStatus !== "cancelled" && (
          <button
            type="button"
            onClick={() => {
              if (confirm("Êtes-vous certain de vouloir annuler cette activité ?")) {
                updateStatus("cancelled");
              }
            }}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Annuler l&apos;activité
          </button>
        )}
      </div>
    </div>
  );
}
