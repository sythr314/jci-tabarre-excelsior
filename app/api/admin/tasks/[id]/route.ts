import { NextRequest, NextResponse } from "next/server";
import { requireActiveAdmin, createServiceClient } from "@/lib/supabase/server";
import { isValidUUID, getTrustedClientIp } from "@/lib/utils/security";
import { z } from "zod";

const updateTaskSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  activity_id: z.string().uuid().nullable().optional(),
  commission: z.string().optional(),
  assigned_to: z.string().uuid().nullable().optional(),
  priority: z.enum(["basse", "normale", "haute", "urgente"]).optional(),
  status: z.enum(["a_faire", "en_cours", "termine", "valide"]).optional(),
  due_date: z.string().nullable().optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!isValidUUID(id)) {
    return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });
  }

  const auth = await requireActiveAdmin();
  if (auth.error || !auth.admin) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { admin } = auth;

  const body = updateTaskSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Données invalides", details: body.error.flatten() }, { status: 400 });
  }

  const service = createServiceClient();
  const { error } = await service
    .from("tasks")
    .update(body.data)
    .eq("id", id);

  if (error) {
    console.error("Task update error:", error);
    return NextResponse.json({ error: "Échec de la mise à jour de la tâche" }, { status: 500 });
  }

  // Traçabilité
  await service.from("audit_logs").insert({
    admin_id: admin.id,
    action: "task.update",
    target_type: "task",
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

  const auth = await requireActiveAdmin(["president", "secretaire"]);
  if (auth.error || !auth.admin) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { admin } = auth;

  const service = createServiceClient();
  const { error } = await service.from("tasks").delete().eq("id", id);

  if (error) {
    console.error("Task delete error:", error);
    return NextResponse.json({ error: "Échec de la suppression" }, { status: 500 });
  }

  await service.from("audit_logs").insert({
    admin_id: admin.id,
    action: "task.delete",
    target_type: "task",
    target_id: id,
    details: {},
    ip_address: getTrustedClientIp(req),
  });

  return NextResponse.json({ success: true });
}
