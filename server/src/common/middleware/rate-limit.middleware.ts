import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env.js";
import { checkSlidingWindow, checkTokenBucket, type RateLimitResult } from "../utils/rate-limit/limiter.js";
import { getClientIp } from "../utils/rate-limit/ip-utils.js";
import { TooManyRequestsError } from "../utils/app-error.js";
import type { RateLimitPolicy } from "../config/rate-limits.js";

export interface RateLimiterOptions {
  policy: RateLimitPolicy;
  keyGenerator?: (req: Request) => string;
  skip?: (req: Request) => boolean;
  cost?: number | ((req: Request) => number);
  failMode?: "fail-open" | "fail-closed";
}

/**
 * Creates an Express rate limiter middleware powered by atomic Redis Lua scripts.
 */
export function createRateLimiter(options: RateLimiterOptions) {
  const { policy, keyGenerator, skip, cost: staticOrDynamicCost, failMode } = options;
  const effectiveFailMode = failMode || policy.failMode;

  return async (req: Request, res: Response, next: NextFunction) => {
    // 1. Bypass if rate limiting is globally disabled in config/env
    if (!env.RATE_LIMIT_ENABLED) {
      return next();
    }

    // 2. Custom skip callback (e.g. webhooks, internal monitoring)
    if (skip && skip(req)) {
      return next();
    }

    try {
      // 3. Identify user tier & generate Redis partition key
      const isPro = req.session?.user?.plan === "pro";
      const identifier = keyGenerator
        ? keyGenerator(req)
        : req.session?.user?.id
          ? `user:${req.session.user.id}`
          : `ip:${getClientIp(req)}`;

      const key = `${policy.name}:${identifier}`;

      // 4. Determine cost
      const cost =
        typeof staticOrDynamicCost === "function"
          ? staticOrDynamicCost(req)
          : staticOrDynamicCost || (policy.type === "token-bucket" ? policy.cost || 1 : 1);

      // 5. Execute rate limit check in Redis
      let result: RateLimitResult;
      let limitValue: number;

      if (policy.type === "sliding-window") {
        limitValue = isPro && policy.proLimit ? policy.proLimit : policy.limit;
        result = await checkSlidingWindow({
          key,
          limit: limitValue,
          windowSeconds: policy.windowSeconds,
          cost,
        });
      } else {
        const capacity = isPro && policy.proCapacity ? policy.proCapacity : policy.capacity;
        const refillRate = isPro && policy.proRefillRate ? policy.proRefillRate : policy.refillRate;
        limitValue = capacity;
        result = await checkTokenBucket({
          key,
          capacity,
          refillRate,
          cost,
        });
      }

      // 6. Set standard IETF RateLimit-* and legacy X-RateLimit-* headers
      res.setHeader("RateLimit-Limit", limitValue.toString());
      res.setHeader("RateLimit-Remaining", result.remaining.toString());
      res.setHeader("RateLimit-Reset", result.resetSeconds.toString());
      res.setHeader("X-RateLimit-Limit", limitValue.toString());
      res.setHeader("X-RateLimit-Remaining", result.remaining.toString());
      res.setHeader("X-RateLimit-Reset", result.resetSeconds.toString());

      // 7. Check if request was allowed
      if (!result.allowed) {
        res.setHeader("Retry-After", result.retryAfterSeconds.toString());
        return next(
          new TooManyRequestsError(
            `Rate limit exceeded for ${policy.name}. Please retry after ${result.retryAfterSeconds} seconds.`,
            {
              retryAfter: result.retryAfterSeconds,
              resetIn: result.resetSeconds,
            },
          ),
        );
      }

      return next();
    } catch (error) {
      if (effectiveFailMode === "fail-closed") {
        console.error(`[RateLimiter] Error on ${policy.name} (failing closed):`, error);
        res.setHeader("Retry-After", "30");
        return next(
          new TooManyRequestsError(
            "Service temporarily unavailable due to rate limit system failure. Please retry shortly.",
            { retryAfter: 30 },
          ),
        );
      }

      // Fail open: log warning and permit request
      console.warn(`[RateLimiter] Error on ${policy.name} (failing open):`, error instanceof Error ? error.message : error);
      return next();
    }
  };
}
