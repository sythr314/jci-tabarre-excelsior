"use client";

import { useState } from "react";
import {
  TOYP_CATEGORIES,
  DEFAULT_LOCAL_ORGANIZATIONS,
} from "@/lib/data/national";

export function ToypNominationForm() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const fd = new FormData(form);

    const payload = {
      nomineeFullName: String(fd.get("nomineeFullName") || ""),
      nomineeEmail: String(fd.get("nomineeEmail") || ""),
      nomineePhone: String(fd.get("nomineePhone") || ""),
      nomineeAge: Number(fd.get("nomineeAge") || 25),
      nomineeCity: String(fd.get("nomineeCity") || ""),
      category: String(fd.get("category") || ""),
      localOrgSlug: String(fd.get("localOrgSlug") || "tabarre-excelsior"),
      nominatorName: String(fd.get("nominatorName") || ""),
      nominatorEmail: String(fd.get("nominatorEmail") || ""),
      biography: String(fd.get("biography") || ""),
      achievements: String(fd.get("achievements") || ""),
      supportingUrl: String(fd.get("supportingUrl") || ""),
    };

    try {
      const res = await fetch("/api/toyp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur lors de l'envoi du dossier TOYP.");
        setLoading(false);
        return;
      }
      setSubmitted(true);
      form.reset();
    } catch {
      setError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center">
        <div className="text-4xl mb-3">🏆</div>
        <h3 className="font-heading font-bold text-navy text-xl mb-2">
          Dossier de nomination JCI TOYP enregistré !
        </h3>
        <p className="text-sm text-gray-600 max-w-lg mx-auto mb-5">
          Merci d&apos;avoir soumis cette candidature au programme national{" "}
          <strong>JCI TOYP (Ten Outstanding Young Persons)</strong>. Le comité national et
          l&apos;OLM parraine examineront le dossier.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="px-4 py-2 rounded-lg bg-navy text-white text-xs font-heading font-semibold hover:bg-navy/90"
        >
          Soumettre une autre nomination
        </button>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan";

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-5"
    >
      <div className="border-b border-gray-100 pb-4">
        <h3 className="font-heading font-bold text-xl text-navy">
          Formulaire Officiel de Nomination — JCI TOYP Haïti
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          Proposez un(e) jeune citoyen(ne) d&apos;exception âgé(e) de 18 à 40 ans dont l&apos;action
          transforme positivement sa communauté.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg p-3.5">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-navy mb-1">
            Nom complet du candidat (Nominé) *
          </label>
          <input
            name="nomineeFullName"
            required
            minLength={3}
            placeholder="Ex : Dr. Jean-Marc Benoît"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-navy mb-1">
            Catégorie officielle TOYP (1 à 10) *
          </label>
          <select name="category" required className={inputClass} defaultValue="">
            <option value="" disabled>
              Sélectionnez l&apos;une des 10 catégories…
            </option>
            {TOYP_CATEGORIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-navy mb-1">
            Email du candidat *
          </label>
          <input name="nomineeEmail" type="email" required className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-navy mb-1">
            Téléphone du candidat
          </label>
          <input
            name="nomineePhone"
            type="tel"
            placeholder="+509 …"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-navy mb-1">
            Âge (18–40 ans) *
          </label>
          <input
            name="nomineeAge"
            type="number"
            min={18}
            max={40}
            defaultValue={28}
            required
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-navy mb-1">
            Ville / Commune d&apos;action *
          </label>
          <input
            name="nomineeCity"
            required
            placeholder="Ex : Tabarre, Cap-Haïtien, Les Cayes…"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-navy mb-1">
            OLM Parraine souhaitée *
          </label>
          <select
            name="localOrgSlug"
            required
            defaultValue="tabarre-excelsior"
            className={inputClass}
          >
            {DEFAULT_LOCAL_ORGANIZATIONS.map((org) => (
              <option key={org.slug} value={org.slug}>
                {org.name} ({org.city})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
        <div>
          <label className="block text-xs font-semibold text-navy mb-1">
            Votre nom (Nominateur / Parrain) *
          </label>
          <input name="nominatorName" required className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-navy mb-1">
            Votre email *
          </label>
          <input name="nominatorEmail" type="email" required className={inputClass} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-navy mb-1">
          Biographie synthétique du candidat *
        </label>
        <textarea
          name="biography"
          rows={3}
          required
          minLength={20}
          placeholder="Parcours académique, professionnel ou citoyen du candidat…"
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-navy mb-1">
          Réalisations majeures & impact communautaire mesurable *
        </label>
        <textarea
          name="achievements"
          rows={4}
          required
          minLength={20}
          placeholder="Décrivez les résultats concrets, le nombre de bénéficiaires et pourquoi ce candidat incarne les valeurs du Credo JCI…"
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-navy mb-1">
          Lien vers un dossier de preuves / LinkedIn / Article (optionnel)
        </label>
        <input
          name="supportingUrl"
          type="url"
          placeholder="https://…"
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl bg-navy text-white font-heading font-semibold text-sm hover:bg-navy/90 transition-colors disabled:opacity-50"
      >
        {loading ? "Transmission du dossier TOYP…" : "Soumettre la nomination JCI TOYP"}
      </button>
    </form>
  );
}
