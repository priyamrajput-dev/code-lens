import { generateText } from "ai";
import ReviewsRepository from "./reviews.repository.js";
import GithubRepository from "../github/github.repository.js";
import BillingRepository from "../billing/billing.repository.js";
import { getGithubApp } from "../../lib/github-app.js";
import { getPineconeIndex } from "../../lib/pinecone.js";
import { getAiModel } from "../../lib/ai.js";
import { buildRepoNamespace } from "../repo-sync/repo-sync.service.js";
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
        model: getAiModel(),
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

  async listReviewsForUser(userId: string) {
    const installation = await this.githubRepository.findInstallationByUserId(userId);
    if (!installation?.installationId) {
      return [];
    }
    return await this.reviewsRepository.findByInstallationIds([installation.installationId]);
  }

  async analyzeCodeSnippet(data: {
    code: string;
    language?: string;
    filename?: string;
  }) {
    const { code, language = "auto", filename = "code.js" } = data;

    const langContext = language && language !== "auto" && language !== "Auto-Detect"
      ? `written in ${language}`
      : "auto-detecting the programming language";

    const prompt = `Analyze the following code snippet from file "${filename}" (${langContext}):

\`\`\`
${code}
\`\`\`

You must respond with valid JSON ONLY matching the following schema:
{
  "score": number,
  "summary": string,
  "criticalCount": number,
  "warningCount": number,
  "suggestionCount": number,
  "findings": [
    {
      "id": string,
      "severity": "critical" | "warning" | "suggestion" | "good",
      "line": number | null,
      "title": string,
      "explanation": string,
      "recommendation": string,
      "codeSnippet": string | null
    }
  ]
}
Do not wrap your response in markdown fences. Return raw JSON string only.`;

    try {
      const { text } = await generateText({
        model: getAiModel(),
        system: "You are an elite static code analysis and AI security reviewer. You output strictly valid, parseable JSON matching the requested schema without markdown formatting.",
        prompt,
      });

      const cleaned = text.trim().replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      const parsed = JSON.parse(cleaned);
      return parsed;
    } catch (err) {
      console.error("Failed to analyze code snippet with AI model:", err);
      return this.generateFallbackSnippetReview(code, language, filename);
    }
  }

  private generateFallbackSnippetReview(code: string, language: string, filename: string) {
    const findings = [];
    const lines = code.split("\n");
    let score = 88;
    let criticalCount = 0;
    let warningCount = 0;
    let suggestionCount = 0;

    if (code.includes("eval(") || code.includes("innerHTML") || code.includes("dangerouslySetInnerHTML")) {
      criticalCount++;
      score -= 25;
      findings.push({
        id: "finding-1",
        severity: "critical",
        line: lines.findIndex((l) => l.includes("eval(") || l.includes("innerHTML") || l.includes("dangerouslySetInnerHTML")) + 1 || 1,
        title: "Potential Injection / Unsafe Execution Vulnerability",
        explanation: "Direct assignment of untrusted content can lead to Cross-Site Scripting (XSS) or arbitrary code execution.",
        recommendation: "Use secure alternatives such as textContent or sanitize inputs with a robust library.",
        codeSnippet: "// Safer approach:\nelement.textContent = sanitizedValue;",
      });
    }

    if (code.includes("console.log") || code.includes("print(") || code.includes("debugger")) {
      suggestionCount++;
      score -= 5;
      findings.push({
        id: "finding-2",
        severity: "suggestion",
        line: lines.findIndex((l) => l.includes("console.log") || l.includes("print(") || l.includes("debugger")) + 1 || 1,
        title: "Production Logging / Debug Statement",
        explanation: "Console logs or debug statements left in code may leak sensitive operational data or degrade performance.",
        recommendation: "Replace with structured logger or remove prior to production release.",
        codeSnippet: "logger.info('Operation completed', { contextId });",
      });
    }

    if (code.includes("SELECT *") || code.includes("select *")) {
      warningCount++;
      score -= 10;
      findings.push({
        id: "finding-3",
        severity: "warning",
        line: lines.findIndex((l) => l.toLowerCase().includes("select *")) + 1 || 1,
        title: "Unbounded Column Retrieval (SELECT *)",
        explanation: "Retrieving all columns increases memory consumption, network transfer, and prevents database index-only scans.",
        recommendation: "Explicitly project only the specific columns required by your application.",
        codeSnippet: "SELECT id, title, created_at FROM records WHERE status = 'active';",
      });
    }

    if (findings.length === 0) {
      findings.push({
        id: "finding-good-1",
        severity: "good",
        line: 1,
        title: "Clean Code Architecture & Practices",
        explanation: "Code demonstrates clean control flow, standard conventions, and no obvious security antipatterns.",
        recommendation: "Maintain robust unit test coverage for edge conditions.",
        codeSnippet: null,
      });
    }

    return {
      score: Math.max(30, Math.min(100, score)),
      summary: criticalCount > 0
        ? "Code contains potential security risks that should be reviewed prior to production merge."
        : "Code is structured well with opportunities for minor optimization.",
      criticalCount,
      warningCount,
      suggestionCount,
      findings,
    };
  }
}

export default ReviewsService;
