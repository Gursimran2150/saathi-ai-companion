export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  /** Seconds until the caller may retry (0 when allowed). */
  retryAfter: number;
}

/**
 * Fixed-window, in-memory rate limiter keyed by client id.
 * Per-instance on serverless, which is enough to stop casual abuse of the AI routes.
 */
export function createRateLimiter(limit: number, windowMs = 60_000, now: () => number = Date.now) {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return function check(key: string): RateLimitResult {
    const t = now();
    const entry = hits.get(key);

    if (!entry || entry.resetAt <= t) {
      if (hits.size > 10_000) {
        for (const [k, v] of hits) if (v.resetAt <= t) hits.delete(k);
      }
      hits.set(key, { count: 1, resetAt: t + windowMs });
      return { allowed: true, remaining: limit - 1, retryAfter: 0 };
    }

    if (entry.count >= limit) {
      return { allowed: false, remaining: 0, retryAfter: Math.ceil((entry.resetAt - t) / 1000) };
    }

    entry.count += 1;
    return { allowed: true, remaining: limit - entry.count, retryAfter: 0 };
  };
}
