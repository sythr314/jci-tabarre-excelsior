import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(2),
  type: z.enum(["formation", "activite", "reunion", "initiative", "autre"]),
  activity_date: z.string().min(1),
  status: z.enum(["upcoming", "ongoing", "completed", "cancelled"]).default("upcoming"),
  location: z.string().optional(),
  description: z.string().optional(),
  capacity: z.number().int().positive().optional(),
  registration_link: z.string().optional(),
  google_sheet_id: z.string().optional(),
  sheet_email_column: z.string().default("Email"),
  registration_deadline: z.string().optional(),
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function getAdmin(userId: string) {
  const service = createServiceClient();
  const { data } = await service.from("admin_users").select("id, role").eq("user_id", userId).single();
  return data;
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const admin = await getAdmin(user.id);
  if (!admin) return NextResponse.json({ error: "Permission insuffisante" }, { status: 403 });

  const service = createServiceClient();
  const { data, error } = await service
    .from("activities")
    .select("id, title, slug, type, activity_date, location, status, capacity, created_at")
    .order("activity_date", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const admin = await getAdmin(user.id);
  if (!admin || !["president", "charge_formation"].includes(admin.role)) {
    return NextResponse.json({ error: "Permission insuffisante" }, { status: 403 });
  }

  const body = createSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Données invalides", details: body.error.flatten() }, { status: 400 });
  }

  const { title, registration_link, ...rest } = body.data;
  const slug = slugify(title);

  const service = createServiceClient();

  const { data: existing } = await service.from("activities").select("id").eq("slug", slug).single();
  const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

  const { data: activity, error } = await service
    .from("activities")
    .insert({
      ...rest,
      title,
      slug: finalSlug,
      registration_link: registration_link || null,
      created_by: admin.id,
    })
    .select("id, slug")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await service.from("audit_logs").insert({
    admin_id: admin.id,
    action: "activity.create",
    target_type: "activity",
    target_id: activity.id,
    details: { title, type: rest.type },
    ip_address: req.headers.get("x-forwarded-for") ?? "unknown",
  });

  return NextResponse.json({ success: true, id: activity.id }, { status: 201 });
}
