"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

type ActivityData = {
  id: string;
  title: string;
  type: string;
  activity_date: string;
  status: string;
  location: string | null;
  description: string | null;
  capacity: number | null;
  registration_link: string | null;
  google_sheet_id: string | null;
  sheet_email_column: string | null;
  registration_deadline: string | null;
};

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 16);
}

export default function ModifierActivitePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();

  const [activity, setActivity] = useState<ActivityData | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/activities/${id}`)
      .then((r) => r.json())
      .then((data) => setActivity(data))
      .catch(() => setError("Impossible de charger l'activité"))
      .finally(() => setLoadingData(false));
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const form = e.currentTarget;
    const data = new FormData(form);
    const capacityRaw = data.get("capacity") as string;

    const body: Record<string, unknown> = {
      title: data.get("title"),
      type: data.get("type"),
      activity_date: data.get("activity_date"),
      status: data.get("status"),
      location: data.get("location") || null,
      description: data.get("description") || null,
      registration_link: data.get("registration_link") || "",
      google_sheet_id: data.get("google_sheet_id") || null,
      sheet_email_column: data.get("sheet_email_column") || "Email",
      registration_deadline: data.get("registration_deadline") || null,
      capacity: capacityRaw ? parseInt(capacityRaw, 10) : null,
    };

    try {
      const res = await fetch(`/api/admin/activities/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Une erreur est survenue");
        return;
      }
      router.push(`/ops-jci-htx/activites/${id}`);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Supprimer définitivement cette activité et toutes ses présences ?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/activities/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json();
        setError(json.error ?? "Erreur lors de la suppression");
        return;
      }
      router.push("/ops-jci-htx/activites");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  if (loadingData) {
    return (
      <div className="p-8 flex items-center gap-3 text-gray-400">
        <Spinner /> Chargement…
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="p-8">
        <p className="text-red-600">Activité introuvable.</p>
        <Link href="/ops-jci-htx/activites" className="text-cyan text-sm hover:underline mt-2 inline-block">
          ← Retour aux activités
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <Link
          href={`/ops-jci-htx/activites/${id}`}
          className="text-sm text-gray-400 hover:text-gray-600 mb-3 inline-block"
        >
          ← Retour à l&apos;activité
        </Link>
        <h1 className="font-heading font-bold text-navy text-2xl">Modifier l&apos;activité</h1>
      </div>

      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
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
            defaultValue={activity.title}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="type" className="text-sm font-medium text-gray-700">Type <span className="text-red-500">*</span></label>
            <select
              id="type"
              name="type"
              required
              defaultValue={activity.type}
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
            <label htmlFor="status" className="text-sm font-medium text-gray-700">Statut <span className="text-red-500">*</span></label>
            <select
              id="status"
              name="status"
              required
              defaultValue={activity.status}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30"
            >
              <option value="upcoming">À venir</option>
              <option value="ongoing">En cours</option>
              <option value="completed">Terminée</option>
              <option value="cancelled">Annulée</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="activity_date" className="text-sm font-medium text-gray-700">Date <span className="text-red-500">*</span></label>
            <input
              id="activity_date"
              name="activity_date"
              type="datetime-local"
              required
              defaultValue={toDatetimeLocal(activity.activity_date)}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="registration_deadline" className="text-sm font-medium text-gray-700">Limite inscription</label>
            <input
              id="registration_deadline"
              name="registration_deadline"
              type="datetime-local"
              defaultValue={toDatetimeLocal(activity.registration_deadline)}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="location" className="text-sm font-medium text-gray-700">Lieu</label>
            <input
              id="location"
              name="location"
              type="text"
              defaultValue={activity.location ?? ""}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="capacity" className="text-sm font-medium text-gray-700">Capacité</label>
            <input
              id="capacity"
              name="capacity"
              type="number"
              min={1}
              defaultValue={activity.capacity ?? ""}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="description" className="text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={activity.description ?? ""}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30 resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="registration_link" className="text-sm font-medium text-gray-700">Lien d&apos;inscription</label>
          <input
            id="registration_link"
            name="registration_link"
            type="url"
            defaultValue={activity.registration_link ?? ""}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30"
          />
        </div>

        <div className="border border-gray-100 rounded-xl p-4 space-y-4 bg-gray-50">
          <p className="text-sm font-medium text-gray-700">Import présences (Google Sheets)</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="google_sheet_id" className="text-xs font-medium text-gray-600">ID du Google Sheet</label>
              <input
                id="google_sheet_id"
                name="google_sheet_id"
                type="text"
                defaultValue={activity.google_sheet_id ?? ""}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="sheet_email_column" className="text-xs font-medium text-gray-600">Colonne email</label>
              <input
                id="sheet_email_column"
                name="sheet_email_column"
                type="text"
                defaultValue={activity.sheet_email_column ?? "Email"}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" variant="primary" disabled={saving} className="flex-1">
            {saving ? <><Spinner className="text-navy" /> Enregistrement…</> : "Enregistrer les modifications"}
          </Button>
          <Link
            href={`/ops-jci-htx/activites/${id}`}
            className="flex-1 inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Annuler
          </Link>
        </div>
      </form>

      {/* Zone danger */}
      <div className="mt-8 bg-red-50 border border-red-200 rounded-2xl p-6">
        <h3 className="font-heading font-bold text-red-700 mb-2">Zone de danger</h3>
        <p className="text-sm text-red-600 mb-4">
          Supprimer cette activité effacera aussi toutes les présences associées. Cette action est irréversible.
        </p>
        <Button
          onClick={handleDelete}
          disabled={deleting}
          className="bg-red-600 text-white hover:bg-red-700"
          size="sm"
        >
          {deleting ? <><Spinner className="text-white" /> Suppression…</> : "Supprimer l'activité"}
        </Button>
      </div>
    </div>
  );
}
