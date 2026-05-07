import type {
  BundleMessage,
  CoverageReport,
  LanguageCode,
  MessageBundle,
  ResolvedLocale,
  TranslationParams,
} from './types.js';
import { pluralKey } from './pluralize.js';

/**
 * Translation core — maps a key + locale + params into a rendered
 * string.
 *
 * Resolution order for a given key:
 *   1. Walk the resolved locale's bundle chain (target language first,
 *      English last). For each bundle, prefer a message with status
 *      `verified`.
 *   2. If only `pending` translations exist, the resolver still returns
 *      the English fallback when the chain has English at the end. This
 *      is intentional — pending stubs never reach end users.
 *   3. If no bundle has the key, return the key itself (debuggable).
 *
 * Parameter interpolation uses `{name}` braces; numeric `count` triggers
 * pluralisation when key suffixes `_one`/`_other` are present.
 */

function lookupBundleEntry(
  bundle: MessageBundle,
  key: string,
): { text: string; status: BundleMessage['status'] } | null {
  const raw = bundle[key];
  if (raw === undefined) return null;
  if (typeof raw === 'string') return { text: raw, status: 'verified' };
  return { text: raw.text, status: raw.status };
}

function lookupAcrossChain(
  chain: ResolvedLocale['bundleChain'],
  candidates: ReadonlyArray<string>,
): { text: string; from: LanguageCode; status: BundleMessage['status'] } | null {
  // First pass: prefer verified entries in the target language. A
  // pending entry in the target loses to a verified entry in English.
  for (const { language, bundle } of chain) {
    for (const key of candidates) {
      const entry = lookupBundleEntry(bundle, key);
      if (entry && entry.status === 'verified') {
        return { ...entry, from: language };
      }
    }
  }
  // Second pass: accept pending entries (this happens when the English
  // bundle itself marks something pending, which shouldn't but might).
  for (const { language, bundle } of chain) {
    for (const key of candidates) {
      const entry = lookupBundleEntry(bundle, key);
      if (entry) return { ...entry, from: language };
    }
  }
  return null;
}

function interpolate(template: string, params?: TranslationParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_match, name: string) => {
    const v = params[name];
    return v === undefined ? `{${name}}` : String(v);
  });
}

export interface TranslateOptions {
  /** Used by plural-key resolution. Equivalent to `params.count`. */
  count?: number;
  params?: TranslationParams;
  /** When false, `pending` entries are treated as missing and the
   *  resolver continues to the next bundle. Default true. */
  acceptPending?: boolean;
}

export function translate(
  key: string,
  resolved: ResolvedLocale,
  options: TranslateOptions = {},
): string {
  const acceptPending = options.acceptPending ?? true;
  const params = options.params;

  const candidates =
    options.count !== undefined ? pluralKey(key, resolved.language, options.count) : [key];

  // Plural lookup: first try verified entries; if `acceptPending=false`
  // skip pending; otherwise fall through.
  for (const { language, bundle } of resolved.bundleChain) {
    for (const candidate of candidates) {
      const entry = lookupBundleEntry(bundle, candidate);
      if (!entry) continue;
      if (entry.status === 'pending' && !acceptPending) continue;
      // Verified always wins; pending wins only when there's no later
      // verified entry in English.
      if (entry.status === 'verified' || language === 'en') {
        return interpolate(entry.text, {
          ...(options.count !== undefined ? { count: options.count } : {}),
          ...params,
        });
      }
    }
  }

  // No verified, no English. Last resort: any pending entry from the
  // target language (so the framework still produces text).
  for (const { bundle } of resolved.bundleChain) {
    for (const candidate of candidates) {
      const entry = lookupBundleEntry(bundle, candidate);
      if (entry) {
        return interpolate(entry.text, {
          ...(options.count !== undefined ? { count: options.count } : {}),
          ...params,
        });
      }
    }
  }

  return candidates[0] ?? key;
}

/** Coverage diagnostics — used by the admin console (Sprint 4 admin)
 *  to surface which keys still need human review per language. */
export function coverage(
  language: LanguageCode,
  bundle: MessageBundle,
  reference: MessageBundle,
): CoverageReport {
  let verified = 0;
  let pending = 0;
  const missing: string[] = [];

  for (const key of Object.keys(reference)) {
    if (key.startsWith('$')) continue; // skip $meta etc
    const entry = bundle[key];
    if (entry === undefined) {
      missing.push(key);
    } else if (typeof entry === 'string') {
      verified += 1;
    } else if (entry.status === 'verified') {
      verified += 1;
    } else {
      pending += 1;
    }
  }

  return {
    language,
    totalKeys: Object.keys(reference).filter((k) => !k.startsWith('$')).length,
    verifiedKeys: verified,
    pendingKeys: pending,
    missingKeys: missing,
  };
}

/** Lookup a single message verbatim without interpolation. Useful for
 *  the admin coverage view. */
export function lookup(
  key: string,
  bundle: MessageBundle,
): { text: string; status: BundleMessage['status'] } | null {
  return lookupBundleEntry(bundle, key);
}

// Internal helper exported for tests + lookupAcrossChain consumers.
export const _internal = { lookupAcrossChain, interpolate };
