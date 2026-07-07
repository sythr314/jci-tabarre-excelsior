"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils/cn";

const inputClass = "w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent";

export function ActivationForm({ token, email }: { token: string; email: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const confirm  = (form.elements.namedItem("confirm") as HTMLInputElement).value;

    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/accept-invitation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Une erreur est survenue.");
      setLoading(false);
      return;
    }

    // Connexion automatique après activation
    const supabase = createClient();
    await supabase.auth.signInWithPassword({ email, password });
    router.push("/espace-membre/tableau-de-bord");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div role="alert" className="bg-error/10 border border-error/20 rounded-lg p-3 text-sm text-error">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="email-display" className="block text-sm font-medium text-navy mb-1">Email</label>
        <input id="email-display" type="email" value={email} readOnly
          className={cn(inputClass, "bg-gray-50 text-gray-500 cursor-not-allowed")} />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-navy mb-1">Mot de passe <span aria-hidden="true">*</span></label>
        <input id="password" name="password" type="password" required minLength={8}
          placeholder="Minimum 8 caractères" className={inputClass} />
      </div>
      <div>
        <label htmlFor="confirm" className="block text-sm font-medium text-navy mb-1">Confirmer le mot de passe <span aria-hidden="true">*</span></label>
        <input id="confirm" name="confirm" type="password" required className={inputClass} />
      </div>
      <Button type="submit" variant="primary" className="w-full" disabled={loading}>
        {loading ? <><Spinner className="text-navy" /> Activation...</> : "Activer mon compte"}
      </Button>
    </form>
  );
}
