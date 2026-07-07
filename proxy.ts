import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const ADMIN_PREFIX = "/ops-jci-htx";
const ADMIN_LOGIN = `${ADMIN_PREFIX}/login`;
const MEMBER_PREFIX = "/espace-membre";
const MEMBER_LOGIN = `${MEMBER_PREFIX}/connexion`;
const MEMBER_INVITE = `${MEMBER_PREFIX}/invitation`;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next({ request });

  // Ignorer les assets statiques
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".")
  ) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // ─── ROUTES ADMIN ──────────────────────────────────────────
  if (pathname.startsWith(ADMIN_PREFIX)) {
    // Login admin accessible sans session
    if (pathname === ADMIN_LOGIN) {
      if (user) {
        return NextResponse.redirect(new URL(`${ADMIN_PREFIX}/dashboard`, request.url));
      }
      return response;
    }

    // Toutes les autres routes admin nécessitent une session
    if (!user) {
      return NextResponse.redirect(new URL(ADMIN_LOGIN, request.url));
    }

    // Vérifier que l'utilisateur est bien un admin
    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("role, is_active")
      .eq("user_id", user.id)
      .single();

    if (!adminUser || !adminUser.is_active) {
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL(ADMIN_LOGIN, request.url));
    }

    // Injecter le rôle dans les headers pour les Server Components
    response.headers.set("x-admin-role", adminUser.role);
    return response;
  }

  // ─── ROUTES MEMBRE ─────────────────────────────────────────
  if (pathname.startsWith(MEMBER_PREFIX)) {
    // Login et invitation accessibles sans session
    if (pathname === MEMBER_LOGIN || pathname.startsWith(MEMBER_INVITE)) {
      if (user && pathname === MEMBER_LOGIN) {
        return NextResponse.redirect(new URL(`${MEMBER_PREFIX}/tableau-de-bord`, request.url));
      }
      return response;
    }

    if (!user) {
      return NextResponse.redirect(new URL(MEMBER_LOGIN, request.url));
    }

    // Vérifier que l'utilisateur est un membre actif
    const { data: member } = await supabase
      .from("members")
      .select("id, status")
      .eq("user_id", user.id)
      .single();

    if (!member || member.status === "inactive") {
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL(MEMBER_LOGIN, request.url));
    }

    response.headers.set("x-member-id", member.id);
    return response;
  }

  return response;
}

export const config = {
  matcher: ["/ops-jci-htx/:path*", "/espace-membre/:path*"],
};
