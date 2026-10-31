import type { Metadata } from "next";
import { createServiceClient } from "@/lib/supabase/server";
import { TaskListClient, type TaskItem } from "./TaskListClient";

export const metadata: Metadata = {
  title: "Tâches & Commissions — Admin JCI Tabarre",
};

export default async function AdminTasksPage() {
  const service = createServiceClient();

  const [tasksRes, membersRes, activitiesRes] = await Promise.allSettled([
    service
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
        assigned_member:members(id, first_name, last_name, email),
        assigned_by_admin:admin_users(id, name, role),
        activity:activities(id, title)
      `)
      .order("created_at", { ascending: false }),
    service
      .from("members")
      .select("id, first_name, last_name, email, community_role")
      .eq("status", "active")
      .order("first_name"),
    service
      .from("activities")
      .select("id, title")
      .order("activity_date", { ascending: false }),
  ]);

  const rawTasks = (
    tasksRes.status === "fulfilled" && tasksRes.value.data ? tasksRes.value.data : []
  ) as unknown as TaskItem[];

  const members =
    membersRes.status === "fulfilled" && membersRes.value.data ? membersRes.value.data : [];

  const activities =
    activitiesRes.status === "fulfilled" && activitiesRes.value.data ? activitiesRes.value.data : [];

  return (
    <div className="p-8 max-w-6xl">
      <TaskListClient tasks={rawTasks} members={members} activities={activities} />
    </div>
  );
}
