import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { MemberLogoutButton } from "./MemberLogoutButton";

export const metadata = {
  robots: { index: false, follow: false },
};

const navLinks = [
  { href: "/espace-membre/tableau-de-bord", label: "Tableau de bord" },
  { href: "/espace-membre/taches",           label: "Mes tâches" },
  { href: "/espace-membre/activites",        label: "Mes activités" },
  { href: "/espace-membre/formations",       label: "Mes formations" },
  { href: "/espace-membre/profil",           label: "Mon profil" },
];

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  // Pages publiques de l'espace membre : pas de redirection ni de barre de navigation membre
  if (pathname === "/espace-membre/connexion" || pathname.startsWith("/espace-membre/invitation")) {
    return <>{children}</>;
  }

  // Utiliser les en-têtes déjà vérifiés par proxy.ts pour éviter un double aller-retour réseau Supabase
  const proxyMemberId = headersList.get("x-member-id");
  const proxyMemberName = headersList.get("x-member-name");

  let fullName = proxyMemberName ? decodeURIComponent(proxyMemberName) : "";

  if (!proxyMemberId || !fullName) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/espace-membre/connexion");

    const { data: member } = await supabase
      .from("members")
      .select("first_name, last_name, status")
      .eq("user_id", user.id)
      .single();

    if (!member || member.status === "inactive") redirect("/espace-membre/connexion");
    fullName = `${member.first_name} ${member.last_name}`;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-navy text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-heading font-bold text-white hover:text-cyan transition-colors">
            JCI <span className="text-cyan">Tabarre</span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label }) => (
              <Link key={href} href={href}
                className="px-3 py-1.5 text-sm text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white/60 text-sm hidden md:block">{fullName}</span>
          <MemberLogoutButton />
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
