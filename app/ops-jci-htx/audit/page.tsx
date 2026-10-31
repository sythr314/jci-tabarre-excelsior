import type { Metadata } from "next";
import { requireActiveAdmin, createServiceClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AuditLogClient, type AuditLogEntry } from "./AuditLogClient";

export const metadata: Metadata = {
  title: "Journal d'Audit & Traçabilité — Admin JCI Tabarre",
};

export default async function AuditLogPage() {
  const auth = await requireActiveAdmin(["president", "secretaire"]);
  if (auth.error) {
    redirect("/ops-jci-htx/dashboard");
  }

  const service = createServiceClient();
  const { data: rawLogs } = await service
    .from("audit_logs")
    .select(`
      id,
      action,
      target_type,
      target_id,
      details,
      ip_address,
      created_at,
      admin_user:admin_users(name, email, role)
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  const logs = (rawLogs ?? []) as unknown as AuditLogEntry[];

  return (
    <div className="p-8 max-w-6xl">
      <AuditLogClient logs={logs} />
    </div>
  );
}
