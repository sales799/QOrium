import { describe, expect, it } from 'vitest';
import {
  BUNDLES,
  coverage,
  defaultRegionFor,
  formatDate,
  formatNumber,
  getBundle,
  LANGUAGE_CODES,
  parseAcceptLanguage,
  pickLanguage,
  pluralCategory,
  pluralKey,
  resolveLocale,
  translate,
} from '../src/index.js';
import type { LanguageCode, MessageBundle } from '../src/index.js';

describe('parseAcceptLanguage', () => {
  it('returns an empty list for missing/empty header', () => {
    expect(parseAcceptLanguage(undefined)).toEqual([]);
    expect(parseAcceptLanguage('')).toEqual([]);
  });

  it('parses ranges with q-values and sorts descending', () => {
    const out = parseAcceptLanguage('hi-IN,hi;q=0.9,en;q=0.8,en-IN;q=0.7');
    expect(out[0]?.tag).toBe('hi-in');
    expect(out[0]?.q).toBe(1);
    expect(out[1]?.tag).toBe('hi');
    expect(out[1]?.q).toBeCloseTo(0.9, 8);
    // Stable sort — last entry is en-in with q=0.7.
    expect(out[out.length - 1]?.tag).toBe('en-in');
  });

  it('treats invalid q-values as 1', () => {
    const out = parseAcceptLanguage('en;q=foo');
    expect(out[0]?.q).toBe(1);
  });
});

describe('pickLanguage', () => {
  it('picks the highest-q supported language', () => {
    expect(pickLanguage('hi-IN,hi;q=0.9,en;q=0.8')).toBe('hi');
    expect(pickLanguage('en-US,en;q=0.9')).toBe('en');
    expect(pickLanguage('ta;q=1,hi;q=0.5')).toBe('ta');
  });

  it('falls back to English for unsupported languages', () => {
    expect(pickLanguage('fr,de;q=0.9')).toBe('en');
    expect(pickLanguage('jp')).toBe('en');
  });

  it('falls back to English for missing header', () => {
    expect(pickLanguage(undefined)).toBe('en');
    expect(pickLanguage('')).toBe('en');
  });

  it('skips q=0 ranges', () => {
    expect(pickLanguage('hi;q=0,en;q=0.5')).toBe('en');
  });

  it('treats `*` as the fallback', () => {
    expect(pickLanguage('*', 'hi')).toBe('hi');
  });
});

describe('resolveLocale', () => {
  it('builds a chain with the target language followed by English', () => {
    const r = resolveLocale('hi-IN', BUNDLES);
    expect(r.language).toBe('hi');
    expect(r.bundleChain.length).toBe(2);
    expect(r.bundleChain[0]?.language).toBe('hi');
    expect(r.bundleChain[1]?.language).toBe('en');
  });

  it('returns a single-entry chain for `en`', () => {
    const r = resolveLocale('en', BUNDLES);
    expect(r.bundleChain.length).toBe(1);
    expect(r.bundleChain[0]?.language).toBe('en');
  });

  it('falls back to en when the locale is unsupported', () => {
    const r = resolveLocale('fr-FR', BUNDLES);
    expect(r.language).toBe('en');
  });
});

describe('translate', () => {
  it('returns the verified English message for a known key', () => {
    const r = resolveLocale('en', BUNDLES);
    expect(translate('common.yes', r)).toBe('Yes');
    expect(translate('auth.login.title', r)).toBe('Sign in to QOrium');
  });

  it('returns the key itself for an unknown key', () => {
    const r = resolveLocale('en', BUNDLES);
    expect(translate('does.not.exist', r)).toBe('does.not.exist');
  });

  it('falls back to English when the target language entry is pending', () => {
    // Hindi `auth.login.email` is `pending`, so target stays English.
    const r = resolveLocale('hi', BUNDLES);
    expect(translate('auth.login.email', r)).toBe('Email');
  });

  it('uses target-language verified entries when present (synthetic)', () => {
    const synthetic: Record<LanguageCode, MessageBundle> = {
      en: { 'greeting.hello': 'Hello' },
      hi: { 'greeting.hello': { text: 'नमस्ते', status: 'verified' } },
      ta: {},
      te: {},
    };
    const r = resolveLocale('hi', synthetic);
    expect(translate('greeting.hello', r)).toBe('नमस्ते');
  });

  it('interpolates {param} placeholders', () => {
    const r = resolveLocale('en', BUNDLES);
    expect(
      translate('auth.errors.account_locked', r, {
        params: { minutes: 15 },
      }),
    ).toBe('Your account is locked. Try again after 15 minutes.');
  });

  it('leaves unknown placeholders intact', () => {
    const synthetic: Record<LanguageCode, MessageBundle> = {
      en: { 'msg.test': 'Hello {name}' },
      hi: {},
      ta: {},
      te: {},
    };
    const r = resolveLocale('en', synthetic);
    expect(translate('msg.test', r)).toBe('Hello {name}');
  });

  it('selects plural variants based on count', () => {
    const r = resolveLocale('en', BUNDLES);
    expect(translate('result.summary', r, { count: 1 })).toBe('1 question reviewed');
    expect(translate('result.summary', r, { count: 5 })).toBe('5 questions reviewed');
  });

  it('falls back to _other when _one is missing', () => {
    const synthetic: Record<LanguageCode, MessageBundle> = {
      en: { thing_other: '{count} things' },
      hi: {},
      ta: {},
      te: {},
    };
    const r = resolveLocale('en', synthetic);
    expect(translate('thing', r, { count: 1 })).toBe('1 things');
  });
});

describe('plural rules', () => {
  it('English: 1 → one, else → other', () => {
    expect(pluralCategory('en', 1)).toBe('one');
    expect(pluralCategory('en', 0)).toBe('other');
    expect(pluralCategory('en', 2)).toBe('other');
  });

  it('Hindi: 0 and 1 → one, else → other', () => {
    expect(pluralCategory('hi', 0)).toBe('one');
    expect(pluralCategory('hi', 1)).toBe('one');
    expect(pluralCategory('hi', 5)).toBe('other');
  });

  it('Tamil: 1 → one, else → other', () => {
    expect(pluralCategory('ta', 1)).toBe('one');
    expect(pluralCategory('ta', 7)).toBe('other');
  });

  it('Telugu: 1 → one, else → other', () => {
    expect(pluralCategory('te', 1)).toBe('one');
    expect(pluralCategory('te', 0)).toBe('other');
  });

  it('returns ordered candidate keys for plural lookup', () => {
    const keys = pluralKey('result.summary', 'en', 5);
    expect(keys[0]).toBe('result.summary_other');
    expect(keys).toContain('result.summary');
  });
});

describe('coverage', () => {
  it('reports 100% verified for English (canonical)', () => {
    const r = coverage('en', BUNDLES.en, BUNDLES.en);
    expect(r.totalKeys).toBeGreaterThan(0);
    expect(r.verifiedKeys).toBe(r.totalKeys);
    expect(r.pendingKeys).toBe(0);
    expect(r.missingKeys).toEqual([]);
  });

  it('reports pending + missing keys for Hindi (most keys absent)', () => {
    const r = coverage('hi', BUNDLES.hi, BUNDLES.en);
    expect(r.totalKeys).toBe(coverage('en', BUNDLES.en, BUNDLES.en).totalKeys);
    expect(r.verifiedKeys).toBe(0);
    expect(r.pendingKeys).toBeGreaterThan(0);
    expect(r.missingKeys.length).toBeGreaterThan(0);
  });

  it('reports all-missing for Tamil + Telugu (framework-only stubs)', () => {
    const ta = coverage('ta', BUNDLES.ta, BUNDLES.en);
    const te = coverage('te', BUNDLES.te, BUNDLES.en);
    expect(ta.verifiedKeys).toBe(0);
    expect(te.verifiedKeys).toBe(0);
  });
});

describe('format', () => {
  it('formats numbers with locale-aware grouping', () => {
    expect(formatNumber(100_000, 'en-IN')).toBe('1,00,000');
    expect(formatNumber(100_000, 'en-US')).toBe('100,000');
  });

  it('formats currency in INR', () => {
    expect(formatNumber(50_000, 'en-IN', { currency: 'INR' })).toContain('₹');
  });

  it('formats currency in USD', () => {
    expect(formatNumber(50_000, 'en-US', { currency: 'USD' })).toContain('$');
  });

  it('formats dates', () => {
    const out = formatDate(new Date('2026-05-07T00:00:00Z'), 'en-IN', { dateStyle: 'medium' });
    expect(typeof out).toBe('string');
    expect(out.length).toBeGreaterThan(0);
  });

  it('default region is locale-IN for Indian languages', () => {
    expect(defaultRegionFor('hi')).toBe('hi-IN');
    expect(defaultRegionFor('ta')).toBe('ta-IN');
    expect(defaultRegionFor('te')).toBe('te-IN');
    expect(defaultRegionFor('en')).toBe('en-IN');
  });
});

describe('LANGUAGE_CODES + getBundle', () => {
  it('exposes the supported language list', () => {
    expect(LANGUAGE_CODES).toContain('en');
    expect(LANGUAGE_CODES).toContain('hi');
    expect(LANGUAGE_CODES).toContain('ta');
    expect(LANGUAGE_CODES).toContain('te');
  });

  it('getBundle returns the bundle for each language', () => {
    expect(Object.keys(getBundle('en')).length).toBeGreaterThan(0);
    // ta + te are stub bundles with no keys; getBundle still returns an object.
    expect(typeof getBundle('ta')).toBe('object');
  });
});
