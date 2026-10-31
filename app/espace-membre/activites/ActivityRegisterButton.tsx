"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  activityId: string;
  isRegistered: boolean;
  isPast: boolean;
}

export function ActivityRegisterButton({ activityId, isRegistered: initialRegistered, isPast }: Props) {
  const [registered, setRegistered] = useState(initialRegistered);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (isPast) {
    return (
      <span className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-500 font-medium">
        {registered ? "✓ Présence enregistrée" : "Activité passée"}
      </span>
    );
  }

  async function handleToggle() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/member/activities/${activityId}/register`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur");
      } else {
        setRegistered(data.registered);
        router.refresh();
      }
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 font-heading ${
          registered
            ? "bg-success/10 text-success border border-success/30 hover:bg-error/10 hover:text-error hover:border-error/30"
            : "bg-cyan text-navy hover:bg-cyan/90"
        } ${loading ? "opacity-50 cursor-wait" : ""}`}
      >
        {loading
          ? "..."
          : registered
          ? "✓ Inscrit(e) (Annuler)"
          : "S'inscrire"}
      </button>
      {error && <span className="text-xs text-error">{error}</span>}
    </div>
  );
}
