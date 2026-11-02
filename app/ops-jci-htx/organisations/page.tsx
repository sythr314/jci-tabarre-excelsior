import { DEFAULT_LOCAL_ORGANIZATIONS } from "@/lib/data/national";

export const dynamic = "force-dynamic";

export default async function AdminOrganisationsPage() {
  const sorted = [...DEFAULT_LOCAL_ORGANIZATIONS].sort(
    (a, b) => b.efficiency_score - a.efficiency_score
  );

  const totalMembers = sorted.reduce((acc, o) => acc + o.members_count, 0);
  const quitusCount = sorted.filter((o) => o.capitation_paid).length;
  const avgScore = Math.round(
    sorted.reduce((acc, o) => acc + o.efficiency_score, 0) / sorted.length
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading font-bold text-2xl text-navy">
          Pilotage des OLM & Programme 100 % Efficacité Nationale
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Suivi consolidé des Organisations Locales Membres (OLM) de JCI Haïti selon les 4 piliers
          du standard national d&apos;excellence et l&apos;état du Quitus Financier (Capitation).
        </p>
      </div>

      {/* KPIs Nationaux */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs text-gray-400">OLM Affiliées & Provisoires</p>
          <p className="text-3xl font-heading font-bold text-navy mt-1">{sorted.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs text-gray-400">Effectif National Consolidé</p>
          <p className="text-3xl font-heading font-bold text-cyan mt-1">{totalMembers}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs text-gray-400">Score Moyen 100% Efficacité</p>
          <p className="text-3xl font-heading font-bold text-emerald-600 mt-1">{avgScore}/100</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs text-gray-400">Quitus Financier (Capitation)</p>
          <p className="text-3xl font-heading font-bold text-navy mt-1">
            {quitusCount}/{sorted.length}
          </p>
        </div>
      </div>

      {/* Tableau du Programme 100% Efficacité */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-heading font-semibold text-navy text-base">
            Classement National — Grille d&apos;Évaluation 100 % Efficacité
          </h2>
          <span className="text-xs text-gray-400">Mandat National 2026</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60 text-left text-xs text-gray-400 font-medium">
                <th className="px-5 py-3.5">Rang & OLM</th>
                <th className="px-4 py-3.5">Région</th>
                <th className="px-4 py-3.5">Président(e)</th>
                <th className="px-4 py-3.5 text-center">Membres</th>
                <th className="px-4 py-3.5 text-center">Admin (/25)</th>
                <th className="px-4 py-3.5 text-center">Croissance (/25)</th>
                <th className="px-4 py-3.5 text-center">Impact RISE (/30)</th>
                <th className="px-4 py-3.5 text-center">Participation (/20)</th>
                <th className="px-4 py-3.5 text-center">Score Total</th>
                <th className="px-5 py-3.5 text-right">Quitus Capitation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sorted.map((org, idx) => (
                <tr
                  key={org.id}
                  className={
                    org.slug === "tabarre-excelsior"
                      ? "bg-cyan/5 hover:bg-cyan/10"
                      : "hover:bg-gray-50/60"
                  }
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-navy text-white text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="font-heading font-semibold text-navy">{org.name}</p>
                        <p className="text-xs text-gray-400">{org.city}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-600">{org.regionLabel}</td>
                  <td className="px-4 py-4 text-xs text-gray-700 font-medium">
                    {org.president_name}
                  </td>
                  <td className="px-4 py-4 text-center font-semibold text-navy">
                    {org.members_count}
                  </td>
                  <td className="px-4 py-4 text-center text-xs text-gray-600">
                    {org.efficiency_breakdown.administration}/25
                  </td>
                  <td className="px-4 py-4 text-center text-xs text-gray-600">
                    {org.efficiency_breakdown.growth}/25
                  </td>
                  <td className="px-4 py-4 text-center text-xs text-gray-600">
                    {org.efficiency_breakdown.impact_rise}/30
                  </td>
                  <td className="px-4 py-4 text-center text-xs text-gray-600">
                    {org.efficiency_breakdown.participation}/20
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                        org.efficiency_score >= 90
                          ? "bg-emerald-100 text-emerald-800"
                          : org.efficiency_score >= 80
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {org.efficiency_score}%
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    {org.capitation_paid ? (
                      <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                        ✓ Quitus accordé
                      </span>
                    ) : (
                      <span className="inline-block px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
                        En attente
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
