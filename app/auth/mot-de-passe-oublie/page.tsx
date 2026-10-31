"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

function MotDePasseOublieForm() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const isAdmin = from === "admin";

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const siteUrl = window.location.origin;
    const redirectTo = `${siteUrl}/auth/reinitialiser-mot-de-passe${isAdmin ? "?from=admin" : ""}`;

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    setLoading(false);

    if (resetError) {
      console.error("Reset password error:", resetError);
      setError("Impossible d'envoyer l'e-mail de réinitialisation. Veuillez réessayer.");
      return;
    }

    setSubmitted(true);
  }

  const backLink = isAdmin ? "/ops-jci-htx/login" : "/espace-membre/connexion";
  const backLabel = isAdmin ? "Retour à la connexion Admin" : "Retour à la connexion Membre";

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${isAdmin ? "bg-navy" : "bg-gray-50"}`}>
      <div className={`w-full max-w-md rounded-2xl p-8 border ${
        isAdmin ? "bg-white/5 border-white/10 text-white" : "bg-white border-gray-200 text-navy shadow-sm"
      }`}>
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-cyan/15 text-cyan mb-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="font-heading font-bold text-2xl">Mot de passe oublié</h1>
          <p className={`text-sm mt-1 ${isAdmin ? "text-white/60" : "text-gray-500"}`}>
            Entrez votre adresse e-mail pour recevoir les instructions de réinitialisation.
          </p>
        </div>

        {submitted ? (
          <div className="space-y-6 text-center">
            <div className="bg-success/10 border border-success/20 rounded-xl p-4 text-sm text-success">
              <p className="font-semibold mb-1">E-mail envoyé avec succès !</p>
              <p className="text-xs text-success/90">
                Si un compte JCI Tabarre Excelsior est associé à <strong>{email}</strong>, un lien sécurisé vous a été transmis. Pensez à vérifier vos courriers indésirables (spams).
              </p>
            </div>
            <Link
              href={backLink}
              className="inline-block text-cyan text-sm font-semibold hover:underline"
            >
              ← {backLabel}
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
              <label htmlFor="email" className={`block text-sm font-medium mb-1 ${isAdmin ? "text-white/70" : "text-navy"}`}>
                Adresse e-mail
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="votre.email@jci-tabarre.ht"
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
                  <Spinner className="text-navy" /> Envoi du lien...
                </>
              ) : (
                "Envoyer le lien de réinitialisation"
              )}
            </Button>

            <div className="text-center pt-2">
              <Link
                href={backLink}
                className={`text-xs hover:underline ${isAdmin ? "text-white/50 hover:text-white" : "text-gray-500 hover:text-navy"}`}
              >
                ← {backLabel}
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function MotDePasseOubliePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><Spinner className="text-navy" /></div>}>
      <MotDePasseOublieForm />
    </Suspense>
  );
}
