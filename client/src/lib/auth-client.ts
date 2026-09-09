import { createAuthClient } from "better-auth/react";

const baseURL =
  import.meta.env.VITE_SERVER_URL || "http://localhost:8000";

export const authClient = createAuthClient({
  baseURL,
});

export const { signIn, signOut, useSession } = authClient;
