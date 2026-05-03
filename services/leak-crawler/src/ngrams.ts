/**
 * N-gram extraction for leak-crawl query generation.
 *
 * Per Anti-Leak-Engine-v0-Design.md §2.1 ("Query strategy"): for each released
 * question, extract top-K longest unique n-grams (9–15 words) and use them
 * verbatim as Serper search queries. Long, distinctive phrases are far more
 * likely to surface a leak than common words.
 */

const DEFAULT_MIN_WORDS = 9;
const DEFAULT_MAX_WORDS = 15;
const DEFAULT_TOP_K = 5;

export interface ExtractNGramsOptions {
  minWords?: number;
  maxWords?: number;
  topK?: number;
}

const STOPWORD_RUNS_REGEX = /\b(the|a|an|is|of|to|and|in|for|on|with|that|this|it|as)\b/gi;
const PUNCTUATION_REGEX = /[`*_~#>{}[\]()|\\/'"!?.,;:]+/g;

/** Lowercase, strip markdown punctuation, collapse whitespace. */
export function normaliseTextForNGrams(text: string): string {
  return text
    .toLowerCase()
    .replace(/```[\s\S]*?```/g, ' ') // Drop fenced code blocks
    .replace(/`[^`]*`/g, ' ') // Drop inline code spans
    .replace(PUNCTUATION_REGEX, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenise(normalised: string): string[] {
  if (normalised.length === 0) return [];
  return normalised.split(' ').filter((t) => t.length > 0);
}

function distinctivenessScore(words: string[]): number {
  // Longer phrases with fewer common stopwords are more distinctive.
  // Stopword-heavy phrases tend to match a lot of unrelated content.
  const phrase = words.join(' ');
  const stopwordHits = phrase.match(STOPWORD_RUNS_REGEX)?.length ?? 0;
  return words.length - stopwordHits * 0.5;
}

/**
 * Returns up to `topK` unique n-grams from the input, prioritising longer
 * phrases with fewer stopwords. Length is bounded to [minWords, maxWords].
 */
export function extractDistinctiveNGrams(text: string, opts: ExtractNGramsOptions = {}): string[] {
  const minWords = opts.minWords ?? DEFAULT_MIN_WORDS;
  const maxWords = opts.maxWords ?? DEFAULT_MAX_WORDS;
  const topK = opts.topK ?? DEFAULT_TOP_K;
  if (minWords < 1 || maxWords < minWords || topK < 1) return [];

  const tokens = tokenise(normaliseTextForNGrams(text));
  if (tokens.length < minWords) return [];

  const seen = new Set<string>();
  const candidates: { phrase: string; score: number }[] = [];

  for (let n = maxWords; n >= minWords; n--) {
    if (n > tokens.length) continue;
    for (let i = 0; i + n <= tokens.length; i++) {
      const slice = tokens.slice(i, i + n);
      const phrase = slice.join(' ');
      if (seen.has(phrase)) continue;
      seen.add(phrase);
      candidates.push({ phrase, score: distinctivenessScore(slice) });
    }
  }

  candidates.sort((a, b) => b.score - a.score || b.phrase.length - a.phrase.length);

  const out: string[] = [];
  const taken = new Set<string>();
  for (const c of candidates) {
    if (out.length >= topK) break;
    // Skip n-grams that are pure substrings of one already taken — adds no
    // search-space coverage.
    let isSubstring = false;
    for (const t of taken) {
      if (t.includes(c.phrase) || c.phrase.includes(t)) {
        isSubstring = true;
        break;
      }
    }
    if (isSubstring) continue;
    out.push(c.phrase);
    taken.add(c.phrase);
  }
  return out;
}
