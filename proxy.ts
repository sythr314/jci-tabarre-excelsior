import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const DEFAULT_SUPABASE_URL = "https://edufaoftopmprbanowis.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_pnKtvG_ZM2zk8pQKzlZZyA_3zCnOj7Q";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder") &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project")
    ? process.env.NEXT_PUBLIC_SUPABASE_URL
    : DEFAULT_SUPABASE_URL;

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes("placeholder") &&
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes("your-anon-key")
    ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    : DEFAULT_SUPABASE_ANON_KEY;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  const pendingCookies: { name: string; value: string; options?: Record<string, unknown> }[] = [];

  const supabase = createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            pendingCookies.push({ name, value, options });
          });
        },
      },
    }
  );

  function buildResponse() {
    const res = NextResponse.next({ request: { headers: requestHeaders } });
    pendingCookies.forEach(({ name, value, options }) => {
      res.cookies.set(name, value, options as Parameters<typeof res.cookies.set>[2]);
    });
    return res;
  }

  const { data: { user } } = await supabase.auth.getUser();

  // ── Protection des routes /ops-jci-htx/* ──────────────────────
  if (pathname.startsWith("/ops-jci-htx") && !pathname.startsWith("/ops-jci-htx/login")) {
    if (!user) {
      return NextResponse.redirect(new URL("/ops-jci-htx/login", request.url));
    }

    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("role, name, is_active")
      .eq("user_id", user.id)
      .single();

    if (!adminUser || !adminUser.is_active) {
      return NextResponse.redirect(new URL("/ops-jci-htx/login?error=unauthorized", request.url));
    }

    requestHeaders.set("x-admin-role", adminUser.role);
    requestHeaders.set("x-admin-name", encodeURIComponent(adminUser.name));
  }

  // ── Protection des routes /espace-membre/* ────────────────────
  const publicMemberPaths = [
    "/espace-membre/connexion",
    "/espace-membre/invitation",
  ];
  const isPublicMemberPath = publicMemberPaths.some((p) => pathname.startsWith(p));

  if (pathname.startsWith("/espace-membre") && !isPublicMemberPath) {
    if (!user) {
      return NextResponse.redirect(new URL("/espace-membre/connexion", request.url));
    }
  }

  if (pathname === "/ops-jci-htx/login" && user) {
    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("role, is_active")
      .eq("user_id", user.id)
      .single();

    if (adminUser && adminUser.is_active) {
      return NextResponse.redirect(new URL("/ops-jci-htx/dashboard", request.url));
    }
  }

  if (pathname === "/espace-membre/connexion" && user) {
    return NextResponse.redirect(new URL("/espace-membre/tableau-de-bord", request.url));
  }

  return buildResponse();
}

export const config = {
  matcher: ["/ops-jci-htx/:path*", "/espace-membre/:path*"],
};
