import { createPool } from '@qorium/db';
import { chunksFromMarketingPages, upsertCorpusChunks } from '../rag/build.js';
import { buildChunkEmbeddings } from '../rag/embeddings.js';
import { canonicalMarketingPages } from '../rag/pages.js';

const pool = createPool({ applicationName: 'qorium-chatbot-corpus' });

try {
  const chunks = chunksFromMarketingPages(canonicalMarketingPages);
  const embeddingResult = await buildChunkEmbeddings(chunks);
  const count = await upsertCorpusChunks(pool, chunks, embeddingResult.embeddings);
  process.stdout.write(
    `${JSON.stringify({
      ok: true,
      chunks: count,
      embeddingProvider: embeddingResult.provider,
      embeddingModel: embeddingResult.model,
    })}\n`,
  );
} finally {
  await pool.end();
}
