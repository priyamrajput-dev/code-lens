import { generateText } from "ai";
import ReviewsRepository from "./reviews.repository.js";
import GithubRepository from "../github/github.repository.js";
import BillingRepository from "../billing/billing.repository.js";
import { getGithubApp } from "../../lib/github-app.js";
import { getPineconeIndex } from "../../lib/pinecone.js";
import { openrouter } from "../../lib/ai.js";
import { buildRepoNamespace } from "../repo-sync/repo-sync.service.js";

const REVIEW_MODEL = "openrouter/free";
const MAX_CHUNK_LINES = 80;
const CONTEXT_RESULTS = 10;
const FILES_PER_PAGE = 100;

const SYSTEM_PROMPT = `You are an expert code reviewer with deep knowledge of software engineering best practices, security, and performance optimization.

Review the provided unified diff chunks and write a concise, actionable pull request review in markdown.

## Review Checklist

Analyze the changes across these dimensions (only mention what's relevant):
- **Correctness** — Bugs, logic errors, off-by-one errors, incorrect assumptions
- **Security** — Injection risks, auth issues, exposed secrets, unsafe deserialization, unvalidated input
- **Performance** — Unnecessary loops, missing indexes, N+1 queries, memory leaks
- **Reliability** — Unhandled errors/edge cases, missing null checks, race conditions
- **Readability** — Naming clarity, overly complex logic, missing comments on non-obvious code
- **Maintainability** — Tight coupling, duplication, violations of SOLID/DRY principles

## Output Format

Start with a **one-line summary** of the overall change quality.

Then use this structure if there are findings:
### ✅ What looks good
(skip if nothing notable)

### ⚠️ Suggestions
(non-blocking improvements)

### 🚨 Issues
(bugs, security problems, or breaking changes that should be fixed)

## Guidelines
- Be specific: reference the relevant code, function names, or line context
- Be constructive: explain *why* something is a problem and suggest a fix
- Be proportional: don't nitpick minor style issues if there are real bugs
- If the diff looks clean with no concerns, say so clearly in 1–2 sentences — do not invent problems
- Tailor feedback to the repository language and conventions visible in the diff`;

export type PrFile = {
  filePath: string;
  patch: string;
};

export type CodeChunk = {
  id: string;
  filePath: string;
  text: string;
};

class ReviewsService {
  constructor(
    private readonly reviewsRepository: ReviewsRepository,
    private readonly githubRepository: GithubRepository,
    private readonly billingRepository: BillingRepository,
  ) {}

  buildPrNamespace(repoFullName: string, prNumber: number) {
    return `${repoFullName.replace("/", "--")}--pr-${prNumber}`;
  }

  private chunkPrFiles(prNumber: number, files: PrFile[]): CodeChunk[] {
    const chunks: CodeChunk[] = [];
    for (const file of files) {
      const lines = file.patch.split("\n");
      for (let start = 0; start < lines.length; start += MAX_CHUNK_LINES) {
        const part = start / MAX_CHUNK_LINES;
        const text = lines.slice(start, start + MAX_CHUNK_LINES).join("\n");
        chunks.push({
          id: `pr-${prNumber}--${file.filePath}--part-${part}`,
          filePath: file.filePath,
          text,
        });
      }
    }
    return chunks;
  }

  private async fetchPullRequestFiles(
    installationId: number,
    repoFullName: string,
    prNumber: number,
  ): Promise<PrFile[]> {
    const app = getGithubApp();
    const octokit = await app.getInstallationOctokit(installationId);
    const parts = repoFullName.split("/");
    const owner = parts[0] || "";
    const repo = parts[1] || "";

    const { data } = await octokit.request(
      "GET /repos/{owner}/{repo}/pulls/{pull_number}/files",
      { owner, repo, pull_number: prNumber, per_page: FILES_PER_PAGE },
    );

    const files: PrFile[] = [];
    for (const file of data) {
      if (!file.patch) continue;
      files.push({ filePath: file.filename, patch: file.patch });
    }
    return files;
  }

  private async postComment(
    installationId: number,
    repoFullName: string,
    prNumber: number,
    body: string,
  ) {
    const app = getGithubApp();
    const octokit = await app.getInstallationOctokit(installationId);
    const parts = repoFullName.split("/");
    const owner = parts[0] || "";
    const repo = parts[1] || "";

    await octokit.request("POST /repos/{owner}/{repo}/issues/{issue_number}/comments", {
      owner,
      repo,
      issue_number: prNumber,
      body,
    });
  }

  private async searchContext(namespace: string, query: string): Promise<string[]> {
    try {
      const index = getPineconeIndex();
      const response = await index.namespace(namespace).searchRecords({
        query: { topK: CONTEXT_RESULTS, inputs: { text: query } },
      });

      const snippets: string[] = [];
      for (const hit of response.result.hits) {
        const fields = hit.fields as { text?: string; filePath?: string };
        if (fields.text) {
          snippets.push(`File: ${fields.filePath}\n${fields.text}`);
        }
      }
      return snippets;
    } catch {
      return [];
    }
  }

  async processReview(pullRequestId: string) {
    const pr = await this.reviewsRepository.findById(pullRequestId);
    if (!pr) return;

    try {
      await this.reviewsRepository.updateReviewResult(pullRequestId, "processing");

      const files = await this.fetchPullRequestFiles(
        pr.installationId,
        pr.repoFullName,
        pr.prNumber,
      );

      if (files.length === 0) {
        await this.reviewsRepository.updateReviewResult(
          pullRequestId,
          "reviewed",
          "No reviewable code changes found in this pull request.",
          new Date(),
        );
        return;
      }

      const prNamespace = this.buildPrNamespace(pr.repoFullName, pr.prNumber);
      const repoNamespace = buildRepoNamespace(pr.repoFullName);
      const chunks = this.chunkPrFiles(pr.prNumber, files);

      // Save PR chunks to Pinecone
      try {
        const index = getPineconeIndex();
        const records = chunks.map((chunk) => ({
          id: chunk.id,
          text: chunk.text,
          filePath: chunk.filePath,
        }));
        await index.namespace(prNamespace).upsertRecords({ records });
      } catch (err) {
        console.warn("Pinecone upsert failed for PR chunks:", err);
      }

      const diffSummary = files.map((f) => `### ${f.filePath}\n\`\`\`diff\n${f.patch}\n\`\`\``).join("\n\n");
      const repoContextSnippets = await this.searchContext(repoNamespace, pr.title);
      const repoContextSection = repoContextSnippets.length > 0
        ? `\n\nRelated code from repository codebase:\n\n${repoContextSnippets.join("\n\n---\n\n")}`
        : "";

      const { text: reviewText } = await generateText({
        model: openrouter(REVIEW_MODEL),
        system: SYSTEM_PROMPT,
        prompt: `Repository: ${pr.repoFullName}\nPull request title: ${pr.title}\n\nCode changes:\n\n${diffSummary}${repoContextSection}`,
      });

      // Post comment to GitHub
      try {
        await this.postComment(pr.installationId, pr.repoFullName, pr.prNumber, reviewText);
      } catch (commentErr) {
        console.error("Failed to post comment to GitHub PR:", commentErr);
      }

      // Save completed review
      await this.reviewsRepository.updateReviewResult(
        pullRequestId,
        "reviewed",
        reviewText,
        new Date(),
      );
    } catch (error) {
      console.error(`Failed to review PR ${pr.repoFullName} #${pr.prNumber}:`, error);
      await this.reviewsRepository.updateReviewResult(pullRequestId, "failed");
    }
  }

  async handleWebhookPayload(payload: {
    action: string;
    installation: { id: number };
    repository: { full_name: string };
    pull_request: {
      number: number;
      title: string;
      user: { login: string } | null;
      head: { sha: string };
      base: { ref: string };
    };
  }) {
    const prRecord = await this.reviewsRepository.upsertPullRequest({
      installationId: payload.installation.id,
      repoFullName: payload.repository.full_name,
      prNumber: payload.pull_request.number,
      title: payload.pull_request.title,
      authorLogin: payload.pull_request.user?.login,
      headSha: payload.pull_request.head.sha,
      baseBranch: payload.pull_request.base.ref,
    });

    if (!prRecord) {
      throw new Error("Failed to upsert pull request record");
    }

    const installation = await this.githubRepository.findInstallationByInstallationId(
      payload.installation.id,
    );

    if (installation?.userId) {
      const allowed = await this.billingRepository.canUserReview(installation.userId);
      if (!allowed) {
        await this.reviewsRepository.updateReviewResult(prRecord.id, "rate_limited");
        return { prRecord, rateLimited: true };
      }
    }

    setImmediate(() => {
      this.processReview(prRecord.id);
    });

    return { prRecord, rateLimited: false };
  }

  async listReviewsForRepo(repoFullName: string) {
    return await this.reviewsRepository.findByRepoFullName(repoFullName);
  }
}

export default ReviewsService;
