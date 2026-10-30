import { NextRequest, NextResponse } from "next/server";
import { requireActiveAdmin, createServiceClient } from "@/lib/supabase/server";
import { isValidUUID, escapeHtml, getTrustedClientIp } from "@/lib/utils/security";
import { getResend } from "@/lib/email/resend";


export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!isValidUUID(id)) {
    return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });
  }

  // Auth check avec is_active
  const auth = await requireActiveAdmin(["president", "secretaire"]);
  if (auth.error || !auth.admin) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { admin } = auth;

  const service = createServiceClient();

  // Récupérer la candidature
  const { data: application, error: fetchError } = await service
    .from("member_applications")
    .select("*")
    .eq("id", id)
    .eq("status", "pending")
    .single();

  if (fetchError || !application) {
    return NextResponse.json({ error: "Candidature introuvable ou déjà traitée" }, { status: 404 });
  }

  // Vérifier que l'email n'est pas déjà membre
  const { data: existing } = await service
    .from("members")
    .select("id")
    .eq("email", application.email)
    .single();

  if (existing) {
    return NextResponse.json({ error: "Cet email est déjà enregistré comme membre" }, { status: 409 });
  }

  // Créer le membre (status='pending' en attendant l'activation)
  const { data: member, error: memberError } = await service
    .from("members")
    .insert({
      first_name:      application.first_name,
      last_name:       application.last_name,
      email:           application.email,
      phone:           application.phone,
      profession:      application.profession,
      birth_date:      application.birth_date,
      commune:         application.commune,
      education_level: application.education_level,
      interests:       application.interests,
      how_heard:       application.how_heard,
      status:          "pending",
    })
    .select("id")
    .single();

  if (memberError) {
    return NextResponse.json({ error: memberError.message }, { status: 500 });
  }

  // Créer le token d'invitation (48 h)
  const { data: invitation, error: inviteError } = await service
    .from("member_invitations")
    .insert({
      email:      application.email,
      invited_by: admin.id,
      member_id:  member.id,
    })
    .select("token")
    .single();

  if (inviteError) {
    // Rollback membre
    await service.from("members").delete().eq("id", member.id);
    return NextResponse.json({ error: inviteError.message }, { status: 500 });
  }

  const inviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/espace-membre/invitation/${invitation.token}`;

  // Envoyer l'email d'invitation
  await getResend().emails.send({
    from: process.env.EMAIL_FROM!,
    to: application.email,
    subject: "Votre candidature JCI a été acceptée — Activez votre compte",
    html: `
      <h2 style="color:#1e3a8a;">Félicitations, ${escapeHtml(application.first_name)} !</h2>
      <p>Votre candidature pour rejoindre <strong>JCI Tabarre Excelsior</strong> a été examinée et <strong>acceptée</strong>.</p>
      <p>Cliquez sur le bouton ci-dessous pour créer votre mot de passe et accéder à votre espace membre (lien valable 48h) :</p>
      <p style="margin:24px 0;">
        <a href="${inviteUrl}" style="background:#1e3a8a;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">
          Activer mon compte
        </a>
      </p>
      <p style="color:#9ca3af;font-size:12px;">Si vous ne reconnaissez pas cet email, vous pouvez l'ignorer.</p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;" />
      <p style="color:#6b7280;font-size:12px;">JCI Tabarre Excelsior — Tabarre, Haïti</p>
    `,
  });

  // Marquer la candidature comme approuvée
  await service.from("member_applications").update({
    status:      "approved",
    reviewed_by: admin.id,
    reviewed_at: new Date().toISOString(),
    member_id:   member.id,
  }).eq("id", id);

  // Audit log
  await service.from("audit_logs").insert({
    admin_id:    admin.id,
    action:      "application.approve",
    target_type: "member_application",
    target_id:   id,
    details:     { email: application.email, member_id: member.id },
    ip_address:  getTrustedClientIp(req),
  });

  return NextResponse.json({ success: true, memberId: member.id });
}
