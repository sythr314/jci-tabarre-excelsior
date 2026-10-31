import type { EngagementScore } from "./types";
import { getEngagementLevel } from "./types";
import { createClient, createServiceClient } from "./server";

export async function calculateEngagementScore(memberId: string): Promise<EngagementScore> {
  const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY ? createServiceClient() : await createClient();
  const currentYear = new Date().getFullYear();

  const [activitiesResult, attendancesResult, cotisationResult, roleResult] = await Promise.allSettled([
    // Total activités complétées
    supabase.from("activities").select("id", { count: "exact" }).eq("status", "completed"),
    // Présences du membre
    supabase.from("attendances").select("id", { count: "exact" }).eq("member_id", memberId).eq("attended", true),
    // Cotisation de l'année en cours
    supabase.from("dues").select("paid_at").eq("member_id", memberId).eq("year", currentYear).single(),
    // Rôle actif
    supabase.from("member_roles").select("id", { count: "exact" }).eq("member_id", memberId).eq("is_current", true),
  ]);

  const totalActivities = activitiesResult.status === "fulfilled" ? (activitiesResult.value.count ?? 0) : 0;
  const memberAttendances = attendancesResult.status === "fulfilled" ? (attendancesResult.value.count ?? 0) : 0;
  const cotisationPaid = cotisationResult.status === "fulfilled" && cotisationResult.value.data?.paid_at != null;
  const hasActiveRole = roleResult.status === "fulfilled" && (roleResult.value.count ?? 0) > 0;

  // Calcul pondéré
  const presenceRatio = totalActivities > 0 ? Math.min(memberAttendances / totalActivities, 1) : 0;
  const presenceScore = Math.round(presenceRatio * 40);

  // Formations : 5 pts par formation complétée, max 25
  const formationScore = Math.min(memberAttendances, 5) * 5;

  const cotisationScore = cotisationPaid ? 20 : 0;
  const roleScore = hasActiveRole ? 15 : 0;

  const total = presenceScore + formationScore + cotisationScore + roleScore;

  return {
    total,
    level: getEngagementLevel(total),
    breakdown: {
      presence: presenceScore,
      formations: formationScore,
      cotisation: cotisationScore,
      role: roleScore,
    },
  };
}
