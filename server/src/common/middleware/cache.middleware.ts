import type { Request, Response, NextFunction } from "express";
import { cache, cacheKey } from "../../lib/cache.js";

export interface CacheRouteOptions {
  /** Cache time-to-live in seconds */
  ttlSeconds: number;
  /** Optional custom cache key generator. Defaults to `(user.id || 'anon') + req.originalUrl` */
  keyGenerator?: (req: Request) => string;
}

/**
 * Express middleware for caching idempotent GET responses in Redis.
 * Automatically injects `X-Cache: HIT` or `X-Cache: MISS` header.
 */
export function cacheRoute(options: CacheRouteOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET or HEAD requests
    if (req.method !== "GET" && req.method !== "HEAD") {
      return next();
    }

    const userId = (req as any).user?.id ?? "anonymous";
    const key = options.keyGenerator
      ? options.keyGenerator(req)
      : cacheKey("http", userId, req.originalUrl);

    try {
      const cached = await cache.get<{
        status: number;
        body: unknown;
        contentType?: string;
      }>(key);

      if (cached) {
        res.setHeader("X-Cache", "HIT");
        if (cached.contentType) {
          res.setHeader("Content-Type", cached.contentType);
        }
        return res.status(cached.status).send(cached.body);
      }

      res.setHeader("X-Cache", "MISS");

      // Intercept send & json to store response
      const originalSend = res.send.bind(res);
      res.send = (body: unknown): Response => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const contentType = res.getHeader("content-type")?.toString();
          let parsedBody = body;
          if (typeof body === "string" && contentType?.includes("application/json")) {
            try {
              parsedBody = JSON.parse(body);
            } catch {}
          }
          cache.set(
            key,
            { status: res.statusCode, body: parsedBody, contentType },
            options.ttlSeconds
          ).catch(() => {});
        }
        return originalSend(body);
      };

      next();
    } catch {
      // Degrade gracefully if cache check fails
      next();
    }
  };
}
