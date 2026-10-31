import { NextRequest, NextResponse } from "next/server";
import { requireActiveAdmin, createServiceClient } from "@/lib/supabase/server";
import { z } from "zod";

const roleSchema = z.object({
  role_title: z.string().min(2),
  commission: z.string().optional().nullable(),
  jci_level: z.enum(["member", "senator", "alumnus"]).optional(),
  community_role: z.string().optional().nullable(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: memberId } = await params;
  const auth = await requireActiveAdmin(["president", "secretaire"]);
  if (auth.error || !auth.admin) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const json = await req.json();
  const parsed = roleSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides", details: parsed.error.format() }, { status: 400 });
  }

  const service = createServiceClient();

  // Mettre à jour le rôle principal sur la table members
  const memberUpdate: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (parsed.data.community_role) memberUpdate.community_role = parsed.data.community_role;
  if (parsed.data.jci_level) memberUpdate.jci_level = parsed.data.jci_level;

  await service.from("members").update(memberUpdate).eq("id", memberId);

  // Ajouter l'entrée dans member_roles
  const { data: newRole, error } = await service.from("member_roles").insert({
    member_id: memberId,
    role_title: parsed.data.role_title,
    commission: parsed.data.commission || null,
    start_date: new Date().toISOString().slice(0, 10),
    is_current: true,
  }).select().single();

  if (error) {
    return NextResponse.json({ error: "Erreur lors de l'attribution du mandat" }, { status: 500 });
  }

  return NextResponse.json({ success: true, role: newRole });
}
