import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { contactSchema } from "@/lib/utils/schemas";
import { applyRateLimit } from "@/lib/utils/rateLimit";
import { escapeHtml } from "@/lib/utils/security";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const limited = await applyRateLimit(req);
  if (limited) return limited;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête JSON invalide" }, { status: 400 });
  }

  const result = contactSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  const { name, email, subject, message, _honeypot } = result.data;

  if (_honeypot) {
    return NextResponse.json({ success: true });
  }

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");

  // Mode Démonstration : si l'API Resend n'est pas encore configurée
  if (
    !process.env.RESEND_API_KEY ||
    process.env.RESEND_API_KEY.includes("placeholder") ||
    !process.env.EMAIL_FROM
  ) {
    console.log("[DEMO MODE] Message de contact simulé avec succès de :", safeEmail);
    return NextResponse.json({ success: true, demo: true });
  }

  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_TO || process.env.EMAIL_FROM,
    replyTo: email,
    subject: `[Contact JCI] ${subject}`,
    html: `
      <h2>Nouveau message de contact</h2>
      <p><strong>De :</strong> ${safeName} (${safeEmail})</p>
      <p><strong>Sujet :</strong> ${safeSubject}</p>
      <hr />
      <p>${safeMessage}</p>
    `,
  });

  if (error) {
    console.error("Resend error:", error);
    return NextResponse.json({ error: "Échec de l'envoi" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
