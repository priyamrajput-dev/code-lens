import { Redis, type RedisOptions } from "ioredis";
import { env } from "../common/config/env.js";

let redisInstance: Redis | null = null;

function sanitizeRedisUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    parsed.password = "";
    return parsed.toString();
  } catch {
    return "[invalid-redis-url]";
  }
}

export function getRedisClient(): Redis {
  if (redisInstance) {
    return redisInstance;
  }

  const isTls = env.REDIS_URL.startsWith("rediss://");
  let host = "localhost";
  try {
    host = new URL(env.REDIS_URL).hostname;
  } catch {}

  const redisOptions: RedisOptions = {
    lazyConnect: true,
    maxRetriesPerRequest: 2,
    enableOfflineQueue: false,
    connectTimeout: 5000,
    connectionName: "code-lens-api",
    retryStrategy(times) {
      if (times > 10) {
        // Stop reconnect spam after 10 consecutive attempts; wait 10s between checks
        return 10000;
      }
      return Math.min(times * 200, 3000);
    },
    ...(isTls
      ? {
          tls: {
            servername: host,
          },
        }
      : {}),
  };

  redisInstance = new Redis(env.REDIS_URL, redisOptions);

  redisInstance.on("connect", () => {
    console.log("[Redis] Socket connection established");
  });

  redisInstance.on("ready", () => {
    console.log("[Redis] Client ready to accept commands");
  });

  redisInstance.on("error", (err: Error) => {
    // Prevent unhandled error event from crashing node process
    console.error("[Redis] Client error:", err.message);
  });

  redisInstance.on("close", () => {
    console.log("[Redis] Connection closed");
  });

  redisInstance.on("reconnecting", (delay: number) => {
    console.log(`[Redis] Reconnecting in ${delay}ms...`);
  });

  return redisInstance;
}

export const redis = getRedisClient();

/**
 * Builds an isolated, environment-prefixed Redis key.
 * Example: redisKey("rl", "auth", "127.0.0.1") => "codelens:development:rl:auth:127.0.0.1"
 */
export function redisKey(...parts: (string | number)[]): string {
  const prefix = env.REDIS_KEY_PREFIX || `codelens:${env.NODE_ENV}`;
  const cleanParts = parts.map((p) => String(p).trim()).filter(Boolean);
  return [prefix, ...cleanParts].join(":");
}

/**
 * Connects Redis at application startup without hanging server boot if Redis is temporarily unreachable.
 */
export async function connectRedis(): Promise<boolean> {
  const client = getRedisClient();
  if (client.status === "ready" || client.status === "connecting" || client.status === "connect") {
    return true;
  }

  try {
    const connectPromise = client.connect();
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Redis connection timed out after 5000ms")), 5000)
    );
    await Promise.race([connectPromise, timeoutPromise]);
    console.log(`[Redis] Connected successfully to ${sanitizeRedisUrl(env.REDIS_URL)}`);
    return true;
  } catch (error) {
    console.warn(
      `[Redis] Initial connection warning: ${error instanceof Error ? error.message : "Failed to connect"}. API will continue in fail-open mode.`
    );
    return false;
  }
}

/**
 * Graceful Redis disconnection with timeout fallback to force disconnect.
 */
export async function disconnectRedis(): Promise<void> {
  if (!redisInstance) return;

  try {
    console.log("[Redis] Disconnecting client gracefully...");
    const quitPromise = redisInstance.quit();
    const timeoutPromise = new Promise<void>((resolve) =>
      setTimeout(() => {
        if (redisInstance && redisInstance.status !== "end") {
          console.warn("[Redis] quit() timed out after 2000ms, forcing disconnect()");
          redisInstance.disconnect();
        }
        resolve();
      }, 2000)
    );

    await Promise.race([quitPromise, timeoutPromise]);
    console.log("[Redis] Client disconnected");
  } catch (err) {
    console.error("[Redis] Disconnect error:", err);
    try {
      redisInstance.disconnect();
    } catch {}
  }
}

/**
 * Cheap PING health check with a fast timeout (1500ms).
 */
export async function isRedisHealthy(): Promise<boolean> {
  if (!redisInstance || redisInstance.status !== "ready") {
    return false;
  }

  try {
    const pingPromise = redisInstance.ping();
    const timeoutPromise = new Promise<string>((_, reject) =>
      setTimeout(() => reject(new Error("PING timeout")), 1500)
    );
    const result = await Promise.race([pingPromise, timeoutPromise]);
    return result === "PONG";
  } catch {
    return false;
  }
}
