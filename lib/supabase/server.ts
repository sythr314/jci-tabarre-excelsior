import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { AdminRole } from "./types";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://edufaoftopmprbanowis.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_pnKtvG_ZM2zk8pQKzlZZyA_3zCnOj7Q";
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])
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
    SUPABASE_URL,
    SUPABASE_SERVICE_KEY,
    {
      cookies: { getAll: () => [], setAll: () => {} },
    }
  );
}

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

  // Utiliser le client de session (compatible RLS admin_self_read) ou service role si configuré
  const db = process.env.SUPABASE_SERVICE_ROLE_KEY ? createServiceClient() : supabase;
  const { data: admin } = await db
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
