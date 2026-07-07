import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({
  token: z.string().uuid(),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  const body = schema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

  const { token, email, password } = body.data;
  const supabase = createServiceClient();

  // Vérifier le token (atomique : used_at IS NULL)
  const { data: invitation, error: fetchError } = await supabase
    .from("member_invitations")
    .select("id, email, expires_at, used_at, member_id")
    .eq("token", token)
    .eq("email", email)
    .is("used_at", null)
    .single();

  if (fetchError || !invitation) {
    return NextResponse.json({ error: "Token invalide ou déjà utilisé." }, { status: 400 });
  }
  if (new Date(invitation.expires_at) < new Date()) {
    return NextResponse.json({ error: "Ce lien a expiré." }, { status: 400 });
  }

  // Créer l'utilisateur Supabase Auth
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) return NextResponse.json({ error: authError.message }, { status: 500 });

  // Lier le user_id au membre + activer le compte
  await supabase.from("members").update({
    user_id: authUser.user.id,
    status: "active",
    join_date: new Date().toISOString().split("T")[0],
  }).eq("id", invitation.member_id);

  // Marquer le token comme utilisé (une seule fois)
  await supabase.from("member_invitations")
    .update({ used_at: new Date().toISOString(), member_id: invitation.member_id })
    .eq("token", token);

  return NextResponse.json({ success: true });
}
