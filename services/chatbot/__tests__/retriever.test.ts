import { describe, expect, it } from 'vitest';
import { InMemoryRetriever } from '../src/rag/retriever.js';
import type { CorpusChunk } from '../src/rag/types.js';

const chunks: CorpusChunk[] = [
  {
    id: 'method-anti-leak',
    url: '/anti-leak',
    title: 'Anti-Leak, Explained',
    content:
      'QOrium rotates leaked assessment items, watermarks candidate variants, and retires stale question banks.',
  },
  {
    id: 'pricing',
    url: '/pricing',
    title: 'Pricing',
    content:
      'QOrium uses talk-to-sales pricing for paid tiers until founder-approved numbers ship.',
  },
];

describe('in-memory retriever', () => {
  it('returns cited chunks ranked by lexical overlap', async () => {
    const retriever = new InMemoryRetriever(chunks);

    const results = await retriever.search('How does anti leak watermark rotation work?', 2);

    expect(results[0]).toMatchObject({
      id: 'method-anti-leak',
      url: '/anti-leak',
      title: 'Anti-Leak, Explained',
    });
    expect(results[0]?.score).toBeGreaterThan(0);
  });

  it('returns no citations when the corpus has no support', async () => {
    const retriever = new InMemoryRetriever(chunks);

    const results = await retriever.search('office lunch menu', 2);

    expect(results).toEqual([]);
  });
});
