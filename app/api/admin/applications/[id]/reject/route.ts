import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);

const schema = z.object({
  notes: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const service = createServiceClient();
  const { data: admin } = await service
    .from("admin_users")
    .select("id, role, name")
    .eq("user_id", user.id)
    .single();

  if (!admin || !["president", "secretaire"].includes(admin.role)) {
    return NextResponse.json({ error: "Permission insuffisante" }, { status: 403 });
  }

  const body = schema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

  // Récupérer la candidature
  const { data: application, error: fetchError } = await service
    .from("member_applications")
    .select("id, first_name, email, status")
    .eq("id", id)
    .eq("status", "pending")
    .single();

  if (fetchError || !application) {
    return NextResponse.json({ error: "Candidature introuvable ou déjà traitée" }, { status: 404 });
  }

  // Marquer comme rejetée
  await service.from("member_applications").update({
    status:       "rejected",
    reviewed_by:  admin.id,
    reviewed_at:  new Date().toISOString(),
    review_notes: body.data.notes || null,
  }).eq("id", id);

  // Email de notification au candidat
  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: application.email,
    subject: "Suite de votre candidature à JCI Tabarre Excelsior",
    html: `
      <h2 style="color:#1e3a8a;">Bonjour ${application.first_name},</h2>
      <p>Nous avons bien examiné votre candidature pour rejoindre <strong>JCI Tabarre Excelsior</strong>.</p>
      <p>Après examen, nous ne sommes malheureusement pas en mesure de donner suite à votre candidature pour le moment.</p>
      ${body.data.notes ? `<p style="background:#f9fafb;border-left:3px solid #d1d5db;padding:10px 14px;color:#4b5563;">${body.data.notes}</p>` : ""}
      <p>Nous vous encourageons à rester en contact avec notre organisation et à postuler de nouveau lors d'une prochaine session d'admission.</p>
      <br />
      <p>Cordialement,</p>
      <p><strong>L'équipe JCI Tabarre Excelsior</strong></p>
    `,
  }).catch((e) => console.error("Reject email error:", e));

  // Audit log
  await service.from("audit_logs").insert({
    admin_id:    admin.id,
    action:      "application.reject",
    target_type: "member_application",
    target_id:   id,
    details:     { email: application.email, notes: body.data.notes },
    ip_address:  req.headers.get("x-forwarded-for") ?? "unknown",
  });

  return NextResponse.json({ success: true });
}
