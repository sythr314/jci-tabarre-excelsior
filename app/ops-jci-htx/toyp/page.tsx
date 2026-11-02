import { createServiceClient } from "@/lib/supabase/server";
import { TOYP_CATEGORIES } from "@/lib/data/national";
import Link from "next/link";

export const dynamic = "force-dynamic";

const CATEGORY_MAP = Object.fromEntries(TOYP_CATEGORIES.map((c) => [c.code, c.title]));

interface ToypRow {
  id: string;
  nominee_full_name: string;
  nominee_email: string;
  nominee_age: number;
  nominee_city: string;
  category: string;
  local_org_slug: string;
  nominator_name: string;
  achievements: string;
  status: string;
  created_at: string;
}

export default async function AdminToypPage() {
  const supabase = createServiceClient();

  const { data: tableRows } = await supabase
    .from("toyp_nominations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  let rows: ToypRow[] = (tableRows ?? []) as ToypRow[];

  if (rows.length === 0) {
    const { data: fallbackLogs } = await supabase
      .from("audit_logs")
      .select("id, created_at, details")
      .eq("action", "toyp.nomination_submitted")
      .order("created_at", { ascending: false })
      .limit(50);

    rows = ((fallbackLogs ?? []) as { id: string; created_at: string; details: unknown }[]).map((log) => {
      const d = (log.details ?? {}) as Record<string, unknown>;
      return {
        id: log.id,
        nominee_full_name: String(d.nomineeFullName || "Candidat TOYP"),
        nominee_email: String(d.nomineeEmail || ""),
        nominee_age: Number(d.nomineeAge || 28),
        nominee_city: String(d.nomineeCity || ""),
        category: String(d.category || ""),
        local_org_slug: String(d.localOrgSlug || "tabarre-excelsior"),
        nominator_name: String(d.nominatorName || ""),
        achievements: String(d.achievements || ""),
        status: "submitted",
        created_at: log.created_at,
      };
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-navy">
            Programme National JCI TOYP — Dossiers de Nomination
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Examen des candidatures soumises pour les 10 Jeunes les Plus Remarquables d&apos;Haïti
            (Ten Outstanding Young Persons).
          </p>
        </div>
        <Link
          href="/programmes#nomination-toyp"
          className="inline-flex items-center px-4 py-2 rounded-xl bg-navy text-white text-xs font-heading font-semibold hover:bg-navy/90 transition-colors"
        >
          + Ouvrir le formulaire public TOYP
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-sm">
          <p className="text-3xl mb-2">🏆</p>
          <p className="font-heading font-semibold text-navy text-base">
            Aucune nomination TOYP enregistrée pour le moment
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Les dossiers soumis depuis la page publique « Programmes & TOYP » apparaissent
            automatiquement ici.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {rows.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold text-cyan uppercase tracking-wider">
                    {CATEGORY_MAP[r.category] ?? r.category}
                  </span>
                  <h2 className="font-heading font-bold text-lg text-navy mt-0.5">
                    {r.nominee_full_name} ({r.nominee_age} ans — {r.nominee_city})
                  </h2>
                  <p className="text-xs text-gray-400">
                    OLM parraine : <strong className="text-navy">{r.local_org_slug}</strong> •
                    Nominé par {r.nominator_name} • {r.nominee_email}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold">
                  Dossier reçu ({new Date(r.created_at).toLocaleDateString("fr-FR")})
                </span>
              </div>
              <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3.5 leading-relaxed">
                {r.achievements}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
