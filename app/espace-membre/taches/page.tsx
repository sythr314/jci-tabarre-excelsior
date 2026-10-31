import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { MemberTaskList, type MemberTask } from "./MemberTaskList";

export const metadata: Metadata = {
  title: "Mes tâches — Espace Membre JCI",
};

export default async function MemberTasksPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/espace-membre/connexion");

  const service = process.env.SUPABASE_SERVICE_ROLE_KEY ? createServiceClient() : supabase;
  const { data: member } = await service
    .from("members")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!member) redirect("/espace-membre/connexion");

  const { data: rawTasks } = await service
    .from("tasks")
    .select(`
      id,
      title,
      description,
      commission,
      priority,
      status,
      due_date,
      created_at,
      activity:activities(id, title),
      assigned_by_admin:admin_users(name, role)
    `)
    .eq("assigned_to", member.id)
    .order("created_at", { ascending: false });

  const tasks = (rawTasks ?? []) as unknown as MemberTask[];

  return (
    <div>
      <MemberTaskList tasks={tasks} />
    </div>
  );
}
