import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireActiveAdmin, createServiceClient } from "@/lib/supabase/server";
import { escapeHtml, getTrustedClientIp } from "@/lib/utils/security";
import { getResend } from "@/lib/email/resend";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
});

export async function POST(req: NextRequest) {
  const auth = await requireActiveAdmin(["president", "secretaire"]);
  if (auth.error || !auth.admin) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { admin } = auth;

  const body = schema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

  const { email, firstName, lastName } = body.data;
  const service = createServiceClient();

  const { data: existing } = await service
    .from("members")
    .select("id")
    .eq("email", email.toLowerCase())
    .single();

  if (existing) {
    return NextResponse.json({ error: "Cette adresse email est déjà associée à un membre" }, { status: 409 });
  }

  const { data: member, error: memberError } = await service.from("members").insert({
    email: email.toLowerCase(),
    first_name: firstName,
    last_name: lastName,
    status: "pending",
    invited_by: null,
  }).select("id").single();

  if (memberError) {
    console.error("Member invite insert error:", memberError);
    return NextResponse.json({ error: "Échec de la création du membre" }, { status: 500 });
  }

  const { data: invitation, error: inviteError } = await service
    .from("member_invitations")
    .insert({ email: email.toLowerCase(), invited_by: admin.id, member_id: member.id })
    .select("token")
    .single();

  if (inviteError) {
    console.error("Invitation token insert error:", inviteError);
    await service.from("members").delete().eq("id", member.id);
    return NextResponse.json({ error: "Échec de génération de l'invitation" }, { status: 500 });
  }

  await service.from("audit_logs").insert({
    admin_id: admin.id,
    action: "member.invite",
    target_type: "member",
    target_id: member.id,
    details: { email },
    ip_address: getTrustedClientIp(req),
  });

  revalidatePath("/ops-jci-htx/membres");

  const baseUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    req.nextUrl.origin ||
    "https://jci-excelsior.netlify.app"
  ).replace(/\/$/, "");
  const inviteUrl = `${baseUrl}/espace-membre/invitation/${invitation.token}`;

  const canSendEmail =
    Boolean(process.env.RESEND_API_KEY) &&
    !process.env.RESEND_API_KEY!.includes("placeholder") &&
    !process.env.RESEND_API_KEY!.includes("your_api_key") &&
    Boolean(process.env.EMAIL_FROM) &&
    !process.env.EMAIL_FROM!.includes("example.com");

  if (canSendEmail) {
    await getResend().emails.send({
      from: process.env.EMAIL_FROM!,
      to: email,
      subject: `Invitation à rejoindre JCI Tabarre Excelsior`,
      html: `
        <h2>Bonjour ${escapeHtml(firstName)},</h2>
        <p><strong>${escapeHtml(admin.name)}</strong> vous invite à rejoindre l'espace membre de <strong>JCI Tabarre Excelsior</strong>.</p>
        <p>Cliquez sur le lien ci-dessous pour créer votre compte (valable 48h) :</p>
        <p><a href="${inviteUrl}" style="background:#45C4E0;color:#1B2454;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">Activer mon compte</a></p>
        <p style="color:#999;font-size:12px">Si vous ne reconnaissez pas cet email, vous pouvez l'ignorer.</p>
      `,
    }).catch((e) => console.error("Invite email error:", e));
  }

  return NextResponse.json({ success: true, memberId: member.id, inviteUrl });
}
