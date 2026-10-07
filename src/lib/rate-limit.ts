import "server-only";

type Bucket = { count: number; resetAt: number };

/**
 * Fixed-window limiter held in module memory.
 *
 * LIMITATION: this is per-process. On a serverless platform each instance
 * keeps its own counters, so the effective limit is `limit x instances` and
 * everything resets on cold start. It stops casual form hammering, not a
 * determined attacker. Swap in Vercel KV / Upstash Redis before this carries
 * real production traffic — the call signature below is designed to survive
 * that change unchanged.
 */
const buckets = new Map<string, Bucket>();

const MAX_TRACKED_KEYS = 10_000;

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  /** Seconds until the window resets. */
  retryAfter: number;
};

export function rateLimit(
  key: string,
  { limit = 5, windowMs = 60_000 }: { limit?: number; windowMs?: number } = {},
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    // Opportunistic sweep so a long-lived process cannot grow unbounded.
    if (buckets.size > MAX_TRACKED_KEYS) {
      for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
    }
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }

  existing.count += 1;
  const retryAfter = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));

  return {
    ok: existing.count <= limit,
    remaining: Math.max(0, limit - existing.count),
    retryAfter,
  };
}

/**
 * Best-effort client address. Behind Vercel's proxy `x-forwarded-for` is
 * trustworthy; locally it is absent, so we fall back to a shared bucket.
 */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip")?.trim() || "local";
}
