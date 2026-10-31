"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";
import type { AdminRole } from "@/lib/supabase/types";

const BASE = "/ops-jci-htx";

type NavItem = {
  href: string;
  label: string;
  icon: string;
  roles: AdminRole[];
};

const navItems: NavItem[] = [
  { href: `${BASE}/dashboard`,    label: "Tableau de bord", icon: "📊", roles: ["president","secretaire","charge_formation","charge_communication"] },
  { href: `${BASE}/candidatures`, label: "Candidatures",    icon: "📋", roles: ["president","secretaire"] },
  { href: `${BASE}/membres`,      label: "Membres",         icon: "👥", roles: ["president","secretaire"] },
  { href: `${BASE}/activites`,    label: "Activités",       icon: "📅", roles: ["president","charge_formation"] },
  { href: `${BASE}/taches`,       label: "Tâches",          icon: "✅", roles: ["president","secretaire","charge_formation","charge_communication"] },
  { href: `${BASE}/formations`,   label: "Formations",      icon: "🎓", roles: ["president","charge_formation"] },
  { href: `${BASE}/contenu`,      label: "Contenu",         icon: "📝", roles: ["president","charge_communication"] },
  { href: `${BASE}/rapports`,     label: "Rapports",        icon: "📈", roles: ["president","secretaire","charge_formation"] },
  { href: `${BASE}/audit`,        label: "Audit & Traçabilité", icon: "🔍", roles: ["president","secretaire"] },
];

const roleLabels: Record<AdminRole, string> = {
  president: "Président(e)",
  secretaire: "Secrétaire",
  charge_formation: "Chargé(e) de formation",
  charge_communication: "Chargé(e) de communication",
};

interface SidebarProps {
  role: AdminRole;
  adminName: string;
}

export function Sidebar({ role, adminName }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(`${BASE}/login`);
    router.refresh();
  }

  const allowedItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="w-64 min-h-screen bg-navy flex flex-col border-r border-white/10">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="font-heading font-bold text-xl text-white">JCI</span>
          <span className="font-heading text-cyan text-xs leading-tight">Tabarre<br />Excelsior</span>
        </div>
        <p className="text-white/40 text-xs mt-1">Administration</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1" aria-label="Navigation admin">
        {allowedItems.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan",
                active
                  ? "bg-cyan/15 text-cyan"
                  : "text-white/70 hover:text-white hover:bg-white/8"
              )}
              aria-current={active ? "page" : undefined}
            >
              <span aria-hidden="true">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Profil admin */}
      <div className="p-4 border-t border-white/10">
        <div className="mb-3">
          <p className="text-white text-sm font-medium truncate">{adminName}</p>
          <p className="text-white/40 text-xs">{roleLabels[role]}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-left text-sm text-white/50 hover:text-error transition-colors focus-visible:outline-none focus-visible:text-error"
        >
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
