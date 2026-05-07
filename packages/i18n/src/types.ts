/**
 * Shared types for the QOrium i18n framework.
 *
 * Locales follow IETF BCP 47 (e.g. `en`, `en-IN`, `hi`, `hi-IN`).
 * The framework normalises to the language subtag for matching, then
 * uses the regional variant for `Intl.NumberFormat` / `Intl.DateTimeFormat`.
 */

/** Supported locales in v0. Extend `LANGUAGE_CODES` and add a bundle JSON
 *  to onboard a new locale. */
export type LanguageCode = 'en' | 'hi' | 'ta' | 'te';

/** Locale = language [+ region]. We keep this open for forward-compatibility
 *  with regional variants like en-IN. */
export type Locale = string;

/** Translation status of a single message in a bundle. */
export type TranslationStatus = 'verified' | 'pending';

/** A single message in a bundle. The simple string form is sugar for a
 *  pending stub that auto-falls-back to English. */
export interface BundleMessage {
  text: string;
  status: TranslationStatus;
}

/** A loaded bundle = map of dotted-path keys to either string (verified)
 *  or `BundleMessage` (with explicit status). */
export type MessageBundle = Record<string, string | BundleMessage>;

/** Parameters for interpolation. Numeric values feed pluralization. */
export type TranslationParams = Record<string, string | number>;

/** Resolved locale + bundle stack, with English as the implicit fallback
 *  for any missing or `pending` keys. */
export interface ResolvedLocale {
  locale: Locale;
  language: LanguageCode;
  /** `en` is always last so unresolved keys still produce text. */
  bundleChain: ReadonlyArray<{ language: LanguageCode; bundle: MessageBundle }>;
}

/** Coverage report — used by the admin console to flag which keys still
 *  need translation in each language. */
export interface CoverageReport {
  language: LanguageCode;
  totalKeys: number;
  verifiedKeys: number;
  pendingKeys: number;
  missingKeys: string[];
}
