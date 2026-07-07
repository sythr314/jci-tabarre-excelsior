"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

export function ConfirmDuesButton({ memberId, year }: { memberId: string; year: number }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    const res = await fetch(`/api/admin/members/${memberId}/dues`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year }),
    });
    if (res.ok) setDone(true);
    setLoading(false);
  }

  if (done) return <span className="text-success text-xs font-medium">✓ Confirmée</span>;

  return (
    <Button size="sm" variant="secondary" onClick={handleConfirm} disabled={loading}>
      {loading ? <Spinner /> : `Confirmer ${year}`}
    </Button>
  );
}
