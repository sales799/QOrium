import { createHash } from 'node:crypto';
import type { Pool } from '@qorium/db';
import type { CorpusChunk } from './types.js';

export interface MarketingPage {
  url: string;
  title: string;
  body: string;
}

const CHUNK_SIZE = 900;
export type ChunkEmbeddings = Map<string, number[]>;

export function chunksFromMarketingPages(pages: MarketingPage[]): CorpusChunk[] {
  return pages.flatMap((page) => {
    const content = normalizeText(page.body);
    const slices = splitIntoChunks(content, CHUNK_SIZE);
    return slices.map((slice, index) => ({
      id: `page-${slugFromUrl(page.url)}-${index}`,
      url: page.url,
      title: page.title,
      content: slice,
      excerpt: slice.slice(0, 180),
    }));
  });
}

export async function upsertCorpusChunks(
  pool: Pool,
  chunks: CorpusChunk[],
  embeddings: ChunkEmbeddings = new Map(),
): Promise<number> {
  for (const chunk of chunks) {
    const embedding = embeddings.get(chunk.id);
    await pool.query(
      `INSERT INTO chatbot_corpus_chunks (
         id,
         url,
         title,
         content,
         content_hash,
         embedding,
         source_kind,
         is_shipped_surface,
         refreshed_at
       )
       VALUES ($1, $2, $3, $4, $5, $6::vector, 'marketing_page', TRUE, NOW())
       ON CONFLICT (id) DO UPDATE SET
         url = EXCLUDED.url,
         title = EXCLUDED.title,
         content = EXCLUDED.content,
         content_hash = EXCLUDED.content_hash,
         embedding = EXCLUDED.embedding,
         refreshed_at = NOW()`,
      [
        chunk.id,
        chunk.url,
        chunk.title,
        chunk.content,
        hashContent(chunk.content),
        embedding ? vectorLiteral(embedding) : null,
      ],
    );
  }
  return chunks.length;
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function splitIntoChunks(content: string, size: number): string[] {
  if (content.length <= size) return [content];

  const chunks: string[] = [];
  for (let index = 0; index < content.length; index += size) {
    chunks.push(content.slice(index, index + size).trim());
  }
  return chunks.filter((chunk) => chunk.length > 0);
}

function slugFromUrl(url: string): string {
  const slug = url
    .replace(/^https?:\/\/[^/]+/i, '')
    .replace(/^\/+|\/+$/g, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
  return slug.length > 0 ? slug : 'home';
}

function hashContent(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

function vectorLiteral(values: number[]): string {
  return `[${values.map((value) => Number(value).toFixed(8)).join(',')}]`;
}
