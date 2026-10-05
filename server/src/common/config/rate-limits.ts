export type RateLimitFailMode = "fail-open" | "fail-closed";

export interface SlidingWindowPolicy {
  type: "sliding-window";
  limit: number;
  windowSeconds: number;
  proLimit?: number;
  failMode: RateLimitFailMode;
  name: string;
}

export interface TokenBucketPolicy {
  type: "token-bucket";
  capacity: number;
  refillRate: number; // tokens per second
  proCapacity?: number;
  proRefillRate?: number;
  cost?: number;
  failMode: RateLimitFailMode;
  name: string;
}

export type RateLimitPolicy = SlidingWindowPolicy | TokenBucketPolicy;

/**
 * Predefined rate limit policies for code-lens routes.
 *
 * Rationale for Fail-Mode choices:
 * - "fail-open": Standard read/write routes allow traffic through if Redis is temporarily unreachable.
 *   Uptime and user experience are prioritized; a warning is logged.
 * - "fail-closed": Expensive operations (like AI code reviews using external LLM APIs) reject traffic
 *   if Redis is unreachable to prevent catastrophic cost overruns or quota exhaustion.
 */
export const rateLimitPolicies = {
  // Global catch-all for /api endpoints
  global: {
    type: "sliding-window",
    limit: 120, // 120 req / minute for anonymous / free
    windowSeconds: 60,
    proLimit: 300, // 300 req / minute for pro
    failMode: "fail-open",
    name: "global",
  } satisfies SlidingWindowPolicy,

  // Strict brute-force protection for authentication endpoints
  auth: {
    type: "sliding-window",
    limit: 10, // 10 req / minute per IP
    windowSeconds: 60,
    failMode: "fail-open", // Maintain auth availability while logging alerts
    name: "auth",
  } satisfies SlidingWindowPolicy,

  // AI review generation & snippet analysis (expensive LLM calls)
  reviews: {
    type: "token-bucket",
    capacity: 3, // Free tier: burst of 3 reviews
    refillRate: 1 / 60, // 1 token every 60 seconds (0.0167 tokens/sec)
    proCapacity: 15, // Pro tier: burst of 15 reviews
    proRefillRate: 1 / 10, // 1 token every 10 seconds (0.1 tokens/sec)
    cost: 1,
    failMode: "fail-closed", // Prevent LLM bill runaway if Redis is down
    name: "reviews-ai",
  } satisfies TokenBucketPolicy,

  // Repository synchronization (heavy DB & GitHub API sync)
  repoSync: {
    type: "sliding-window",
    limit: 3, // 3 syncs / minute for free
    windowSeconds: 60,
    proLimit: 10, // 10 syncs / minute for pro
    failMode: "fail-open",
    name: "repo-sync",
  } satisfies SlidingWindowPolicy,

  // General read queries (list reviews, repo status, subscription info)
  readOnly: {
    type: "sliding-window",
    limit: 60, // 60 req / minute for free
    windowSeconds: 60,
    proLimit: 180, // 180 req / minute for pro
    failMode: "fail-open",
    name: "read-only",
  } satisfies SlidingWindowPolicy,
} as const;
