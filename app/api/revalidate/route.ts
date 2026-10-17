import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { timingSafeCompare } from "@/lib/utils/security";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-webhook-secret");
  const expectedSecret = process.env.SANITY_WEBHOOK_SECRET;

  if (!expectedSecret || !timingSafeCompare(secret, expectedSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/initiatives");
  revalidatePath("/initiatives/[slug]", "page");

  return NextResponse.json({ revalidated: true });
}
