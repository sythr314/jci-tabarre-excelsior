import { NextRequest, NextResponse } from "next/server";
import { requireActiveAdmin, createServiceClient } from "@/lib/supabase/server";
import { isValidUUID, getTrustedClientIp } from "@/lib/utils/security";
import { z } from "zod";

const duesSchema = z.object({
  year: z.number().int().min(2000).max(2100),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: memberId } = await params;
  if (!isValidUUID(memberId)) {
    return NextResponse.json({ error: "Identifiant membre invalide" }, { status: 400 });
  }

  const auth = await requireActiveAdmin(["president", "secretaire"]);
  if (auth.error || !auth.admin) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { admin } = auth;

  const body = duesSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Année invalide" }, { status: 400 });
  }
  const { year } = body.data;

  const service = createServiceClient();
  const { error } = await service.from("dues").upsert({
    member_id: memberId,
    year,
    paid_at: new Date().toISOString(),
    confirmed_by: admin.id,
  }, { onConflict: "member_id,year" });

  if (error) {
    console.error("Dues upsert error:", error);
    return NextResponse.json({ error: "Échec de l'enregistrement de la cotisation" }, { status: 500 });
  }

  // Audit log
  await service.from("audit_logs").insert({
    admin_id: admin.id,
    action: "dues.confirm",
    target_type: "member",
    target_id: memberId,
    details: { year },
    ip_address: getTrustedClientIp(req),
  });

  return NextResponse.json({ success: true });
}
