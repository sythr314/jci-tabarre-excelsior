import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { applyRateLimit } from "@/lib/utils/rateLimit";

const toypSchema = z.object({
  nomineeFullName: z.string().min(3, "Nom complet requis"),
  nomineeEmail: z.string().email("Email invalide"),
  nomineePhone: z.string().optional(),
  nomineeAge: z.coerce.number().int().min(18).max(40),
  nomineeCity: z.string().min(2, "Ville requise"),
  category: z.string().min(2, "Catégorie TOYP requise"),
  localOrgSlug: z.string().min(2, "OLM parraine requise"),
  nominatorName: z.string().min(2, "Nom du nominateur requis"),
  nominatorEmail: z.string().email("Email du nominateur invalide"),
  biography: z.string().min(20, "Biographie requise (min. 20 caractères)"),
  achievements: z.string().min(20, "Réalisations requises (min. 20 caractères)"),
  supportingUrl: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const limited = await applyRateLimit(req);
  if (limited) return limited;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête JSON invalide" }, { status: 400 });
  }

  const parsed = toypSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Données invalides" },
      { status: 400 }
    );
  }

  const d = parsed.data;
  const supabase = createServiceClient();

  // Tentative d'insertion dans toyp_nominations (si la migration 005 est appliquée)
  const { error } = await supabase.from("toyp_nominations").insert({
    nominee_full_name: d.nomineeFullName,
    nominee_email: d.nomineeEmail.toLowerCase(),
    nominee_phone: d.nomineePhone || null,
    nominee_age: d.nomineeAge,
    nominee_city: d.nomineeCity,
    category: d.category,
    local_org_slug: d.localOrgSlug,
    nominator_name: d.nominatorName,
    nominator_email: d.nominatorEmail.toLowerCase(),
    biography: d.biography,
    achievements: d.achievements,
    supporting_url: d.supportingUrl || null,
  });

  if (error) {
    // Fallback sans échec dans audit_logs pour garantir zéro perte même avant migration SQL 005
    await supabase.from("audit_logs").insert({
      actor_name: d.nominatorName,
      actor_role: "public_toyp",
      action: "toyp.nomination_submitted",
      target_type: "toyp_nomination",
      target_label: `${d.nomineeFullName} (${d.category})`,
      details: d,
    });
  }

  revalidatePath("/ops-jci-htx/toyp");
  revalidatePath("/ops-jci-htx/dashboard");

  return NextResponse.json({ success: true });
}
