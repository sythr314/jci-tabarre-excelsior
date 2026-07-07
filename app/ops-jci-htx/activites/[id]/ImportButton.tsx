"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

interface ImportResult {
  imported: number;
  matched: number;
  external: number;
  skipped: number;
}

export function ImportButton({ activityId }: { activityId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  async function handleImport() {
    if (!confirm("Lancer l'import des présences depuis Google Sheets ?")) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/admin/activities/${activityId}/import`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erreur lors de l'import");
        return;
      }
      setResult(data);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button onClick={handleImport} disabled={loading} variant="secondary" size="sm">
        {loading ? <><Spinner className="text-white" /> Import en cours…</> : "↓ Importer depuis Google Sheets"}
      </Button>

      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-800 space-y-1">
          <p className="font-medium">Import terminé — {result.imported} enregistrements traités</p>
          <ul className="text-xs text-green-700 space-y-0.5">
            <li>✓ {result.matched} membre{result.matched !== 1 ? "s" : ""} identifié{result.matched !== 1 ? "s" : ""}</li>
            <li>✓ {result.external} participant{result.external !== 1 ? "s" : ""} externe{result.external !== 1 ? "s" : ""}</li>
            {result.skipped > 0 && (
              <li className="text-amber-600">⚠ {result.skipped} ligne{result.skipped !== 1 ? "s" : ""} ignorée{result.skipped !== 1 ? "s" : ""} (email manquant)</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
