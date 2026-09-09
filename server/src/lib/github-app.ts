import { App } from "octokit";
import { env } from "../common/config/env.js";

let githubApp: App | null = null;

export function getGithubApp(): App {
  if (!githubApp) {
    if (!env.GITHUB_APP_ID || !env.GITHUB_PRIVATE_KEY) {
      throw new Error("GitHub App credentials (GITHUB_APP_ID, GITHUB_PRIVATE_KEY) are not configured.");
    }

    githubApp = new App({
      appId: env.GITHUB_APP_ID,
      privateKey: env.GITHUB_PRIVATE_KEY.replace(/\\n/g, "\n"),
      webhooks: {
        secret: env.GITHUB_WEBHOOK_SECRET || "default_secret",
      },
    });
  }

  return githubApp;
}

export function getGithubInstallUrl(userId: string): string {
  const appSlug = env.GITHUB_APP_SLUG || "chaicode-pr-review";
  const url = new URL(`https://github.com/apps/${appSlug}/installations/new`);
  url.searchParams.set("state", userId);
  return url.toString();
}
