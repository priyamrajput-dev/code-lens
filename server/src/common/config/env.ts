import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(8000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  CLIENT_URL: z.string().default("http://localhost:3000"),
  DATABASE_URL: z.string(),
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.string().default("http://localhost:8000"),
  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),
  
  // GitHub App
  GITHUB_APP_ID: z.string().optional(),
  GITHUB_PRIVATE_KEY: z.string().optional(),
  GITHUB_APP_PRIVATE_KEY: z.string().optional(),
  GITHUB_WEBHOOK_SECRET: z.string().optional(),
  GITHUB_APP_SLUG: z.string().optional(),

  // AI & Vector DB
  GEMINI_API_KEY: z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  PINECONE_API_KEY: z.string().optional(),
  PINECONE_INDEX: z.string().default("code-lens-index").optional(),

  // Razorpay Billing
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  RAZORPAY_PRO_PLAN_ID: z.string().optional(),

  // Redis & Rate Limiting
  REDIS_URL: z.string().default("redis://localhost:6379"),
  REDIS_KEY_PREFIX: z.string().optional(),
  RATE_LIMIT_ENABLED: z
    .preprocess((val) => (val === undefined ? true : val !== "false" && val !== false), z.boolean())
    .default(true),
}).superRefine((data, ctx) => {
  if (data.NODE_ENV === "production" && !process.env.REDIS_URL) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "REDIS_URL is required in production",
      path: ["REDIS_URL"],
    });
  }
});

const createEnv = (env: NodeJS.ProcessEnv) => {
  const safeParseResult = envSchema.safeParse(env);
  if (!safeParseResult.success) {
    console.error("Environment Validation Failed:", safeParseResult.error.format());
    throw new Error(safeParseResult.error.message);
  }

  return safeParseResult.data;
};

export const env = createEnv(process.env);
