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

import { requireActiveAdmin, createServiceClient } from "@/lib/supabase/server";
import { safeUrl, getTrustedClientIp } from "@/lib/utils/security";

export async function GET() {
  const auth = await requireActiveAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const service = createServiceClient();
  const { data, error } = await service
    .from("activities")
    .select("id, title, slug, type, activity_date, location, status, capacity, created_at")
    .order("activity_date", { ascending: false });

  if (error) {
    console.error("Activities GET error:", error);
    return NextResponse.json({ error: "Erreur lors de la récupération des activités" }, { status: 500 });
  }
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const auth = await requireActiveAdmin(["president", "charge_formation"]);
  if (auth.error || !auth.admin) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { admin } = auth;

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
      registration_link: safeUrl(registration_link),
      created_by: admin.id,
    })
    .select("id, slug")
    .single();

  if (error) {
    console.error("Activities POST error:", error);
    return NextResponse.json({ error: "Erreur lors de la création de l'activité" }, { status: 500 });
  }

  await service.from("audit_logs").insert({
    admin_id: admin.id,
    action: "activity.create",
    target_type: "activity",
    target_id: activity.id,
    details: { title, type: rest.type },
    ip_address: getTrustedClientIp(req),
  });

  return NextResponse.json({ success: true, id: activity.id }, { status: 201 });
}
