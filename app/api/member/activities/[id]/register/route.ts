import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: activityId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const service = createServiceClient();
  const { data: member } = await service
    .from("members")
    .select("id, first_name, last_name, email, status")
    .eq("user_id", user.id)
    .single();

  if (!member || member.status === "inactive") {
    return NextResponse.json({ error: "Membre inactif ou non trouvé" }, { status: 403 });
  }

  // Vérifier si l'activité existe
  const { data: activity } = await service
    .from("activities")
    .select("id, title, status, capacity")
    .eq("id", activityId)
    .single();

  if (!activity) {
    return NextResponse.json({ error: "Activité introuvable" }, { status: 404 });
  }

  if (activity.status === "cancelled" || activity.status === "completed") {
    return NextResponse.json({ error: "Cette activité n'accepte plus d'inscriptions" }, { status: 400 });
  }

  // Vérifier si déjà inscrit
  const { data: existing } = await service
    .from("attendances")
    .select("id")
    .eq("activity_id", activityId)
    .eq("member_id", member.id)
    .single();

  if (existing) {
    // Désinscription
    await service.from("attendances").delete().eq("id", existing.id);
    return NextResponse.json({ registered: false, message: "Inscription annulée" });
  }

  // Inscription
  const { error } = await service.from("attendances").insert({
    activity_id: activityId,
    member_id: member.id,
    external_name: `${member.first_name} ${member.last_name}`,
    external_email: member.email,
    attended: false,
    source: "site",
    registered_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: "Erreur lors de l'inscription" }, { status: 500 });
  }

  return NextResponse.json({ registered: true, message: "Inscription réussie !" });
}
