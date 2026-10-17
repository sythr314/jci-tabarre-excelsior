import { NextRequest, NextResponse } from "next/server";
import { requireActiveAdmin, createServiceClient } from "@/lib/supabase/server";
import { isValidUUID, isValidSheetId, safeUrl, getTrustedClientIp } from "@/lib/utils/security";
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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!isValidUUID(id)) {
    return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });
  }

  const auth = await requireActiveAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

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
  if (!isValidUUID(id)) {
    return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });
  }

  const auth = await requireActiveAdmin(["president", "charge_formation"]);
  if (auth.error || !auth.admin) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { admin } = auth;

  const body = updateSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Données invalides", details: body.error.flatten() }, { status: 400 });
  }

  if (body.data.google_sheet_id && !isValidSheetId(body.data.google_sheet_id)) {
    return NextResponse.json({ error: "Format d'ID Google Sheet invalide" }, { status: 400 });
  }

  const payload = {
    ...body.data,
    registration_link: safeUrl(body.data.registration_link),
    google_sheet_id: body.data.google_sheet_id || null,
    registration_deadline: body.data.registration_deadline || null,
  };

  const service = createServiceClient();
  const { error } = await service
    .from("activities")
    .update(payload)
    .eq("id", id);

  if (error) {
    console.error("Activity update error:", error);
    return NextResponse.json({ error: "Échec de la mise à jour de l'activité" }, { status: 500 });
  }

  await service.from("audit_logs").insert({
    admin_id: admin.id,
    action: "activity.update",
    target_type: "activity",
    target_id: id,
    details: body.data,
    ip_address: getTrustedClientIp(req),
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!isValidUUID(id)) {
    return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });
  }

  const auth = await requireActiveAdmin(["president"]);
  if (auth.error || !auth.admin) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { admin } = auth;

  const service = createServiceClient();
  const { error } = await service.from("activities").delete().eq("id", id);

  if (error) {
    console.error("Activity delete error:", error);
    return NextResponse.json({ error: "Échec de la suppression" }, { status: 500 });
  }

  await service.from("audit_logs").insert({
    admin_id: admin.id,
    action: "activity.delete",
    target_type: "activity",
    target_id: id,
    details: {},
    ip_address: getTrustedClientIp(req),
  });

  return NextResponse.json({ success: true });
}
