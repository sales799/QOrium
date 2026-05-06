/**
 * Lexical similarity scoring for crawled snippets vs released questions.
 *
 * Per Anti-Leak-Engine-v0-Design.md §2.2: detection uses two channels —
 * (1) embedding cosine similarity (deferred to v1 — needs an embedding
 * model + vector store), and (2) lexical overlap via Jaccard index over
 * the token set. v0 ships only the lexical channel; the cosine channel is
 * stubbed at 0 in `crawlEvidence` so the severity classifier still receives
 * both numbers and can graduate cleanly when the cosine channel is wired.
 */

const TOKEN_REGEX = /[a-z0-9_]+/g;
const STOPWORDS = new Set([
  'the',
  'a',
  'an',
  'is',
  'of',
  'to',
  'and',
  'in',
  'for',
  'on',
  'with',
  'that',
  'this',
  'it',
  'as',
  'are',
  'was',
  'be',
  'been',
  'by',
  'or',
  'at',
  'from',
  'so',
  'we',
  'you',
  'i',
]);

export interface CrawlEvidence {
  cosineSimilarity: number;
  lexicalOverlap: number;
}

/** Tokenise a string into the set used for Jaccard. */
export function tokeniseToSet(input: string): Set<string> {
  const tokens = new Set<string>();
  const matches = input.toLowerCase().matchAll(TOKEN_REGEX);
  for (const m of matches) {
    const t = m[0];
    if (t.length < 3) continue; // ignore very short tokens (`a`, `is`, etc.)
    if (STOPWORDS.has(t)) continue;
    tokens.add(t);
  }
  return tokens;
}

/**
 * Jaccard index between two token sets: |A ∩ B| / |A ∪ B|. Returns 0 when
 * either side has no usable tokens.
 */
export function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  const smaller = a.size <= b.size ? a : b;
  const larger = smaller === a ? b : a;
  for (const t of smaller) if (larger.has(t)) intersection++;
  const union = a.size + b.size - intersection;
  if (union === 0) return 0;
  return intersection / union;
}

/** Convenience: Jaccard over the question body and a crawled snippet. */
export function lexicalOverlap(questionBody: string, snippet: string): number {
  return jaccardSimilarity(tokeniseToSet(questionBody), tokeniseToSet(snippet));
}

/** Build the evidence record consumed by the severity classifier. */
export function scoreEvidence(questionBody: string, snippet: string): CrawlEvidence {
  return {
    cosineSimilarity: 0, // v0: deferred until embedding pipeline lands
    lexicalOverlap: lexicalOverlap(questionBody, snippet),
  };
}
