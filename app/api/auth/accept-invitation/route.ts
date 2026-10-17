import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { applyRateLimit } from "@/lib/utils/rateLimit";
import { z } from "zod";

const schema = z.object({
  token: z.string().uuid(),
  email: z.string().email(),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .max(100, "Le mot de passe ne peut pas dépasser 100 caractères")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une lettre majuscule")
    .regex(/[a-z]/, "Le mot de passe doit contenir au moins une lettre minuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
});

export async function POST(req: NextRequest) {
  const limited = await applyRateLimit(req);
  if (limited) return limited;

  let jsonBody: unknown;
  try {
    jsonBody = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }

  const body = schema.safeParse(jsonBody);
  if (!body.success) {
    const firstError = body.error.issues[0]?.message || "Données invalides";
    return NextResponse.json({ error: firstError }, { status: 400 });
  }

  const { token, email, password } = body.data;
  const supabase = createServiceClient();
  const normalizedEmail = email.toLowerCase().trim();

  // Revendication ATOMIQUE du jeton pour éviter la race condition (TOCTOU)
  const now = new Date().toISOString();
  const { data: invitation, error: updateError } = await supabase
    .from("member_invitations")
    .update({ used_at: now })
    .eq("token", token)
    .eq("email", normalizedEmail)
    .is("used_at", null)
    .select("id, email, expires_at, member_id")
    .single();

  if (updateError || !invitation) {
    return NextResponse.json(
      { error: "Ce lien d'invitation est invalide ou a déjà été utilisé." },
      { status: 400 }
    );
  }

  if (new Date(invitation.expires_at) < new Date()) {
    return NextResponse.json({ error: "Ce lien d'invitation a expiré (validité 48h)." }, { status: 400 });
  }

  // Créer l'utilisateur Supabase Auth
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: normalizedEmail,
    password,
    email_confirm: true,
  });

  if (authError) {
    console.error("Auth user creation error:", authError);
    // Annuler la consommation du token si échec de création du compte auth
    await supabase
      .from("member_invitations")
      .update({ used_at: null })
      .eq("id", invitation.id);
    return NextResponse.json({ error: "Impossible de créer le compte utilisateur." }, { status: 500 });
  }

  // Lier le user_id au membre + activer le compte
  await supabase.from("members").update({
    user_id: authUser.user.id,
    status: "active",
    join_date: new Date().toISOString().split("T")[0],
  }).eq("id", invitation.member_id);

  return NextResponse.json({ success: true });
}
