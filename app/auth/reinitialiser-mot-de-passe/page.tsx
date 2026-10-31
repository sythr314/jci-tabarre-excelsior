"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

function ReinitialiserMotDePasseForm() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const isAdmin = from === "admin";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      // Écoute active pour récupérer le token du hash URL (#access_token=...)
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Le mot de passe doit comporter au moins 8 caractères.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (updateError) {
      console.error("Update password error:", updateError);
      setError("Impossible de mettre à jour le mot de passe. Le lien a peut-être expiré.");
      return;
    }

    setSuccess(true);
  }

  const loginLink = isAdmin ? "/ops-jci-htx/login" : "/espace-membre/connexion";

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${isAdmin ? "bg-navy" : "bg-gray-50"}`}>
      <div className={`w-full max-w-md rounded-2xl p-8 border ${
        isAdmin ? "bg-white/5 border-white/10 text-white" : "bg-white border-gray-200 text-navy shadow-sm"
      }`}>
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-cyan/15 text-cyan mb-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="font-heading font-bold text-2xl">Nouveau mot de passe</h1>
          <p className={`text-sm mt-1 ${isAdmin ? "text-white/60" : "text-gray-500"}`}>
            Définissez votre nouveau mot de passe sécurisé.
          </p>
        </div>

        {success ? (
          <div className="space-y-6 text-center">
            <div className="bg-success/10 border border-success/20 rounded-xl p-4 text-sm text-success">
              <p className="font-semibold mb-1">Mot de passe réinitialisé !</p>
              <p className="text-xs text-success/90">
                Votre mot de passe a été mis à jour avec succès. Vous pouvez maintenant vous connecter.
              </p>
            </div>
            <Link
              href={loginLink}
              className="inline-block bg-cyan text-navy font-semibold px-6 py-2.5 rounded-lg text-sm hover:bg-cyan/90 transition-colors"
            >
              Se connecter maintenant →
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div role="alert" className="bg-error/10 border border-error/20 rounded-lg p-3 text-sm text-error">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="password" className={`block text-sm font-medium mb-1 ${isAdmin ? "text-white/70" : "text-navy"}`}>
                Nouveau mot de passe (min. 8 caractères)
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="••••••••"
                className={`w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan ${
                  isAdmin
                    ? "border-white/10 bg-white/5 text-white placeholder:text-white/30"
                    : "border-gray-200 bg-white text-navy placeholder:text-gray-400"
                }`}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className={`block text-sm font-medium mb-1 ${isAdmin ? "text-white/70" : "text-navy"}`}>
                Confirmer le mot de passe
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="••••••••"
                className={`w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan ${
                  isAdmin
                    ? "border-white/10 bg-white/5 text-white placeholder:text-white/30"
                    : "border-gray-200 bg-white text-navy placeholder:text-gray-400"
                }`}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner className="text-navy" /> Modification...
                </>
              ) : (
                "Enregistrer le nouveau mot de passe"
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ReinitialiserMotDePassePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><Spinner className="text-navy" /></div>}>
      <ReinitialiserMotDePasseForm />
    </Suspense>
  );
}
