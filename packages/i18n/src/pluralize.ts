import type { LanguageCode } from './types.js';

/**
 * CLDR-aligned plural categories. Keys in bundles use suffix
 * conventions like `result.summary_one` / `result.summary_other`.
 *
 * v0 supports the categories that occur in en/hi/ta/te:
 *   one    — singular
 *   other  — everything else
 *
 * `few` / `many` / `two` / `zero` aren't used by these languages for
 * the cardinal-number cases QOrium ships; if a future locale needs
 * them, extend `pluralCategory` with the CLDR rule for that locale.
 */
export type PluralCategory = 'one' | 'other';

/** Pick the plural category for a given count + language. Defaults to
 *  English-style rules when the language is unknown. */
export function pluralCategory(language: LanguageCode, n: number): PluralCategory {
  const i = Math.abs(Math.trunc(n));
  switch (language) {
    case 'en':
      // CLDR: one when n == 1, else other.
      return i === 1 ? 'one' : 'other';
    case 'hi':
      // CLDR: one when 0 ≤ n ≤ 1, else other (Hindi groups 0 with singular).
      return i === 0 || i === 1 ? 'one' : 'other';
    case 'ta':
      // CLDR: one when n == 1, else other.
      return i === 1 ? 'one' : 'other';
    case 'te':
      // CLDR: one when n == 1, else other.
      return i === 1 ? 'one' : 'other';
    default:
      return i === 1 ? 'one' : 'other';
  }
}

/** Resolve the actual key to look up in a bundle for a count value.
 *  Tries `key_one` / `key_other` first; falls back to the bare key for
 *  callers that don't have plural variants. */
export function pluralKey(baseKey: string, language: LanguageCode, count: number): string[] {
  const cat = pluralCategory(language, count);
  return [`${baseKey}_${cat}`, `${baseKey}_other`, baseKey];
}
