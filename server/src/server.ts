import { createServer } from "node:http";
import { createApplication } from "./app.js";
import { env } from "./common/config/env.js";
import { connectDB } from "./db/index.js";
import { connectRedis, disconnectRedis } from "./lib/redis.js";

async function startServer() {
  try {
    const server = createServer(createApplication());

    server.listen(env.PORT, async () => {
      console.log(`[Server] HTTP server is listening on PORT: ${env.PORT}`);
      try {
        await connectDB();
      } catch (err) {
        console.error("[Postgres] Connection error on startup:", err);
      }
      try {
        await connectRedis();
      } catch (err) {
        console.error("[Redis] Startup connection error:", err);
      }
    });

    const shutdown = async (signal: string) => {
      console.log(`\n[Server] Received ${signal}, shutting down gracefully...`);
      server.close(async () => {
        console.log("[Server] HTTP server closed");
        await disconnectRedis();
        process.exit(0);
      });

      // Force exit after 5 seconds if connections linger
      setTimeout(() => {
        console.error("[Server] Graceful shutdown timeout exceeded, forcing exit");
        process.exit(1);
      }, 5000).unref();
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error: unknown) {
    console.error("[Server] Fatal startup exception:", error);
  }
}

startServer();
