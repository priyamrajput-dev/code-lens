import RepoSyncRepository from "./repo-sync.repository.js";
import GithubRepository from "../github/github.repository.js";
import { getGithubApp } from "../../lib/github-app.js";
import { getPineconeIndex } from "../../lib/pinecone.js";
import { NotFoundError } from "../../common/utils/app-error.js";

export type CodeChunk = {
  id: string;
  filePath: string;
  text: string;
};

export type RepoFile = {
  filePath: string;
  content: string;
};

const MAX_FILE_SIZE_BYTES = 100_000;
const MAX_FILES = 200;
const MAX_CHUNK_LINES = 50;
const MAX_CHUNK_CHARS = 1800; // Fits multilingual-e5-large 512 token context window
const UPSERT_BATCH_SIZE = 50;

const CODE_EXTENSIONS = [
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".py", ".go", ".rb", ".rs",
  ".java", ".kt", ".swift", ".c", ".h", ".cpp", ".cs", ".php",
  ".sql", ".prisma", ".css", ".md", ".yml", ".yaml",
];

const SKIPPED_FOLDERS = [
  "node_modules/", "dist/", "build/", ".next/", "generated/", "vendor/",
  ".git/", "coverage/", ".turbo/", ".cache/", "out/",
];

type TreeEntry = {
  path?: string;
  type?: string;
  sha?: string;
  size?: number;
};

export function buildRepoNamespace(repoFullName: string) {
  return `${repoFullName.replace("/", "--")}--codebase`;
}

async function mapConcurrent<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let index = 0;

  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) {
      const current = index++;
      const item = items[current];
      if (item !== undefined) {
        results[current] = await fn(item);
      }
    }
  });

  await Promise.all(workers);
  return results;
}

class RepoSyncService {
  constructor(
    private readonly repoSyncRepository: RepoSyncRepository,
    private readonly githubRepository: GithubRepository,
  ) {}

  private isIndexableFile(entry: TreeEntry) {
    if (entry.type !== "blob" || !entry.path || !entry.sha) return false;
    if (entry.size && entry.size > MAX_FILE_SIZE_BYTES) return false;
    if (SKIPPED_FOLDERS.some((folder) => entry.path!.includes(folder))) return false;
    if (entry.path.endsWith(".min.js") || entry.path.endsWith(".min.css") || entry.path.endsWith(".map")) {
      return false;
    }
    return CODE_EXTENSIONS.some((ext) => entry.path!.endsWith(ext));
  }

  private chunkRepoFiles(files: RepoFile[]): CodeChunk[] {
    const chunks: CodeChunk[] = [];
    for (const file of files) {
      const lines = file.content.split("\n");
      for (let start = 0; start < lines.length; start += MAX_CHUNK_LINES) {
        const part = Math.floor(start / MAX_CHUNK_LINES);
        const text = lines.slice(start, start + MAX_CHUNK_LINES).join("\n").slice(0, MAX_CHUNK_CHARS);
        if (text.trim().length === 0) continue;
        chunks.push({
          id: `repo--${file.filePath}--part-${part}`,
          filePath: file.filePath,
          text,
        });
      }
    }
    return chunks;
  }

  private async fetchRepoFiles(
    installationId: number,
    repoFullName: string,
    branch: string,
  ): Promise<RepoFile[]> {
    const startFetch = Date.now();
    const app = getGithubApp();
    const octokit = await app.getInstallationOctokit(installationId);
    const parts = repoFullName.split("/");
    const owner = parts[0] || "";
    const repo = parts[1] || "";

    const { data: tree } = await octokit.request(
      "GET /repos/{owner}/{repo}/git/trees/{tree_sha}",
      { owner, repo, tree_sha: branch, recursive: "1" },
    );

    const entries = tree.tree.filter(this.isIndexableFile.bind(this)).slice(0, MAX_FILES);

    // Fetch blobs concurrently with a concurrency pool of 12 parallel requests
    const rawFiles = await mapConcurrent(entries, 12, async (entry) => {
      try {
        const { data: blob } = await octokit.request(
          "GET /repos/{owner}/{repo}/git/blobs/{file_sha}",
          { owner, repo, file_sha: entry.sha! },
        );
        const content = Buffer.from(blob.content, "base64").toString("utf-8");
        return { filePath: entry.path!, content };
      } catch (err) {
        console.warn(`Failed to fetch blob for ${entry.path}:`, err);
        return null;
      }
    });

    const files = rawFiles.filter((f): f is RepoFile => f !== null);
    console.log(`[RepoSync] Fetched ${files.length} files for ${repoFullName} in ${Date.now() - startFetch}ms`);
    return files;
  }

  private async saveRepoChunksToPinecone(namespace: string, chunks: CodeChunk[]) {
    const index = getPineconeIndex();
    const startUpsert = Date.now();

    for (let start = 0; start < chunks.length; start += UPSERT_BATCH_SIZE) {
      const batch = chunks.slice(start, start + UPSERT_BATCH_SIZE);
      const records = batch.map((chunk) => ({
        id: chunk.id,
        text: chunk.text,
        filePath: chunk.filePath,
      }));

      let attempts = 0;
      while (attempts < 3) {
        try {
          await index.namespace(namespace).upsertRecords({ records });
          break;
        } catch (err: any) {
          attempts++;
          const isRateLimit =
            err?.message?.includes("429") ||
            err?.message?.includes("RESOURCE_EXHAUSTED") ||
            err?.status === 429;
          if (isRateLimit && attempts < 3) {
            console.warn(`[RepoSync] Pinecone 429 rate limit hit, backing off for ${attempts * 5}s...`);
            await new Promise((resolve) => setTimeout(resolve, attempts * 5000));
          } else {
            throw err;
          }
        }
      }
    }
    console.log(`[RepoSync] Upserted ${chunks.length} chunks to Pinecone namespace "${namespace}" in ${Date.now() - startUpsert}ms`);
  }

  async processSync(repoSyncId: string, installationId: number, repoFullName: string, branch: string) {
    const startTotal = Date.now();
    console.log(`[RepoSync] Starting sync for ${repoFullName} (syncId: ${repoSyncId})`);
    try {
      await this.repoSyncRepository.updateSyncStatus(repoSyncId, "syncing");
      const files = await this.fetchRepoFiles(installationId, repoFullName, branch);
      const chunks = this.chunkRepoFiles(files);
      const namespace = buildRepoNamespace(repoFullName);

      // Clean up previous namespace if any
      try {
        const index = getPineconeIndex();
        await index.deleteNamespace(namespace);
      } catch {
        // namespace might not exist yet
      }

      try {
        await this.saveRepoChunksToPinecone(namespace, chunks);
      } catch (pineconeErr) {
        console.warn(`Pinecone indexing skipped/failed for ${repoFullName}:`, pineconeErr);
      }
      await this.repoSyncRepository.updateSyncStatus(repoSyncId, "synced", chunks.length, new Date());
      console.log(`[RepoSync] Successfully synced ${repoFullName} (${chunks.length} chunks) in ${Date.now() - startTotal}ms`);
    } catch (error) {
      console.error(`Repo sync failed for ${repoFullName} after ${Date.now() - startTotal}ms:`, error);
      await this.repoSyncRepository.updateSyncStatus(repoSyncId, "failed");
    }
  }

  async triggerSync(userId: string, repoFullName: string, branch: string = "main", installationId?: number) {
    let resolvedInstallationId = installationId;
    if (!resolvedInstallationId) {
      const installation = await this.githubRepository.findInstallationByUserId(userId);
      if (!installation) {
        throw new NotFoundError("GitHub App not installed for this user.");
      }
      resolvedInstallationId = installation.installationId;
    }

    const record = await this.repoSyncRepository.upsertRepoSync(
      resolvedInstallationId,
      repoFullName,
      branch,
      "pending",
    );

    if (!record) {
      throw new Error("Failed to create repo sync record");
    }

    // Run async background processing
    setImmediate(() => {
      this.processSync(record.id, resolvedInstallationId!, repoFullName, branch);
    });

    return record;
  }

  async getStatuses(repoFullNames: string[]) {
    const records = await this.repoSyncRepository.findByRepoFullNames(repoFullNames);
    const statusMap: Record<string, string> = {};
    for (const item of records) {
      statusMap[item.repoFullName] = item.status;
    }
    return statusMap;
  }
}

export default RepoSyncService;
