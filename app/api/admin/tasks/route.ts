import { NextRequest, NextResponse } from "next/server";
import { requireActiveAdmin, createServiceClient } from "@/lib/supabase/server";
import { getTrustedClientIp } from "@/lib/utils/security";
import { z } from "zod";

const taskSchema = z.object({
  title: z.string().min(2, "Le titre est requis"),
  description: z.string().optional(),
  activity_id: z.string().uuid().nullable().optional(),
  commission: z.string().optional(),
  assigned_to: z.string().uuid("Membre invalide").nullable().optional(),
  priority: z.enum(["basse", "normale", "haute", "urgente"]).default("normale"),
  status: z.enum(["a_faire", "en_cours", "termine", "valide"]).default("a_faire"),
  due_date: z.string().nullable().optional(),
});

export async function GET() {
  const auth = await requireActiveAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const service = createServiceClient();
  const { data, error } = await service
    .from("tasks")
    .select(`
      *,
      assigned_member:members(id, first_name, last_name, email),
      assigned_by_admin:admin_users(id, name, role),
      activity:activities(id, title)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    // Si la table n'est pas encore créée dans Supabase, renvoyer une liste vide sans crasher
    if (error.code === "42P01") {
      return NextResponse.json([]);
    }
    console.error("Admin tasks GET error:", error);
    return NextResponse.json({ error: "Erreur lors du chargement des tâches" }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const auth = await requireActiveAdmin();
  if (auth.error || !auth.admin) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { admin } = auth;

  const body = taskSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Données invalides", details: body.error.flatten() }, { status: 400 });
  }

  const service = createServiceClient();
  const payload = {
    ...body.data,
    assigned_by: admin.id,
    activity_id: body.data.activity_id || null,
    assigned_to: body.data.assigned_to || null,
    due_date: body.data.due_date || null,
  };

  const { data: task, error } = await service
    .from("tasks")
    .insert(payload)
    .select("id, title")
    .single();

  if (error) {
    console.error("Admin task POST error:", error);
    return NextResponse.json({ error: "Échec de l'assignation de la tâche. Veuillez exécuter la migration 004 si ce n'est pas déjà fait." }, { status: 500 });
  }

  // Traçabilité automatique dans le journal d'audit
  await service.from("audit_logs").insert({
    admin_id: admin.id,
    action: "task.assign",
    target_type: "task",
    target_id: task.id,
    details: {
      title: task.title,
      assigned_to: payload.assigned_to,
      priority: payload.priority,
      commission: payload.commission,
    },
    ip_address: getTrustedClientIp(req),
  });

  return NextResponse.json({ success: true, id: task.id }, { status: 201 });
}
