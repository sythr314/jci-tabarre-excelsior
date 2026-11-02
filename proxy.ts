import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const ADMIN_PREFIX = "/ops-jci-htx";
const ADMIN_LOGIN = `${ADMIN_PREFIX}/login`;
const MEMBER_PREFIX = "/espace-membre";
const MEMBER_LOGIN = `${MEMBER_PREFIX}/connexion`;
const MEMBER_INVITE = `${MEMBER_PREFIX}/invitation`;

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

  if (
    !pathname.startsWith(ADMIN_PREFIX) &&
    !pathname.startsWith(MEMBER_PREFIX) &&
    !pathname.startsWith("/studio")
  ) {
    return NextResponse.next();
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const supabase = createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

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
    if (pathname === ADMIN_LOGIN) {
      if (user) {
        return NextResponse.redirect(new URL(`${ADMIN_PREFIX}/dashboard`, request.url));
      }
      return response;
    }

    if (!user) {
      return NextResponse.redirect(new URL(ADMIN_LOGIN, request.url));
    }

    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("name, role, is_active")
      .eq("user_id", user.id)
      .single();

    if (!adminUser || !adminUser.is_active) {
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL(ADMIN_LOGIN, request.url));
    }

    requestHeaders.set("x-admin-role", adminUser.role);
    requestHeaders.set("x-admin-name", encodeURIComponent(adminUser.name));
    response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    return response;
  }

  // ─── ROUTES MEMBRE ─────────────────────────────────────────
  if (pathname.startsWith(MEMBER_PREFIX)) {
    if (pathname === MEMBER_LOGIN || pathname.startsWith(MEMBER_INVITE)) {
      if (user && pathname === MEMBER_LOGIN) {
        return NextResponse.redirect(new URL(`${MEMBER_PREFIX}/tableau-de-bord`, request.url));
      }
      return response;
    }

    if (!user) {
      return NextResponse.redirect(new URL(MEMBER_LOGIN, request.url));
    }

    const { data: member } = await supabase
      .from("members")
      .select("id, first_name, last_name, status")
      .eq("user_id", user.id)
      .single();

    if (!member || member.status === "inactive") {
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL(MEMBER_LOGIN, request.url));
    }

    requestHeaders.set("x-member-id", member.id);
    requestHeaders.set("x-member-name", encodeURIComponent(`${member.first_name} ${member.last_name}`));
    response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    return response;
  }

  return response;
}

export default proxy;

export const config = {
  matcher: ["/ops-jci-htx/:path*", "/espace-membre/:path*", "/studio/:path*"],
};
