import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { ProfileForm } from "./ProfileForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mon Profil — Espace Membre JCI" };

const levelLabels: Record<string, string> = {
  member: "Membre Individuel",
  senator: "Sénateur JCI (Honneur à vie)",
  alumnus: "Alumnus / Ancien Membre",
};

type RoleItem = {
  id: string;
  role_title: string;
  commission: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
};

export default async function MemberProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/espace-membre/connexion");

  const service = process.env.SUPABASE_SERVICE_ROLE_KEY ? createServiceClient() : supabase;
  const { data: member } = await service.from("members").select("*").eq("user_id", user.id).single();
  if (!member) redirect("/espace-membre/connexion");

  // Charger les rôles et commissions
  const { data: roles } = await service
    .from("member_roles")
    .select("*")
    .eq("member_id", member.id)
    .order("start_date", { ascending: false });

  const roleList = (roles ?? []) as RoleItem[];

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div>
        <h1 className="font-heading font-bold text-navy text-2xl">Mon Profil Membre</h1>
        <p className="text-gray-500 text-sm mt-1">
          Consultez et mettez à jour vos informations personnelles, votre mandat et vos coordonnées.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Carte Identité JCI */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
          <div className="text-center pb-6 border-b border-gray-100">
            <div className="w-20 h-20 mx-auto rounded-full bg-navy text-white flex items-center justify-center text-2xl font-bold font-heading mb-3 shadow-md">
              {member.first_name[0]}{member.last_name[0]}
            </div>
            <h2 className="font-heading font-bold text-navy text-lg">
              {member.first_name} {member.last_name}
            </h2>
            <p className="text-xs text-gray-500">{member.email}</p>
            <div className="mt-3">
              <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-cyan-light text-navy border border-cyan/20">
                {levelLabels[member.jci_level] ?? member.jci_level}
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 font-heading">
              Rôle au sein de la locale
            </h3>
            <p className="text-sm font-semibold text-navy">
              {member.community_role ?? "Membre actif de la locale"}
            </p>
          </div>

          {member.join_date && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 font-heading">
                Date d'affiliation
              </h3>
              <p className="text-sm text-gray-600">
                {new Date(member.join_date).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
              </p>
            </div>
          )}

          {/* Commissions & Mandats */}
          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-xs font-semibold text-navy uppercase tracking-wider mb-3 font-heading">
              Mandats & Commissions
            </h3>
            {roleList.length === 0 ? (
              <p className="text-xs text-gray-400">Aucun mandat formel enregistré.</p>
            ) : (
              <div className="space-y-2">
                {roleList.map((r: RoleItem) => (
                  <div key={r.id} className="text-xs p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                    <p className="font-semibold text-navy">{r.role_title}</p>
                    <p className="text-gray-500">{r.commission ?? "Commission générale"}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Formulaire d'édition */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
          <h2 className="font-heading font-bold text-navy text-lg mb-6">
            Modifier mes informations
          </h2>
          <ProfileForm member={member} />
        </div>
      </div>
    </div>
  );
}
