"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Member } from "@/lib/supabase/types";

export function ProfileForm({ member }: { member: Member }) {
  const router = useRouter();
  const [phone, setPhone] = useState(member.phone ?? "");
  const [profession, setProfession] = useState(member.profession ?? "");
  const [commune, setCommune] = useState(member.commune ?? "");
  const [educationLevel, setEducationLevel] = useState(member.education_level ?? "");
  const [bio, setBio] = useState(member.bio ?? "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/member/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone.trim() || null,
          profession: profession.trim() || null,
          commune: commune.trim() || null,
          education_level: educationLevel.trim() || null,
          bio: bio.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Une erreur est survenue");
      } else {
        setSuccess(true);
        router.refresh();
        setTimeout(() => setSuccess(false), 4000);
      }
    } catch {
      setError("Impossible de joindre le serveur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {success && (
        <div className="p-4 rounded-xl bg-success/10 border border-success/30 text-success text-sm flex items-center gap-2">
          <span>✓</span> Profil mis à jour avec succès !
        </div>
      )}
      {error && (
        <div className="p-4 rounded-xl bg-error/10 border border-error/30 text-error text-sm flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1 font-heading">
            Téléphone / WhatsApp
          </label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+509 3123-4567"
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan/40"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1 font-heading">
            Profession / Activité
          </label>
          <input
            type="text"
            value={profession}
            onChange={(e) => setProfession(e.target.value)}
            placeholder="Ex : Ingénieur, Juriste, Entrepreneur..."
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan/40"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1 font-heading">
            Commune de résidence
          </label>
          <input
            type="text"
            value={commune}
            onChange={(e) => setCommune(e.target.value)}
            placeholder="Ex : Tabarre, Pétion-Ville, Delmas..."
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan/40"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1 font-heading">
            Niveau d'études
          </label>
          <select
            value={educationLevel}
            onChange={(e) => setEducationLevel(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan/40 bg-white"
          >
            <option value="">Sélectionner</option>
            <option value="Baccalauréat">Baccalauréat</option>
            <option value="Licence / Bac+3">Licence / Bac+3</option>
            <option value="Master / Bac+5">Master / Bac+5</option>
            <option value="Doctorat">Doctorat</option>
            <option value="Autre formation">Autre formation</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1 font-heading">
          Biographie & Parcours
        </label>
        <textarea
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Décrivez vos compétences, votre engagement et vos aspirations au sein de la JCI..."
          className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan/40"
        />
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-lg bg-navy text-white text-sm font-semibold hover:bg-navy/90 transition-colors font-heading disabled:opacity-50"
        >
          {loading ? "Enregistrement..." : "Enregistrer les modifications"}
        </button>
      </div>
    </form>
  );
}
