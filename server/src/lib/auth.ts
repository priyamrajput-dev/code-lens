import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/index.js";
import * as schema from "../db/schema.js";
import { env } from "../common/config/env.js";

const clientURL = env.CLIENT_URL.replace(/\/$/, "");
const isSecure = env.BETTER_AUTH_URL.startsWith("https://") || env.NODE_ENV === "production";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  account: {
    storeStateStrategy: "database",
    skipStateCookieCheck: true,
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: isSecure ? "none" : "lax",
      secure: isSecure,
    },
    useSecureCookies: isSecure,
  },
  onAPIError: {
    errorURL: `${clientURL}/sign-in`,
  },
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      mapProfileToUser: async (profile) => ({
        email: profile.email ?? `${profile.id}@users.noreply.github.com`,
        name: profile.name ?? profile.login,
        image: profile.avatar_url,
      }),
    },
  },
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [
    clientURL,
    "https://code-lens-peach.vercel.app",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173",
    "http://localhost:8080",
    "http://localhost:*",
    "http://127.0.0.1:*",
  ],
});
