import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const service = createServiceClient();
  const { data: member } = await service
    .from("members")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!member) {
    return NextResponse.json({ error: "Membre introuvable" }, { status: 404 });
  }

  const { data: tasks, error } = await service
    .from("tasks")
    .select(`
      id,
      title,
      description,
      commission,
      priority,
      status,
      due_date,
      created_at,
      activity:activities(id, title),
      assigned_by_admin:admin_users(name, role)
    `)
    .eq("assigned_to", member.id)
    .order("created_at", { ascending: false });

  if (error) {
    if (error.code === "42P01") return NextResponse.json([]);
    console.error("Member tasks GET error:", error);
    return NextResponse.json({ error: "Erreur lors du chargement des tâches" }, { status: 500 });
  }

  return NextResponse.json(tasks ?? []);
}
