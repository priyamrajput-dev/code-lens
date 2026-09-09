import { createServer } from "node:http";
import { createApplication } from "./app";
import { env } from "./common/config/env";
import { connectDB } from "./db/index";

async function startServer() {
  try {
    const server = createServer(createApplication());

    server.listen(env.PORT, () => {
      connectDB();
      console.log(`http server is listing at PORT: ${env.PORT}`);
    });
  } catch (error: unknown) {
    console.error(error);
  }
}

startServer();
