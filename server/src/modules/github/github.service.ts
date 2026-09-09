import GithubRepository from "./github.repository.js";
import { getGithubApp, getGithubInstallUrl } from "../../lib/github-app.js";
import { NotFoundError } from "../../common/utils/app-error.js";

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
    return await this.githubRepository.deleteInstallationByUserId(userId);
  }

  async getRepos(userId: string, page = 1): Promise<InstallationReposPage> {
    const installation = await this.githubRepository.findInstallationByUserId(userId);
    if (!installation) {
      throw new NotFoundError("GitHub App is not connected. Please install the GitHub App first.");
    }

    const app = getGithubApp();
    const octokit = await app.getInstallationOctokit(installation.installationId);
    const { data } = await octokit.request("GET /installation/repositories", {
      per_page: REPOS_PER_PAGE,
      page,
    });

    const repos: GithubRepo[] = data.repositories.map((repo) => ({
      id: String(repo.id),
      name: repo.name,
      fullName: repo.full_name,
      visibility: repo.private ? "private" : "public",
      defaultBranch: repo.default_branch ?? "main",
      updatedAt: repo.updated_at ?? new Date().toISOString(),
      language: repo.language ?? null,
      stars: repo.stargazers_count ?? 0,
    }));

    return {
      repos,
      totalCount: data.total_count,
      page,
      hasMore: page * REPOS_PER_PAGE < data.total_count,
    };
  }
}

export default GithubService;
