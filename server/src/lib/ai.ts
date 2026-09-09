import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { env } from "../common/config/env.js";

export const openrouter = createOpenRouter({
  apiKey: env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY || "",
});
