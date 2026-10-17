import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const ADMIN_PREFIX = "/ops-jci-htx";
const ADMIN_LOGIN = `${ADMIN_PREFIX}/login`;
const MEMBER_PREFIX = "/espace-membre";
const MEMBER_LOGIN = `${MEMBER_PREFIX}/connexion`;
const MEMBER_INVITE = `${MEMBER_PREFIX}/invitation`;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignorer les assets statiques et les routes API (gérées individuellement)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Préparer les en-têtes de requête en nettoyant les en-têtes sensibles pour éviter le spoofing
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete("x-admin-role");
  requestHeaders.delete("x-member-id");
  requestHeaders.set("x-pathname", pathname);

  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // ─── PROTECTION SANITY STUDIO ───────────────────────────────
  if (pathname.startsWith("/studio")) {
    if (!user) {
      return NextResponse.redirect(new URL(ADMIN_LOGIN, request.url));
    }
    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("role, is_active")
      .eq("user_id", user.id)
      .single();

    if (!adminUser || !adminUser.is_active) {
      return NextResponse.redirect(new URL(ADMIN_LOGIN, request.url));
    }
    return response;
  }

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

    // Vérifier que l'utilisateur est bien un admin actif
    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("role, is_active")
      .eq("user_id", user.id)
      .single();

    if (!adminUser || !adminUser.is_active) {
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL(ADMIN_LOGIN, request.url));
    }

    requestHeaders.set("x-admin-role", adminUser.role);
    response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
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

    requestHeaders.set("x-member-id", member.id);
    response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    return response;
  }

  return response;
}

// Export proxy pour rétrocompatibilité
export const proxy = middleware;

export const config = {
  matcher: ["/ops-jci-htx/:path*", "/espace-membre/:path*", "/studio/:path*"],
};
