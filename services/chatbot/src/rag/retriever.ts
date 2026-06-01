import type { Pool } from '@qorium/db';
import type { CorpusChunk, RetrievedChunk, Retriever } from './types.js';

const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'do',
  'does',
  'for',
  'from',
  'how',
  'is',
  'it',
  'me',
  'of',
  'on',
  'or',
  'the',
  'to',
  'what',
  'with',
  'you',
  'your',
]);

export function tokenize(value: string): Set<string> {
  const terms = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .split(/\s+/)
    .filter((term) => term.length > 2 && !STOP_WORDS.has(term));
  return new Set(terms);
}

export class InMemoryRetriever implements Retriever {
  private readonly chunks: Array<CorpusChunk & { terms: Set<string> }>;

  constructor(chunks: CorpusChunk[]) {
    this.chunks = chunks.map((chunk) => ({
      ...chunk,
      terms: tokenize(`${chunk.title} ${chunk.url} ${chunk.content}`),
    }));
  }

  async search(query: string, limit: number): Promise<RetrievedChunk[]> {
    const queryTerms = tokenize(query);
    if (queryTerms.size === 0) return [];

    return this.chunks
      .map((chunk) => {
        let overlap = 0;
        for (const term of queryTerms) {
          if (chunk.terms.has(term)) overlap += 1;
        }
        const score = overlap / queryTerms.size;
        return { ...chunk, score };
      })
      .filter((chunk) => chunk.score >= 0.2)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ terms: _terms, ...chunk }) => chunk);
  }
}

interface CorpusRow {
  id: string;
  url: string;
  title: string;
  content: string;
}

export class PostgresRetriever implements Retriever {
  constructor(
    private readonly pool: Pool,
    private readonly fallback: Retriever,
  ) {}

  async search(query: string, limit: number): Promise<RetrievedChunk[]> {
    const terms = Array.from(tokenize(query)).slice(0, 8);
    if (terms.length === 0) return [];

    const where = terms.map((_term, index) => `search_blob LIKE $${index + 1}`).join(' OR ');
    const result = await this.pool
      .query<CorpusRow>(
        `SELECT id, url, title, content
           FROM (
             SELECT id, url, title, content, refreshed_at, LOWER(title || ' ' || url || ' ' || content) AS search_blob
               FROM chatbot_corpus_chunks
              WHERE is_shipped_surface = TRUE
           ) corpus
          WHERE ${where}
          ORDER BY refreshed_at DESC
          LIMIT $${terms.length + 1}`,
        [...terms.map((term) => `%${term}%`), Math.max(limit * 4, limit)],
      )
      .catch(() => undefined);

    if (!result || result.rows.length === 0) return this.fallback.search(query, limit);

    const queryTerms = new Set(terms);
    return result.rows
      .map((row) => {
        const rowTerms = tokenize(`${row.title} ${row.url} ${row.content}`);
        let overlap = 0;
        for (const term of queryTerms) {
          if (rowTerms.has(term)) overlap += 1;
        }
        return {
          id: row.id,
          url: row.url,
          title: row.title,
          content: row.content,
          excerpt: row.content.slice(0, 180),
          score: overlap / queryTerms.size,
        };
      })
      .filter((chunk) => chunk.score >= 0.2)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}
