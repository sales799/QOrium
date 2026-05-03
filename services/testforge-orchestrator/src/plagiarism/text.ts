/**
 * Pure tokenisation helpers used by every plagiarism signal.
 */

const WORD_REGEX = /[a-zA-Z][a-zA-Z'-]*/g;
const SENTENCE_SPLIT = /(?<=[.!?])[\s\n]+(?=[A-Z(])|\n{2,}/g;

export function tokeniseWords(text: string): string[] {
  if (typeof text !== 'string' || text.length === 0) return [];
  return Array.from(text.matchAll(WORD_REGEX), (m) => m[0].toLowerCase());
}

export function splitSentences(text: string): string[] {
  if (typeof text !== 'string') return [];
  const trimmed = text.trim();
  if (trimmed.length === 0) return [];
  return trimmed
    .split(SENTENCE_SPLIT)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function ngrams(tokens: readonly string[], n: number): string[] {
  if (n <= 0 || tokens.length < n) return [];
  const out: string[] = [];
  for (let i = 0; i + n <= tokens.length; i++) {
    out.push(tokens.slice(i, i + n).join(' '));
  }
  return out;
}
