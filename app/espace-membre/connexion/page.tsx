import type { Metadata } from "next";
import { MemberLoginForm } from "./MemberLoginForm";

export const metadata: Metadata = {
  title: "Connexion — Espace membre JCI",
  robots: { index: false, follow: false },
};

export default function MemberLoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="font-heading font-bold text-3xl text-navy">JCI</span>
          <span className="font-heading font-semibold text-cyan text-lg ml-2">Tabarre Excelsior</span>
          <p className="text-gray-400 text-sm mt-2">Espace membre</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="font-heading font-bold text-navy text-xl mb-6">Connexion</h1>
          <MemberLoginForm />
        </div>
        <div className="text-center text-gray-400 text-xs mt-6 space-y-3">
          <p>
            Pas encore membre ? <a href="/join" className="text-cyan hover:underline">Faire une demande d&apos;adhésion</a>
          </p>
          <p className="pt-3 border-t border-gray-200 flex items-center justify-center gap-4">
            <a href="/" className="text-gray-500 hover:text-navy transition-colors">← Retour au site</a>
            <span>•</span>
            <a href="/ops-jci-htx/login" className="text-gray-500 hover:text-navy transition-colors">Accès Administration →</a>
          </p>
        </div>
      </div>
    </div>
  );
}
