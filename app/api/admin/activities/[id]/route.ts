import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(2).optional(),
  type: z.enum(["formation", "activite", "reunion", "initiative", "autre"]).optional(),
  activity_date: z.string().min(1).optional(),
  status: z.enum(["upcoming", "ongoing", "completed", "cancelled"]).optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  capacity: z.number().int().positive().nullable().optional(),
  registration_link: z.string().optional(),
  google_sheet_id: z.string().optional(),
  sheet_email_column: z.string().optional(),
  registration_deadline: z.string().optional(),
});

async function getAdmin(userId: string) {
  const service = createServiceClient();
  const { data } = await service.from("admin_users").select("id, role").eq("user_id", userId).single();
  return data;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const admin = await getAdmin(user.id);
  if (!admin) return NextResponse.json({ error: "Permission insuffisante" }, { status: 403 });

  const service = createServiceClient();
  const { data: activity, error } = await service
    .from("activities")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !activity) return NextResponse.json({ error: "Activité introuvable" }, { status: 404 });

  const { count } = await service
    .from("attendances")
    .select("id", { count: "exact", head: true })
    .eq("activity_id", id)
    .eq("attended", true);

  return NextResponse.json({ ...activity, attendance_count: count ?? 0 });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const admin = await getAdmin(user.id);
  if (!admin || !["president", "charge_formation"].includes(admin.role)) {
    return NextResponse.json({ error: "Permission insuffisante" }, { status: 403 });
  }

  const body = updateSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Données invalides", details: body.error.flatten() }, { status: 400 });
  }

  const payload = {
    ...body.data,
    registration_link: body.data.registration_link || null,
    google_sheet_id: body.data.google_sheet_id || null,
    registration_deadline: body.data.registration_deadline || null,
  };

  const service = createServiceClient();
  const { error } = await service
    .from("activities")
    .update(payload)
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await service.from("audit_logs").insert({
    admin_id: admin.id,
    action: "activity.update",
    target_type: "activity",
    target_id: id,
    details: body.data,
    ip_address: req.headers.get("x-forwarded-for") ?? "unknown",
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const admin = await getAdmin(user.id);
  if (!admin || admin.role !== "president") {
    return NextResponse.json({ error: "Réservé au président" }, { status: 403 });
  }

  const service = createServiceClient();
  const { error } = await service.from("activities").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await service.from("audit_logs").insert({
    admin_id: admin.id,
    action: "activity.delete",
    target_type: "activity",
    target_id: id,
    details: {},
    ip_address: req.headers.get("x-forwarded-for") ?? "unknown",
  });

  return NextResponse.json({ success: true });
}
