import type { CorpusChunk } from './types.js';
import type { ChunkEmbeddings } from './build.js';

interface OpenAiEmbeddingResponse {
  data?: Array<{ index?: number; embedding?: number[] }>;
}

export interface EmbeddingBuildResult {
  provider: 'openai' | 'none';
  model: string | null;
  embeddings: ChunkEmbeddings;
}

export async function buildChunkEmbeddings(chunks: CorpusChunk[]): Promise<EmbeddingBuildResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.CHATBOT_EMBEDDING_MODEL ?? 'text-embedding-3-small';
  if (!apiKey) {
    return { provider: 'none', model: null, embeddings: new Map() };
  }

  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      input: chunks.map((chunk) => `${chunk.title}\n${chunk.url}\n${chunk.content}`),
    }),
  }).catch(() => undefined);

  if (!res?.ok) {
    return { provider: 'none', model: null, embeddings: new Map() };
  }

  const body = (await res.json().catch(() => undefined)) as OpenAiEmbeddingResponse | undefined;
  const embeddings: ChunkEmbeddings = new Map();
  for (const item of body?.data ?? []) {
    if (item.index === undefined || !item.embedding) continue;
    const chunk = chunks[item.index];
    if (chunk) embeddings.set(chunk.id, item.embedding);
  }

  return { provider: 'openai', model, embeddings };
}
