import { createAuthClient } from "better-auth/react";

const baseURL =
  (typeof window !== "undefined" && window.location.hostname.endsWith("vercel.app"))
    ? window.location.origin
    : (import.meta.env.VITE_SERVER_URL?.replace(/\/$/, "") ||
       (typeof window !== "undefined" ? window.location.origin : "http://localhost:8000"));

export const authClient = createAuthClient({
  baseURL,
});

export const { signIn, signOut, useSession } = authClient;
