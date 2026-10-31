import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isValidUUID } from "@/lib/utils/security";
import { z } from "zod";

const memberTaskUpdateSchema = z.object({
  status: z.enum(["a_faire", "en_cours", "termine"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!isValidUUID(id)) {
    return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });
  }

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

  const body = memberTaskUpdateSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  const { error } = await service
    .from("tasks")
    .update({
      status: body.data.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("assigned_to", member.id);

  if (error) {
    console.error("Member task update error:", error);
    return NextResponse.json({ error: "Échec de la mise à jour de la tâche" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
