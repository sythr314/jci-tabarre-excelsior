"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function MemberLogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/espace-membre/connexion");
    router.refresh();
  }

  return (
    <button onClick={handleLogout}
      className="text-sm text-white/50 hover:text-white transition-colors focus-visible:outline-none focus-visible:text-white">
      Déconnexion
    </button>
  );
}
