import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/admin/Sidebar";
import type { AdminRole } from "@/lib/supabase/types";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  // Si on est sur la page de login, on ne redirige pas et on n'affiche pas la sidebar
  if (pathname === "/ops-jci-htx/login") {
    return <>{children}</>;
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/ops-jci-htx/login");

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("name, role, is_active")
    .eq("user_id", user.id)
    .single();

  if (!adminUser || !adminUser.is_active) redirect("/ops-jci-htx/login");

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={adminUser.role as AdminRole} adminName={adminUser.name} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
