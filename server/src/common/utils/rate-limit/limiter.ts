import { redis, redisKey } from "../../../lib/redis.js";
import { SLIDING_WINDOW_LUA, TOKEN_BUCKET_LUA } from "./lua-scripts.js";

export interface RateLimitResult {
  allowed: boolean;
  current: number;
  remaining: number;
  resetSeconds: number;
  retryAfterSeconds: number;
}

export interface SlidingWindowOptions {
  key: string;
  limit: number;
  windowSeconds: number;
  cost?: number;
}

export interface TokenBucketOptions {
  key: string;
  capacity: number;
  refillRate: number; // tokens per second
  cost?: number;
}

/**
 * Executes the atomic sliding window counter script in Redis.
 */
export async function checkSlidingWindow(
  options: SlidingWindowOptions,
): Promise<RateLimitResult> {
  const { key, limit, windowSeconds, cost = 1 } = options;
  const fullKey = redisKey("rl", "sw", key);

  const raw = await redis.eval(
    SLIDING_WINDOW_LUA,
    1,
    fullKey,
    limit.toString(),
    windowSeconds.toString(),
    cost.toString(),
  );

  const [allowed, current, remaining, resetSeconds, retryAfterSeconds] =
    raw as [number, number, number, number, number];

  return {
    allowed: allowed === 1,
    current,
    remaining,
    resetSeconds,
    retryAfterSeconds,
  };
}

/**
 * Executes the atomic token bucket script in Redis.
 */
export async function checkTokenBucket(
  options: TokenBucketOptions,
): Promise<RateLimitResult> {
  const { key, capacity, refillRate, cost = 1 } = options;
  const fullKey = redisKey("rl", "tb", key);

  const raw = await redis.eval(
    TOKEN_BUCKET_LUA,
    1,
    fullKey,
    capacity.toString(),
    refillRate.toString(),
    cost.toString(),
  );

  const [allowed, current, remaining, resetSeconds, retryAfterSeconds] =
    raw as [number, number, number, number, number];

  return {
    allowed: allowed === 1,
    current,
    remaining,
    resetSeconds,
    retryAfterSeconds,
  };
}
