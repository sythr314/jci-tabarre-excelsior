"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

const inputClass = "w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent";

export function MemberLoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const email    = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      if (authError.message?.includes("Invalid login credentials")) {
        setError("Email ou mot de passe incorrect.");
      } else if (authError.message?.toLowerCase().includes("fetch")) {
        setError("Erreur de connexion au serveur d'authentification. Veuillez vérifier votre connexion.");
      } else {
        setError(authError.message || "Email ou mot de passe incorrect.");
      }
      setLoading(false);
      return;
    }

    router.push("/espace-membre/tableau-de-bord");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div role="alert" className="bg-error/10 border border-error/20 rounded-lg p-3 text-sm text-error">{error}</div>
      )}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-navy mb-1">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required className={inputClass} />
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="password" className="block text-sm font-medium text-navy">Mot de passe</label>
          <Link
            href="/auth/mot-de-passe-oublie?from=member"
            className="text-xs text-cyan hover:underline transition-colors"
          >
            Mot de passe oublié ?
          </Link>
        </div>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={inputClass} />
      </div>
      <Button type="submit" variant="primary" className="w-full" disabled={loading}>
        {loading ? <><Spinner className="text-navy" /> Connexion...</> : "Se connecter"}
      </Button>
    </form>
  );
}
