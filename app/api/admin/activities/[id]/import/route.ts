import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getSheetRows } from "@/lib/google/sheets";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: activityId } = await params;

  // Vérifier session admin
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const service = createServiceClient();
  const { data: admin } = await service
    .from("admin_users").select("id, role").eq("user_id", user.id).single();
  if (!admin || !["president", "charge_formation"].includes(admin.role)) {
    return NextResponse.json({ error: "Permission insuffisante" }, { status: 403 });
  }

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
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }
  }

  // Audit log
  await service.from("audit_logs").insert({
    admin_id: admin.id,
    action: "activity.import_google_sheets",
    target_type: "activity",
    target_id: activityId,
    details: { total: rows.length, matched, external, skipped },
    ip_address: req.headers.get("x-forwarded-for") ?? "unknown",
  });

  return NextResponse.json({ success: true, imported: upserts.length, matched, external, skipped });
}
