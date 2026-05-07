/**
 * @qorium/i18n — pure-TS i18n framework.
 *
 * Sprint 2.3 per `governance/Auto-Mode-Remote-Plan-v1.md` §4 Phase D.
 *
 * Public API:
 *   parseAcceptLanguage / pickLanguage / resolveLocale  — Accept-Language
 *   translate / lookup / coverage                       — message lookup
 *   pluralCategory / pluralKey                          — CLDR rules
 *   formatNumber / formatDate / formatRelativeTime      — Intl wrappers
 *   defaultRegionFor                                    — language → region
 *   BUNDLES / getBundle / LANGUAGE_CODES                — static registry
 *
 * The framework ships with English as the canonical source and Hindi /
 * Tamil / Telugu as pending stubs that fall back to English at runtime.
 * Native-speaker reviewers must replace each stub and flip the message
 * status from `pending` to `verified` before deploy. This pattern
 * mirrors `@qorium/nos-mapper` and `@qorium/billing` SAC verification.
 */
export type {
  BundleMessage,
  CoverageReport,
  LanguageCode,
  Locale,
  MessageBundle,
  ResolvedLocale,
  TranslationParams,
  TranslationStatus,
} from './types.js';
export type { AcceptLanguageRange } from './resolver.js';
export { parseAcceptLanguage, pickLanguage, resolveLocale } from './resolver.js';
export { pluralCategory, pluralKey, type PluralCategory } from './pluralize.js';
export {
  defaultRegionFor,
  formatDate,
  formatNumber,
  formatRelativeTime,
  type FormatNumberOptions,
} from './format.js';
export { coverage, lookup, translate, type TranslateOptions } from './translator.js';
export { BUNDLES, LANGUAGE_CODES, getBundle } from './bundles.js';
