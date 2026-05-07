import type { LanguageCode, Locale, ResolvedLocale, MessageBundle } from './types.js';
import { LANGUAGE_CODES } from './bundles.js';

/**
 * Locale resolution from an Accept-Language header value.
 *
 * Per RFC 9110 §12.5.4, Accept-Language is a comma-separated list of
 * language ranges with optional q-values:
 *
 *   Accept-Language: hi-IN,hi;q=0.9,en;q=0.8,en-IN;q=0.7
 *
 * We pick the highest-q range whose primary subtag is one of the
 * supported `LanguageCode`s; ties broken by source order.
 */

export interface AcceptLanguageRange {
  /** Lower-cased full range, e.g. `hi-in` or `*`. */
  tag: string;
  /** Quality value in [0, 1]. */
  q: number;
}

export function parseAcceptLanguage(header: string | undefined): AcceptLanguageRange[] {
  if (!header) return [];
  return header
    .split(',')
    .map((raw) => raw.trim())
    .filter((s) => s.length > 0)
    .map((entry, idx) => {
      const [tagPart = '', ...rest] = entry.split(';').map((p) => p.trim());
      let q = 1;
      for (const param of rest) {
        const eq = param.indexOf('=');
        if (eq < 0) continue;
        const key = param.slice(0, eq).trim().toLowerCase();
        const value = param.slice(eq + 1).trim();
        if (key === 'q') {
          const parsed = Number.parseFloat(value);
          if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 1) q = parsed;
        }
      }
      // Stable secondary sort key: subtract a tiny order-based epsilon so
      // ties favour the earlier range (preserves source order).
      return { tag: tagPart.toLowerCase(), q: q - idx * 1e-9 };
    })
    .filter((r) => r.tag.length > 0)
    .sort((a, b) => b.q - a.q);
}

/** Pick the best supported language for a given Accept-Language header
 *  + a default fallback (typically `en`). */
export function pickLanguage(
  header: string | undefined,
  fallback: LanguageCode = 'en',
): LanguageCode {
  const ranges = parseAcceptLanguage(header);
  for (const r of ranges) {
    if (r.q === 0) continue;
    if (r.tag === '*') return fallback;
    const primary = r.tag.split('-')[0];
    if (primary && (LANGUAGE_CODES as ReadonlyArray<string>).includes(primary)) {
      return primary as LanguageCode;
    }
  }
  return fallback;
}

/** Build a resolved locale carrying the bundle chain (target language ->
 *  English). Used by the translator. */
export function resolveLocale(
  locale: Locale,
  bundles: Record<LanguageCode, MessageBundle>,
): ResolvedLocale {
  const lower = locale.toLowerCase();
  const primary = (lower.split('-')[0] ?? 'en') as LanguageCode;
  const language: LanguageCode = (LANGUAGE_CODES as ReadonlyArray<string>).includes(primary)
    ? primary
    : 'en';

  // Build the chain: target language first, English last (canonical
  // fallback). Skip duplicates (`en` requested → just one entry).
  const chain: Array<{ language: LanguageCode; bundle: MessageBundle }> = [];
  const target = bundles[language];
  if (target) chain.push({ language, bundle: target });
  if (language !== 'en' && bundles.en) {
    chain.push({ language: 'en', bundle: bundles.en });
  }
  return { locale, language, bundleChain: chain };
}
