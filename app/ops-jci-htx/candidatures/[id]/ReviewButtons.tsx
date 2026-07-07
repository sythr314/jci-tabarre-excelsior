"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

interface ReviewButtonsProps {
  applicationId: string;
  applicantName: string;
}

export function ReviewButtons({ applicationId, applicantName }: ReviewButtonsProps) {
  const router = useRouter();
  const [isApproving, setIsApproving] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleApprove() {
    if (!confirm(`Approuver la candidature de ${applicantName} et envoyer l'invitation par email ?`)) return;
    setIsApproving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/applications/${applicationId}/approve`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Une erreur est survenue");
        return;
      }
      router.push("/ops-jci-htx/candidatures");
      router.refresh();
    } finally {
      setIsApproving(false);
    }
  }

  async function handleReject() {
    setIsRejecting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/applications/${applicationId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: rejectNote.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Une erreur est survenue");
        return;
      }
      router.push("/ops-jci-htx/candidatures");
      router.refresh();
    } finally {
      setIsRejecting(false);
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div role="alert" className="bg-error/10 border border-error/20 rounded-lg px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      {!showRejectForm ? (
        <div className="flex gap-3">
          <Button
            variant="primary"
            onClick={handleApprove}
            disabled={isApproving}
            className="flex-1"
          >
            {isApproving ? <><Spinner className="text-white" /> Traitement…</> : "✓ Approuver et inviter"}
          </Button>
          <Button
            variant="ghost"
            onClick={() => setShowRejectForm(true)}
            className="flex-1 border border-error/30 text-error hover:bg-error/5"
          >
            ✕ Rejeter
          </Button>
        </div>
      ) : (
        <div className="bg-error/5 border border-error/20 rounded-xl p-5 space-y-4">
          <p className="text-sm font-medium text-navy">Motif du rejet <span className="text-gray-400 font-normal">(optionnel — envoyé au candidat)</span></p>
          <textarea
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            rows={3}
            placeholder="Ex : Profil ne correspondant pas aux critères actuels d'admission…"
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-error/30 resize-none"
          />
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => setShowRejectForm(false)}
              className="flex-1"
              disabled={isRejecting}
            >
              Annuler
            </Button>
            <Button
              onClick={handleReject}
              disabled={isRejecting}
              className="flex-1 bg-error text-white hover:bg-error/90"
            >
              {isRejecting ? <><Spinner className="text-white" /> Traitement…</> : "Confirmer le rejet"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
