import { Pinecone } from "@pinecone-database/pinecone";
import { env } from "../common/config/env.js";

let pinecone: Pinecone | null = null;

export function getPineconeClient(): Pinecone {
  if (!pinecone) {
    pinecone = new Pinecone({
      apiKey: env.PINECONE_API_KEY || "dummy-pinecone-key",
    });
  }
  return pinecone;
}

export function getPineconeIndex() {
  const client = getPineconeClient();
  const indexName = env.PINECONE_INDEX || "code-lens-index";
  return client.index(indexName);
}
