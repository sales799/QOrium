import type { ClassificationResult, LeakSeverity } from './types.js';

/**
 * Lexical leak detector.
 *
 * v0 ships lexical-only similarity (n-gram extraction + Jaccard overlap on
 * token sets). Embedding-based cosine similarity per spec §2.2 is a
 * follow-up sprint — it requires either an Anthropic Embeddings API key
 * (cred-bound; halts auto-mode) or a self-hosted model. Lexical alone
 * catches verbatim leaks, which is the dominant class on Glassdoor /
 * GFG / LeetCode Discuss; embeddings will catch paraphrases.
 *
 * CTO-DELTA flag (logged in build log): production thresholds in §6 are
 * cosine-based; this implementation reuses those numeric values against
 * Jaccard scores until embeddings land. The classifier interface is
 * stable so swapping in real cosine is a one-file change.
 */

const STOPWORDS = new Set([
  'the',
  'a',
  'an',
  'and',
  'or',
  'but',
  'if',
  'then',
  'else',
  'of',
  'in',
  'on',
  'at',
  'to',
  'for',
  'with',
  'by',
  'is',
  'are',
  'was',
  'were',
  'be',
  'been',
  'being',
  'this',
  'that',
  'these',
  'those',
  'it',
  'its',
  "it's",
  'as',
  'so',
  'not',
  'no',
  'nor',
  'do',
  'does',
  'did',
  'have',
  'has',
  'had',
  'will',
  'would',
  'should',
  'could',
  'may',
  'might',
  'must',
  'can',
  'cannot',
  'into',
  'from',
  'over',
  'under',
  'between',
  'through',
  'during',
  'after',
  'before',
  'above',
  'below',
  'up',
  'down',
  'out',
  'about',
  'than',
  'we',
  'you',
  'they',
  'i',
  'he',
  'she',
  'them',
  'us',
  'our',
  'their',
  'his',
  'her',
  'your',
]);

const TOKEN_RE = /[a-z0-9_]+/g;

/** Tokenize text into lowercased word tokens, dropping stopwords. */
export function tokenize(text: string): string[] {
  return (text.toLowerCase().match(TOKEN_RE) ?? []).filter((t) => !STOPWORDS.has(t));
}

/** Extract the top-K longest unique word n-grams of length [minN, maxN]
 *  from a body of text. Used to seed search queries that are likely to
 *  return verbatim leaks. */
export function extractDistinctiveNgrams(
  text: string,
  options: { topK?: number; minN?: number; maxN?: number } = {},
): string[] {
  const topK = options.topK ?? 5;
  const minN = options.minN ?? 9;
  const maxN = options.maxN ?? 15;

  const words = (text.toLowerCase().match(TOKEN_RE) ?? []).filter(
    (t) => !STOPWORDS.has(t) && t.length >= 3,
  );
  if (words.length < minN) {
    // Not enough material; fall back to the whole text as a single
    // query.
    return [words.join(' ')].filter((s) => s.length > 0);
  }

  // Slide n-grams of various lengths and rank by total length so longer
  // distinctive phrases win. Dedupe lossy: a longer n-gram subsumes any
  // shorter overlapping one we'd score against the same source.
  const candidates = new Map<string, number>();
  for (let n = minN; n <= maxN && n <= words.length; n++) {
    for (let i = 0; i + n <= words.length; i++) {
      const gram = words.slice(i, i + n).join(' ');
      // Score = length in chars; longer = more distinctive.
      if (!candidates.has(gram)) candidates.set(gram, gram.length);
    }
  }

  return Array.from(candidates.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, topK)
    .map(([g]) => g);
}

/** Jaccard similarity of two token sets. */
export function jaccard(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 0;
  const setA = new Set(a);
  const setB = new Set(b);
  let intersect = 0;
  for (const x of setA) if (setB.has(x)) intersect += 1;
  const union = setA.size + setB.size - intersect;
  return union === 0 ? 0 : intersect / union;
}

/** Find the n-grams from `query` that appear (verbatim or as token
 *  subsequence) in `snippet`. Both sides are tokenized — stopword-
 *  removed — before matching, so an n-gram built from `["implement",
 *  "red", "black", "tree"]` matches a snippet containing
 *  "implement a red black tree" (the stopword-only "a" is invisible). */
export function matchedNgrams(query: string, snippet: string): string[] {
  const snippetTokens = tokenize(snippet).filter((t) => t.length >= 3);
  const snippetCompact = snippetTokens.join(' ');
  const grams = extractDistinctiveNgrams(query, { topK: 20, minN: 5, maxN: 12 });
  return grams.filter((g) => snippetCompact.includes(g));
}

export interface ClassifyOptions {
  thresholdAutoRotate: number;
  thresholdHighReview: number;
  thresholdMediumReview: number;
}

/** Classify a question / snippet pair into a leak severity per spec §6
 *  thresholds. Treats the lexical Jaccard score as a proxy for cosine
 *  until embeddings land. */
export function classify(
  questionBody: string,
  snippet: string,
  thresholds: ClassifyOptions,
): ClassificationResult {
  const qTokens = tokenize(questionBody);
  const sTokens = tokenize(snippet);
  const lexical = jaccard(qTokens, sTokens);
  // For now, similarity == lexical. Embeddings sprint will introduce a
  // weighted blend.
  const similarity = lexical;

  const severity: LeakSeverity =
    similarity >= thresholds.thresholdAutoRotate
      ? 'critical'
      : similarity >= thresholds.thresholdHighReview
        ? 'high'
        : similarity >= thresholds.thresholdMediumReview
          ? 'medium'
          : 'low';

  return {
    severity,
    similarity,
    lexical,
    autoRotate: severity === 'critical',
    needsReview: severity === 'high' || severity === 'medium',
  };
}
