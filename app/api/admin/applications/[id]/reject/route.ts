import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireActiveAdmin, createServiceClient } from "@/lib/supabase/server";
import { isValidUUID, escapeHtml, getTrustedClientIp } from "@/lib/utils/security";
import { getResend } from "@/lib/email/resend";
import { z } from "zod";

const schema = z.object({
  notes: z.string().max(1000).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!isValidUUID(id)) {
    return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });
  }

  const auth = await requireActiveAdmin(["president", "secretaire"]);
  if (auth.error || !auth.admin) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { admin } = auth;

  const body = schema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

  const service = createServiceClient();

  const { data: application, error: fetchError } = await service
    .from("member_applications")
    .select("id, first_name, email, status")
    .eq("id", id)
    .eq("status", "pending")
    .single();

  if (fetchError || !application) {
    return NextResponse.json({ error: "Candidature introuvable ou déjà traitée" }, { status: 404 });
  }

  await service.from("member_applications").update({
    status:       "rejected",
    reviewed_by:  admin.id,
    reviewed_at:  new Date().toISOString(),
    review_notes: body.data.notes || null,
  }).eq("id", id);

  await service.from("audit_logs").insert({
    admin_id:    admin.id,
    action:      "application.reject",
    target_type: "member_application",
    target_id:   id,
    details:     { email: application.email, notes: body.data.notes },
    ip_address:  getTrustedClientIp(req),
  });

  revalidatePath("/ops-jci-htx/dashboard");
  revalidatePath("/ops-jci-htx/candidatures");

  const canSendEmail =
    Boolean(process.env.RESEND_API_KEY) &&
    !process.env.RESEND_API_KEY!.includes("placeholder") &&
    !process.env.RESEND_API_KEY!.includes("your_api_key") &&
    Boolean(process.env.EMAIL_FROM) &&
    !process.env.EMAIL_FROM!.includes("example.com");

  if (canSendEmail) {
    const safeNotes = body.data.notes ? escapeHtml(body.data.notes) : "";
    await getResend().emails.send({
      from: process.env.EMAIL_FROM!,
      to: application.email,
      subject: "Suite de votre candidature à JCI Tabarre Excelsior",
      html: `
        <h2 style="color:#1e3a8a;">Bonjour ${escapeHtml(application.first_name)},</h2>
        <p>Nous avons bien examiné votre candidature pour rejoindre <strong>JCI Tabarre Excelsior</strong>.</p>
        <p>Après examen, nous ne sommes malheureusement pas en mesure de donner suite à votre candidature pour le moment.</p>
        ${safeNotes ? `<p style="background:#f9fafb;border-left:3px solid #d1d5db;padding:10px 14px;color:#4b5563;">${safeNotes}</p>` : ""}
        <p>Nous vous encourageons à rester en contact avec notre organisation et à postuler de nouveau lors d'une prochaine session d'admission.</p>
        <br />
        <p>Cordialement,</p>
        <p><strong>L'équipe JCI Tabarre Excelsior</strong></p>
      `,
    }).catch((e) => console.error("Reject email error:", e));
  }

  return NextResponse.json({ success: true });
}
