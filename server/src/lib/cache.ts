import { redis, redisKey } from "./redis.js";

/**
 * Builds an isolated, environment-prefixed cache key.
 * Example: cacheKey("github:repos", userId, page) => "codelens:development:cache:github:repos:user_123:1"
 */
export function cacheKey(namespace: string, ...parts: (string | number)[]): string {
  return redisKey("cache", namespace, ...parts);
}

export interface CacheSetOptions {
  /** Time-to-live in seconds */
  ttlSeconds?: number;
}

/**
 * Production-ready Redis Cache Manager
 * - Fully non-blocking and fail-safe: Redis network blips log warnings and degrade to cache misses without throwing.
 * - JSON serialization / deserialization with type safety.
 * - Non-blocking pattern deletion using cursor-based SCAN.
 * - Cache-aside pattern via getOrSet().
 */
export const cache = {
  /**
   * Retrieves an item from the cache. Returns null if missing, expired, or on Redis error.
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await redis.get(key);
      if (raw === null || raw === undefined) {
        return null;
      }
      return JSON.parse(raw) as T;
    } catch (err) {
      console.warn(
        `[Cache] Failed to get key "${key}":`,
        err instanceof Error ? err.message : err
      );
      return null;
    }
  },

  /**
   * Stores an item in the cache with an optional TTL (in seconds).
   * Returns true on success, false on failure.
   */
  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<boolean> {
    try {
      if (value === undefined) {
        return false;
      }
      const serialized = JSON.stringify(value);
      if (ttlSeconds && ttlSeconds > 0) {
        await redis.set(key, serialized, "EX", Math.floor(ttlSeconds));
      } else {
        await redis.set(key, serialized);
      }
      return true;
    } catch (err) {
      console.warn(
        `[Cache] Failed to set key "${key}":`,
        err instanceof Error ? err.message : err
      );
      return false;
    }
  },

  /**
   * Deletes one or more specific keys from the cache.
   */
  async del(keys: string | string[]): Promise<number> {
    try {
      const keyList = Array.isArray(keys) ? keys.filter(Boolean) : [keys].filter(Boolean);
      if (keyList.length === 0) {
        return 0;
      }
      return await redis.del(...keyList);
    } catch (err) {
      console.warn(
        `[Cache] Failed to delete keys:`,
        err instanceof Error ? err.message : err
      );
      return 0;
    }
  },

  /**
   * Checks if a key exists in cache.
   */
  async has(key: string): Promise<boolean> {
    try {
      const exists = await redis.exists(key);
      return exists === 1;
    } catch (err) {
      console.warn(
        `[Cache] Failed to check existence of "${key}":`,
        err instanceof Error ? err.message : err
      );
      return false;
    }
  },

  /**
   * Returns the remaining time-to-live of a key in seconds (-1 if no TTL, -2 if expired/missing).
   */
  async ttl(key: string): Promise<number> {
    try {
      return await redis.ttl(key);
    } catch (err) {
      console.warn(
        `[Cache] Failed to get TTL for "${key}":`,
        err instanceof Error ? err.message : err
      );
      return -2;
    }
  },

  /**
   * Cache-Aside Helper (getOrSet):
   * 1. Looks up the key in cache.
   * 2. If found, returns the cached value immediately.
   * 3. If missing, executes `fetcher()`, stores the result asynchronously, and returns fresh data.
   * 4. If Redis fails or is unavailable, executes `fetcher()` directly (fail-safe).
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds?: number
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const fresh = await fetcher();
    if (fresh !== undefined && fresh !== null) {
      // Background write without blocking the caller
      this.set(key, fresh, ttlSeconds).catch(() => {});
    }

    return fresh;
  },

  /**
   * Deletes all keys matching a glob pattern using non-blocking SCAN.
   * Safe for production (never uses blocking KEYS command).
   */
  async delPattern(pattern: string): Promise<number> {
    try {
      let cursor = "0";
      let totalDeleted = 0;

      do {
        const [nextCursor, matchedKeys] = await redis.scan(
          cursor,
          "MATCH",
          pattern,
          "COUNT",
          100
        );
        cursor = nextCursor;

        if (matchedKeys.length > 0) {
          const deleted = await redis.del(...matchedKeys);
          totalDeleted += deleted;
        }
      } while (cursor !== "0");

      return totalDeleted;
    } catch (err) {
      console.warn(
        `[Cache] Failed to delete pattern "${pattern}":`,
        err instanceof Error ? err.message : err
      );
      return 0;
    }
  },

  /**
   * Deletes all cached items within a specific namespace.
   * Example: clearNamespace("github") clears all keys under `...:cache:github:*`
   */
  async clearNamespace(namespace: string): Promise<number> {
    const pattern = cacheKey(namespace, "*");
    return await this.delPattern(pattern);
  },
};
