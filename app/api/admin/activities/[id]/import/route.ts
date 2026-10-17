import { NextRequest, NextResponse } from "next/server";
import { requireActiveAdmin, createServiceClient } from "@/lib/supabase/server";
import { getSheetRows } from "@/lib/google/sheets";
import { isValidUUID, isValidSheetId, getTrustedClientIp } from "@/lib/utils/security";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: activityId } = await params;
  if (!isValidUUID(activityId)) {
    return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });
  }

  const auth = await requireActiveAdmin(["president", "charge_formation"]);
  if (auth.error || !auth.admin) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { admin } = auth;

  const service = createServiceClient();

  // Récupérer l'activité et son Google Sheet ID
  const { data: activity } = await service
    .from("activities")
    .select("id, title, google_sheet_id, sheet_email_column")
    .eq("id", activityId)
    .single();

  if (!activity) return NextResponse.json({ error: "Activité introuvable" }, { status: 404 });
  if (!activity.google_sheet_id) {
    return NextResponse.json({ error: "Aucun Google Sheet lié à cette activité" }, { status: 400 });
  }

  if (!isValidSheetId(activity.google_sheet_id)) {
    return NextResponse.json({ error: "Identifiant Google Sheet invalide" }, { status: 400 });
  }

  // Lire le Google Sheet
  let headers: string[], rows: Record<string, string>[];
  try {
    ({ headers, rows } = await getSheetRows(activity.google_sheet_id));
  } catch (err) {
    return NextResponse.json({
      error: "Impossible d'accéder au Google Sheet. Vérifiez que le service account y a accès.",
      headers: [],
    }, { status: 500 });
  }

  if (!headers.includes(activity.sheet_email_column)) {
    return NextResponse.json({
      error: `Colonne "${activity.sheet_email_column}" introuvable. Colonnes disponibles : ${headers.join(", ")}`,
      headers,
    }, { status: 400 });
  }

  // Récupérer tous les membres pour matcher par email
  const { data: members } = await service.from("members").select("id, email");
  const memberByEmail = new Map((members ?? []).map((m: { id: string; email: string }) => [m.email.toLowerCase(), m.id]));

  const now = new Date().toISOString();
  let matched = 0, external = 0, skipped = 0;

  const upserts = rows.map((row) => {
    const email = row[activity.sheet_email_column]?.toLowerCase();
    if (!email) { skipped++; return null; }

    const memberId = memberByEmail.get(email) ?? null;
    if (memberId) matched++; else external++;

    const nameCol = headers.find((h) => /nom|name/i.test(h));
    const externalName = !memberId && nameCol ? row[nameCol] : null;

    return {
      activity_id: activityId,
      member_id: memberId,
      external_email: memberId ? null : email,
      external_name: externalName,
      registered_at: now,
      attended: true,
      source: "google_form" as const,
      imported_at: now,
    };
  }).filter(Boolean);

  if (upserts.length > 0) {
    const { error: upsertError } = await service
      .from("attendances")
      .upsert(upserts as object[], { onConflict: "activity_id,member_id", ignoreDuplicates: false });

    if (upsertError) {
      console.error("Attendance import upsert error:", upsertError);
      return NextResponse.json({ error: "Échec de l'enregistrement des présences" }, { status: 500 });
    }
  }

  // Audit log
  await service.from("audit_logs").insert({
    admin_id: admin.id,
    action: "activity.import_google_sheets",
    target_type: "activity",
    target_id: activityId,
    details: { total: rows.length, matched, external, skipped },
    ip_address: getTrustedClientIp(req),
  });

  return NextResponse.json({ success: true, imported: upserts.length, matched, external, skipped });
}
