import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { env } from "../common/config/env.js";

export const google = createGoogleGenerativeAI({
  apiKey: env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || "",
});

export const openrouter = createOpenRouter({
  apiKey: env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY || "",
});

export function getAiModel() {
  if (env.GEMINI_API_KEY || process.env.GEMINI_API_KEY) {
    return google("gemini-3.6-flash");
  }
  return openrouter("openrouter/free");
}

