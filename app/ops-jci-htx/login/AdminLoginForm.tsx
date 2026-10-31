"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils/cn";

const inputClass = cn(
  "w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white text-sm",
  "placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent"
);

export function AdminLoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (attempts >= 5) {
      setError("Trop de tentatives. Veuillez patienter avant de réessayer.");
      return;
    }

    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setAttempts((n) => n + 1);
      setError("Identifiants incorrects.");
      setLoading(false);
      return;
    }

    // Vérifier que c'est bien un admin (double vérification côté client)
    const { data: adminCheck } = await supabase
      .from("admin_users")
      .select("role, is_active")
      .eq("email", email)
      .single();

    if (!adminCheck || !adminCheck.is_active) {
      await supabase.auth.signOut();
      setError("Accès non autorisé.");
      setLoading(false);
      return;
    }

    router.push("/ops-jci-htx/dashboard");
    router.refresh();
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
      <h1 className="font-heading font-bold text-white text-xl mb-6">Connexion Administrateur</h1>

      {error && (
        <div role="alert" className="bg-error/10 border border-error/20 rounded-lg p-3 mb-4 text-sm text-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm text-white/60 mb-1">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={inputClass}
            placeholder="admin@jci-tabarre.ht"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="password" className="block text-sm text-white/60">Mot de passe</label>
            <Link
              href="/auth/mot-de-passe-oublie?from=admin"
              className="text-xs text-cyan hover:underline transition-colors"
            >
              Mot de passe oublié ?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className={inputClass}
            placeholder="••••••••"
          />
        </div>
        <Button
          type="submit"
          variant="primary"
          className="w-full mt-2"
          disabled={loading || attempts >= 5}
        >
          {loading ? <><Spinner className="text-navy" /> Connexion...</> : "Se connecter"}
        </Button>
      </form>
    </div>
  );
}
