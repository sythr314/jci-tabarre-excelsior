import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { joinSchema, INTERESTS_OPTIONS, HOW_HEARD_OPTIONS, EDUCATION_OPTIONS } from "@/lib/utils/schemas";
import { applyRateLimit } from "@/lib/utils/rateLimit";
import { createServiceClient } from "@/lib/supabase/server";

const resend = new Resend(process.env.RESEND_API_KEY);

const INTEREST_LABELS = Object.fromEntries(INTERESTS_OPTIONS.map((o) => [o.value, o.label]));
const HOW_HEARD_LABELS = Object.fromEntries(HOW_HEARD_OPTIONS.map((o) => [o.value, o.label]));
const EDUCATION_LABELS = Object.fromEntries(EDUCATION_OPTIONS.map((o) => [o.value, o.label]));

function computeAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

import { escapeHtml } from "@/lib/utils/security";

export async function POST(req: NextRequest) {
  const limited = await applyRateLimit(req);
  if (limited) return limited;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête JSON invalide" }, { status: 400 });
  }

  const result = joinSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  const {
    firstName, lastName, email, phone, birthDate, commune,
    profession, educationLevel, interests, howHeard, motivation, _honeypot,
  } = result.data;

  if (_honeypot) return NextResponse.json({ success: true });

  // Mode Démonstration : si les API Supabase ou Resend ne sont pas encore configurées
  const isDemo =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder") ||
    !process.env.RESEND_API_KEY ||
    process.env.RESEND_API_KEY.includes("placeholder");

  if (isDemo) {
    console.log("[DEMO MODE] Candidature d'adhésion simulée avec succès pour :", email);
    return NextResponse.json({ success: true, demo: true });
  }

  // Persister la candidature en base (service role bypasse RLS)
  const supabase = createServiceClient();
  const { error: dbError } = await supabase.from("member_applications").insert({
    first_name:      firstName,
    last_name:       lastName,
    email:           email.toLowerCase(),
    phone:           phone || null,
    birth_date:      birthDate,
    commune,
    profession:      profession || null,
    education_level: educationLevel || null,
    interests,
    how_heard:       howHeard,
    motivation,
  });

  if (dbError) {
    console.error("Application DB insert error:", dbError);
    return NextResponse.json({ error: "Échec de l'enregistrement de la candidature" }, { status: 500 });
  }

  const age = computeAge(birthDate);
  const interestLabels = interests.map((i) => INTEREST_LABELS[i] ?? i).join(", ");
  const howHeardLabel = HOW_HEARD_LABELS[howHeard] ?? howHeard;
  const educationLabel = educationLevel ? (EDUCATION_LABELS[educationLevel] ?? educationLevel) : null;

  // Valeurs échappées pour insertion sécurisée dans le template HTML
  const safeFirst = escapeHtml(firstName);
  const safeLast = escapeHtml(lastName);
  const safeEmail = escapeHtml(email);
  const safePhone = phone ? escapeHtml(phone) : "";
  const safeBirth = escapeHtml(birthDate);
  const safeCommune = escapeHtml(commune);
  const safeProfession = profession ? escapeHtml(profession) : "";
  const safeEdu = educationLabel ? escapeHtml(educationLabel) : "";
  const safeInterests = escapeHtml(interestLabels);
  const safeHowHeard = escapeHtml(howHeardLabel);
  const safeMotivation = escapeHtml(motivation).replace(/\n/g, "<br />");

  await Promise.allSettled([
    resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: process.env.EMAIL_TO!,
      replyTo: email,
      subject: `[JCI] Nouvelle candidature — ${firstName} ${lastName}`,
      html: `
        <h2 style="color:#1e3a8a;">Nouvelle candidature d'adhésion</h2>
        <p style="color:#6b7280;font-size:13px;">Vous pouvez gérer cette candidature dans le panel admin.</p>
        <table cellpadding="6" cellspacing="0" style="border-collapse:collapse;font-size:14px;">
          <tr><td style="font-weight:bold;color:#374151;padding-right:16px;">Prénom :</td><td>${safeFirst}</td></tr>
          <tr><td style="font-weight:bold;color:#374151;">Nom :</td><td>${safeLast}</td></tr>
          <tr><td style="font-weight:bold;color:#374151;">Email :</td><td><a href="mailto:${safeEmail}">${safeEmail}</a></td></tr>
          ${safePhone ? `<tr><td style="font-weight:bold;color:#374151;">Téléphone :</td><td>${safePhone}</td></tr>` : ""}
          <tr><td style="font-weight:bold;color:#374151;">Date de naissance :</td><td>${safeBirth} (${age} ans)</td></tr>
          <tr><td style="font-weight:bold;color:#374151;">Commune :</td><td>${safeCommune}</td></tr>
          ${safeProfession ? `<tr><td style="font-weight:bold;color:#374151;">Profession :</td><td>${safeProfession}</td></tr>` : ""}
          ${safeEdu ? `<tr><td style="font-weight:bold;color:#374151;">Niveau d'études :</td><td>${safeEdu}</td></tr>` : ""}
          <tr><td style="font-weight:bold;color:#374151;">Domaines d'intérêt :</td><td>${safeInterests}</td></tr>
          <tr><td style="font-weight:bold;color:#374151;">Comment a connu JCI :</td><td>${safeHowHeard}</td></tr>
        </table>
        <hr style="margin:16px 0;border:none;border-top:1px solid #e5e7eb;" />
        <p style="font-weight:bold;color:#374151;">Motivation :</p>
        <p style="color:#4b5563;line-height:1.6;">${safeMotivation}</p>
      `,
    }),
    resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: email,
      subject: "Votre candidature à JCI Tabarre Excelsior",
      html: `
        <h2 style="color:#1e3a8a;">Bonjour ${safeFirst},</h2>
        <p>Nous avons bien reçu votre candidature pour rejoindre <strong>JCI Tabarre Excelsior</strong>.</p>
        <p>Votre dossier a été transmis à notre équipe qui l'examinera attentivement. Nous vous contacterons prochainement pour la suite du processus d'adhésion.</p>
        <p style="background:#f0f9ff;border-left:4px solid #06b6d4;padding:12px 16px;margin:16px 0;border-radius:4px;">
          <strong>Récapitulatif :</strong><br/>
          Domaines d'intérêt : ${safeInterests}<br/>
          Commune : ${safeCommune}
        </p>
        <p>En attendant, consultez notre site pour découvrir nos initiatives et notre communauté.</p>
        <br />
        <p>Cordialement,</p>
        <p><strong>L'équipe JCI Tabarre Excelsior</strong></p>
      `,
    }),
  ]);

  return NextResponse.json({ success: true });
}
