import type { Metadata } from "next";
import { AdminLoginForm } from "./AdminLoginForm";

export const metadata: Metadata = {
  title: "Accès réservé",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="font-heading font-bold text-3xl text-white">JCI</span>
          <span className="font-heading font-semibold text-cyan text-lg ml-2">Tabarre Excelsior</span>
          <p className="text-white/50 text-sm mt-2">Espace administration</p>
        </div>
        <AdminLoginForm />
        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-white/50">
          <a href="/" className="hover:text-cyan transition-colors">← Retour au site</a>
          <span>•</span>
          <a href="/espace-membre/connexion" className="hover:text-cyan transition-colors">Espace Membre →</a>
        </div>
      </div>
    </div>
  );
}
