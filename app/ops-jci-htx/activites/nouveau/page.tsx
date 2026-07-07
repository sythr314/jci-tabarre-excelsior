"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

export default function NouvelleActivitePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const data = new FormData(form);

    const capacityRaw = data.get("capacity") as string;
    const body: Record<string, unknown> = {
      title: data.get("title"),
      type: data.get("type"),
      activity_date: data.get("activity_date"),
      status: data.get("status"),
      location: data.get("location") || undefined,
      description: data.get("description") || undefined,
      registration_link: data.get("registration_link") || undefined,
      google_sheet_id: data.get("google_sheet_id") || undefined,
      sheet_email_column: data.get("sheet_email_column") || "Email",
      registration_deadline: data.get("registration_deadline") || undefined,
    };
    if (capacityRaw) body.capacity = parseInt(capacityRaw, 10);

    try {
      const res = await fetch("/api/admin/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Une erreur est survenue");
        return;
      }
      router.push(`/ops-jci-htx/activites/${json.id}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <Link
          href="/ops-jci-htx/activites"
          className="text-sm text-gray-400 hover:text-gray-600 mb-3 inline-block"
        >
          ← Retour aux activités
        </Link>
        <h1 className="font-heading font-bold text-navy text-2xl">Nouvelle activité</h1>
        <p className="text-gray-500 text-sm mt-1">Créez une activité ou formation pour la locale</p>
      </div>

      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {/* Titre */}
        <div className="space-y-1.5">
          <label htmlFor="title" className="text-sm font-medium text-gray-700">
            Titre <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            minLength={2}
            placeholder="Ex : Formation Leadership JCI 2026"
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30"
          />
        </div>

        {/* Type + Statut */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="type" className="text-sm font-medium text-gray-700">
              Type <span className="text-red-500">*</span>
            </label>
            <select
              id="type"
              name="type"
              required
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30"
            >
              <option value="activite">Activité</option>
              <option value="formation">Formation</option>
              <option value="reunion">Réunion</option>
              <option value="initiative">Initiative</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="status" className="text-sm font-medium text-gray-700">
              Statut <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              name="status"
              required
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30"
            >
              <option value="upcoming">À venir</option>
              <option value="ongoing">En cours</option>
              <option value="completed">Terminée</option>
              <option value="cancelled">Annulée</option>
            </select>
          </div>
        </div>

        {/* Date + Date limite inscription */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="activity_date" className="text-sm font-medium text-gray-700">
              Date de l&apos;activité <span className="text-red-500">*</span>
            </label>
            <input
              id="activity_date"
              name="activity_date"
              type="datetime-local"
              required
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="registration_deadline" className="text-sm font-medium text-gray-700">
              Date limite inscription
            </label>
            <input
              id="registration_deadline"
              name="registration_deadline"
              type="datetime-local"
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30"
            />
          </div>
        </div>

        {/* Lieu + Capacité */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="location" className="text-sm font-medium text-gray-700">
              Lieu
            </label>
            <input
              id="location"
              name="location"
              type="text"
              placeholder="Ex : Tabarre, Haïti"
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="capacity" className="text-sm font-medium text-gray-700">
              Capacité (participants)
            </label>
            <input
              id="capacity"
              name="capacity"
              type="number"
              min={1}
              placeholder="Ex : 50"
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label htmlFor="description" className="text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            placeholder="Décrivez l'objectif et le programme de l'activité…"
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30 resize-none"
          />
        </div>

        {/* Lien inscription */}
        <div className="space-y-1.5">
          <label htmlFor="registration_link" className="text-sm font-medium text-gray-700">
            Lien d&apos;inscription (URL)
          </label>
          <input
            id="registration_link"
            name="registration_link"
            type="url"
            placeholder="https://docs.google.com/forms/…"
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30"
          />
        </div>

        {/* Google Sheets */}
        <div className="border border-gray-100 rounded-xl p-4 space-y-4 bg-gray-50">
          <p className="text-sm font-medium text-gray-700">Import présences (Google Sheets)</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="google_sheet_id" className="text-xs font-medium text-gray-600">
                ID du Google Sheet
              </label>
              <input
                id="google_sheet_id"
                name="google_sheet_id"
                type="text"
                placeholder="1BxiMVs0XRA…"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30"
              />
              <p className="text-xs text-gray-400">Trouvez l&apos;ID dans l&apos;URL du Sheet</p>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="sheet_email_column" className="text-xs font-medium text-gray-600">
                Nom de la colonne email
              </label>
              <input
                id="sheet_email_column"
                name="sheet_email_column"
                type="text"
                defaultValue="Email"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button type="submit" variant="primary" disabled={loading} className="flex-1">
            {loading ? <><Spinner className="text-navy" /> Création…</> : "Créer l'activité"}
          </Button>
          <Link
            href="/ops-jci-htx/activites"
            className="flex-1 inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
