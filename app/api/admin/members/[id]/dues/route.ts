import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: memberId } = await params;

  // Vérifier session admin
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const service = createServiceClient();
  const { data: admin } = await service.from("admin_users").select("id, role").eq("user_id", user.id).single();
  if (!admin || !["president", "secretaire"].includes(admin.role)) {
    return NextResponse.json({ error: "Permission insuffisante" }, { status: 403 });
  }

  const { year } = await req.json();

  const { error } = await service.from("dues").upsert({
    member_id: memberId,
    year,
    paid_at: new Date().toISOString(),
    confirmed_by: admin.id,
  }, { onConflict: "member_id,year" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Audit log
  await service.from("audit_logs").insert({
    admin_id: admin.id,
    action: "dues.confirm",
    target_type: "member",
    target_id: memberId,
    details: { year },
    ip_address: req.headers.get("x-forwarded-for") ?? "unknown",
  });

  return NextResponse.json({ success: true });
}
