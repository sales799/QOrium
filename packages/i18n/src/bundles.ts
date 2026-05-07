import type { LanguageCode, MessageBundle } from './types.js';
import enRaw from './bundles/en.json' with { type: 'json' };
import hiRaw from './bundles/hi.json' with { type: 'json' };
import taRaw from './bundles/ta.json' with { type: 'json' };
import teRaw from './bundles/te.json' with { type: 'json' };

/**
 * Static bundle registry.
 *
 * Bundles are JSON, validated structurally at load time. The `$meta`
 * key is reserved for documentation and is stripped before the bundle
 * is exposed to translators.
 *
 * To onboard a new language:
 *   1. Add the language code to `LANGUAGE_CODES`
 *   2. Create `bundles/<lang>.json` (start by copying en.json)
 *   3. Mark every key `pending` until a native reviewer signs off
 *   4. Re-export here
 *   5. Add a CLDR plural rule case in `pluralize.ts`
 *   6. Submit for IP-counsel + CDO review (per Constitution Article VII Pillar D)
 */

export const LANGUAGE_CODES = ['en', 'hi', 'ta', 'te'] as const;

function stripMeta(raw: unknown): MessageBundle {
  if (raw === null || typeof raw !== 'object') return {};
  const result: MessageBundle = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (key.startsWith('$')) continue;
    if (typeof value === 'string') {
      result[key] = value;
    } else if (
      value !== null &&
      typeof value === 'object' &&
      'text' in value &&
      typeof (value as { text: unknown }).text === 'string'
    ) {
      const v = value as { text: string; status?: 'verified' | 'pending' };
      result[key] = { text: v.text, status: v.status ?? 'pending' };
    }
  }
  return result;
}

export const BUNDLES: Record<LanguageCode, MessageBundle> = {
  en: stripMeta(enRaw),
  hi: stripMeta(hiRaw),
  ta: stripMeta(taRaw),
  te: stripMeta(teRaw),
};

export function getBundle(language: LanguageCode): MessageBundle {
  return BUNDLES[language] ?? {};
}
