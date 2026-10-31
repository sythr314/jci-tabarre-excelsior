import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { z } from "zod";

const profileSchema = z.object({
  phone: z.string().optional().nullable(),
  profession: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  commune: z.string().optional().nullable(),
  education_level: z.string().optional().nullable(),
  interests: z.array(z.string()).optional().nullable(),
});

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const json = await req.json();
  const parsed = profileSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides", details: parsed.error.format() }, { status: 400 });
  }

  const service = createServiceClient();
  const { data: member, error } = await service
    .from("members")
    .update({
      ...parsed.data,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .select()
    .single();

  if (error || !member) {
    return NextResponse.json({ error: "Erreur lors de la mise à jour du profil" }, { status: 500 });
  }

  return NextResponse.json({ success: true, member });
}
