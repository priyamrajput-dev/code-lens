import GithubRepository from "./github.repository.js";
import { getGithubApp, getGithubInstallUrl } from "../../lib/github-app.js";

export type GithubRepo = {
  id: string;
  name: string;
  fullName: string;
  visibility: "public" | "private";
  defaultBranch: string;
  updatedAt: string;
  language: string | null;
  stars: number;
};

export type InstallationReposPage = {
  repos: GithubRepo[];
  totalCount: number;
  page: number;
  hasMore: boolean;
};

const REPOS_PER_PAGE = 100;

class GithubService {
  constructor(private readonly githubRepository: GithubRepository) {}

  async getInstallationStatus(userId: string) {
    const installation = await this.githubRepository.findInstallationByUserId(userId);

    if (!installation) {
      return {
        connected: false,
        accountLogin: null,
        installedAt: null,
        installUrl: getGithubInstallUrl(userId),
      };
    }

    return {
      connected: true,
      accountLogin: installation.accountLogin,
      installedAt: installation.createdAt.toISOString(),
      installationId: installation.installationId,
      installUrl: getGithubInstallUrl(userId),
    };
  }

  async saveInstallation(userId: string, installationId: number) {
    const app = getGithubApp();
    const { data } = await app.octokit.request("GET /app/installations/{installation_id}", {
      installation_id: installationId,
    });

    const account = data.account;
    const accountLogin =
      account && "login" in account ? account.login : account && "slug" in account ? account.slug : null;

    return await this.githubRepository.upsertInstallation(
      userId,
      installationId,
      accountLogin ?? null,
      data.target_type ?? null,
    );
  }

  async deleteInstallation(userId: string) {
    const installation = await this.githubRepository.findInstallationByUserId(userId);
    if (installation?.installationId) {
      try {
        const app = getGithubApp();
        await app.octokit.request("DELETE /app/installations/{installation_id}", {
          installation_id: installation.installationId,
        });
      } catch (err) {
        console.warn("Could not delete installation on GitHub:", err);
      }
    }
    return await this.githubRepository.deleteInstallationByUserId(userId);
  }

  async getRepos(userId: string, page = 1): Promise<InstallationReposPage> {
    const status = await this.getInstallationStatus(userId);
    if (!status.connected || !status.installationId) {
      return {
        repos: [],
        totalCount: 0,
        page: 1,
        hasMore: false,
      };
    }

    const app = getGithubApp();
    const octokit = await app.getInstallationOctokit(status.installationId);
    const { data } = await octokit.request("GET /installation/repositories", {
      per_page: REPOS_PER_PAGE,
      page,
    });

    const repos: GithubRepo[] = data.repositories.map((repo) => {
      const latestActivity = Math.max(
        new Date(repo.pushed_at || 0).getTime(),
        new Date(repo.updated_at || 0).getTime(),
        new Date(repo.created_at || 0).getTime(),
      );

      return {
        id: String(repo.id),
        name: repo.name,
        fullName: repo.full_name,
        visibility: repo.private ? "private" : "public",
        defaultBranch: repo.default_branch ?? "main",
        updatedAt: latestActivity > 0 ? new Date(latestActivity).toISOString() : (repo.updated_at ?? new Date().toISOString()),
        language: repo.language ?? null,
        stars: repo.stargazers_count ?? 0,
      };
    });

    // Show most recently updated / currently worked on repositories first
    repos.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return {
      repos,
      totalCount: data.total_count,
      page,
      hasMore: page * REPOS_PER_PAGE < data.total_count,
    };
  }
}

export default GithubService;
