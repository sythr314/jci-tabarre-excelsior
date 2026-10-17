import { NextRequest, NextResponse } from "next/server";
import { getTrustedClientIp } from "@/lib/utils/security";

const isUpstashConfigured =
  !!process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_URL !== "placeholder" &&
  !!process.env.UPSTASH_REDIS_REST_TOKEN &&
  process.env.UPSTASH_REDIS_REST_TOKEN !== "placeholder";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let ratelimitInstance: any = null;

async function getRateLimiter() {
  if (ratelimitInstance) return ratelimitInstance;

  const { Ratelimit } = await import("@upstash/ratelimit");
  const { Redis } = await import("@upstash/redis");

  ratelimitInstance = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, "10 m"),
    analytics: false,
  });

  return ratelimitInstance;
}

export async function applyRateLimit(
  req: NextRequest,
  customIdentifier?: string
): Promise<NextResponse | null> {
  if (!isUpstashConfigured) {
    if (process.env.NODE_ENV === "production") {
      console.warn("ATTENTION SÉCURITÉ: Upstash Redis n'est pas configuré en production. Rate limiting inactif.");
    }
    return null;
  }

  try {
    const limiter = await getRateLimiter();
    const identifier = customIdentifier || getTrustedClientIp(req);
    const { success, reset } = await limiter.limit(identifier);

    if (!success) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000);
      return NextResponse.json(
        { error: "Trop de requêtes. Veuillez réessayer plus tard." },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      );
    }
  } catch (err) {
    console.error("Rate limiting evaluation error:", err);
    // En cas d'erreur Redis temporaire, autoriser mais journaliser
  }

  return null;
}
