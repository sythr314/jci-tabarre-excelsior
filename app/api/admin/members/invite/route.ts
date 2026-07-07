import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);

const schema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const service = createServiceClient();
  const { data: admin } = await service.from("admin_users").select("id, role, name").eq("user_id", user.id).single();
  if (!admin || !["president", "secretaire"].includes(admin.role)) {
    return NextResponse.json({ error: "Permission insuffisante" }, { status: 403 });
  }

  const body = schema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

  const { email, firstName, lastName } = body.data;

  // Créer le membre en statut pending
  const { data: member, error: memberError } = await service.from("members").insert({
    email, first_name: firstName, last_name: lastName,
    status: "pending", invited_by: null,
  }).select("id").single();

  if (memberError) return NextResponse.json({ error: memberError.message }, { status: 500 });

  // Créer l'invitation (token généré par Supabase DEFAULT)
  const { data: invitation, error: inviteError } = await service
    .from("member_invitations")
    .insert({ email, invited_by: admin.id, member_id: member.id })
    .select("token")
    .single();

  if (inviteError) return NextResponse.json({ error: inviteError.message }, { status: 500 });

  const inviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/espace-membre/invitation/${invitation.token}`;

  // Envoyer l'email
  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: email,
    subject: `Invitation à rejoindre JCI Tabarre Excelsior`,
    html: `
      <h2>Bonjour ${firstName},</h2>
      <p><strong>${admin.name}</strong> vous invite à rejoindre l'espace membre de <strong>JCI Tabarre Excelsior</strong>.</p>
      <p>Cliquez sur le lien ci-dessous pour créer votre compte (valable 48h) :</p>
      <p><a href="${inviteUrl}" style="background:#45C4E0;color:#1B2454;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">Activer mon compte</a></p>
      <p style="color:#999;font-size:12px">Si vous ne reconnaissez pas cet email, vous pouvez l'ignorer.</p>
    `,
  });

  await service.from("audit_logs").insert({
    admin_id: admin.id, action: "member.invite",
    target_type: "member", target_id: member.id,
    details: { email },
    ip_address: req.headers.get("x-forwarded-for") ?? "unknown",
  });

  return NextResponse.json({ success: true, memberId: member.id });
}
