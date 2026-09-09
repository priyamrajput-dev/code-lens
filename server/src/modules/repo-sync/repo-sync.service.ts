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
const MAX_CHUNK_LINES = 80;
const UPSERT_BATCH_SIZE = 90;

const CODE_EXTENSIONS = [
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".py", ".go", ".rb", ".rs",
  ".java", ".kt", ".swift", ".c", ".h", ".cpp", ".cs", ".php",
  ".sql", ".prisma", ".css", ".md", ".yml", ".yaml",
];

const SKIPPED_FOLDERS = [
  "node_modules/", "dist/", "build/", ".next/", "generated/", "vendor/",
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

class RepoSyncService {
  constructor(
    private readonly repoSyncRepository: RepoSyncRepository,
    private readonly githubRepository: GithubRepository,
  ) {}

  private isIndexableFile(entry: TreeEntry) {
    if (entry.type !== "blob" || !entry.path || !entry.sha) return false;
    if (entry.size && entry.size > MAX_FILE_SIZE_BYTES) return false;
    if (SKIPPED_FOLDERS.some((folder) => entry.path!.includes(folder))) return false;
    return CODE_EXTENSIONS.some((ext) => entry.path!.endsWith(ext));
  }

  private chunkRepoFiles(files: RepoFile[]): CodeChunk[] {
    const chunks: CodeChunk[] = [];
    for (const file of files) {
      const lines = file.content.split("\n");
      for (let start = 0; start < lines.length; start += MAX_CHUNK_LINES) {
        const part = start / MAX_CHUNK_LINES;
        const text = lines.slice(start, start + MAX_CHUNK_LINES).join("\n");
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
    const files: RepoFile[] = [];

    for (const entry of entries) {
      try {
        const { data: blob } = await octokit.request(
          "GET /repos/{owner}/{repo}/git/blobs/{file_sha}",
          { owner, repo, file_sha: entry.sha! },
        );
        const content = Buffer.from(blob.content, "base64").toString("utf-8");
        files.push({ filePath: entry.path!, content });
      } catch (err) {
        console.warn(`Failed to fetch blob for ${entry.path}:`, err);
      }
    }

    return files;
  }

  private async saveRepoChunksToPinecone(namespace: string, chunks: CodeChunk[]) {
    const index = getPineconeIndex();
    for (let start = 0; start < chunks.length; start += UPSERT_BATCH_SIZE) {
      const batch = chunks.slice(start, start + UPSERT_BATCH_SIZE);
      const records = batch.map((chunk) => ({
        id: chunk.id,
        text: chunk.text,
        filePath: chunk.filePath,
      }));
      await index.namespace(namespace).upsertRecords({ records });
    }
  }

  async processSync(repoSyncId: string, installationId: number, repoFullName: string, branch: string) {
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

      await this.saveRepoChunksToPinecone(namespace, chunks);
      await this.repoSyncRepository.updateSyncStatus(repoSyncId, "synced", chunks.length, new Date());
    } catch (error) {
      console.error(`Repo sync failed for ${repoFullName}:`, error);
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
