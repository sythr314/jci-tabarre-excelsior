import { createServiceClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ActivationForm } from "./ActivationForm";

export const metadata: Metadata = { title: "Activation de compte — JCI Tabarre Excelsior" };

export default async function InvitationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = createServiceClient();

  const { data: invitation } = await supabase
    .from("member_invitations")
    .select("id, email, expires_at, used_at, members(first_name, last_name)")
    .eq("token", token)
    .single();

  if (!invitation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-4xl mb-4" aria-hidden="true">❌</div>
          <h1 className="font-heading font-bold text-navy text-xl mb-2">Lien invalide</h1>
          <p className="text-gray-500">Ce lien d'invitation n'existe pas ou a déjà été utilisé.</p>
        </div>
      </div>
    );
  }

  if (invitation.used_at) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-4xl mb-4" aria-hidden="true">⚠️</div>
          <h1 className="font-heading font-bold text-navy text-xl mb-2">Lien déjà utilisé</h1>
          <p className="text-gray-500">Ce lien a déjà été utilisé pour activer un compte.</p>
          <a href="/espace-membre/connexion" className="text-cyan mt-4 inline-block hover:underline">Se connecter →</a>
        </div>
      </div>
    );
  }

  if (new Date(invitation.expires_at) < new Date()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-4xl mb-4" aria-hidden="true">⏰</div>
          <h1 className="font-heading font-bold text-navy text-xl mb-2">Lien expiré</h1>
          <p className="text-gray-500">Ce lien a expiré (validité 48h). Contactez un administrateur pour en recevoir un nouveau.</p>
        </div>
      </div>
    );
  }

  const member = Array.isArray(invitation.members) ? invitation.members[0] : invitation.members;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="font-heading font-bold text-3xl text-navy">JCI</span>
          <span className="font-heading font-semibold text-cyan text-lg ml-2">Tabarre Excelsior</span>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="font-heading font-bold text-navy text-xl mb-2">
            Bienvenue, {member?.first_name} !
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            Créez votre mot de passe pour activer votre espace membre.
          </p>
          <ActivationForm token={token} email={invitation.email} />
        </div>
      </div>
    </div>
  );
}
