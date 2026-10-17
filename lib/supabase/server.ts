import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component — les cookies seront gérés par le middleware
          }
        },
      },
    }
  );
}

// Client avec service role (bypasse RLS) — uniquement côté serveur
export function createServiceClient() {
  if (typeof window !== "undefined") {
    throw new Error("createServiceClient must only be called on the server");
  }
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key",
    {
      cookies: { getAll: () => [], setAll: () => {} },
    }
  );
}

import type { AdminRole } from "./types";

/**
 * Vérifie que l'utilisateur connecté est un administrateur ACTIF (is_active = true)
 * et possède l'un des rôles autorisés le cas échéant.
 */
export async function requireActiveAdmin(allowedRoles?: AdminRole[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { user: null, admin: null, error: "Non autorisé", status: 401 as const };
  }

  const service = createServiceClient();
  const { data: admin } = await service
    .from("admin_users")
    .select("id, role, name, is_active")
    .eq("user_id", user.id)
    .single();

  if (!admin || !admin.is_active) {
    return { user, admin: null, error: "Compte administrateur inactif ou inexistant", status: 403 as const };
  }

  if (allowedRoles && !allowedRoles.includes(admin.role as AdminRole)) {
    return { user, admin, error: "Permission insuffisante", status: 403 as const };
  }

  return { user, admin, error: null, status: 200 as const };
}
