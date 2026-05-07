import type { Locale } from './types.js';

/**
 * Locale-aware number / currency / date formatting using the platform
 * `Intl` APIs.
 *
 * Pure wrappers — every function takes the locale as a parameter and
 * returns a formatted string. No global state.
 */

export interface FormatNumberOptions {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  /** When set, format as currency in the given ISO 4217 code. */
  currency?: 'INR' | 'USD' | string;
}

export function formatNumber(
  value: number,
  locale: Locale,
  options: FormatNumberOptions = {},
): string {
  const intlOptions: Intl.NumberFormatOptions = {};
  if (options.minimumFractionDigits !== undefined) {
    intlOptions.minimumFractionDigits = options.minimumFractionDigits;
  }
  if (options.maximumFractionDigits !== undefined) {
    intlOptions.maximumFractionDigits = options.maximumFractionDigits;
  }
  if (options.currency) {
    intlOptions.style = 'currency';
    intlOptions.currency = options.currency;
  }
  return new Intl.NumberFormat(locale, intlOptions).format(value);
}

export function formatDate(
  value: Date | string | number,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
): string {
  const d = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat(locale, options).format(d);
}

export function formatRelativeTime(
  diffSeconds: number,
  locale: Locale,
  unit: Intl.RelativeTimeFormatUnit = 'second',
): string {
  return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(diffSeconds, unit);
}

/** Map a primary language to a sensible region default for INR
 *  formatting. en-IN uses Indian-lakh grouping; hi-IN / ta-IN / te-IN
 *  similarly. */
export function defaultRegionFor(language: string): string {
  switch (language) {
    case 'hi':
    case 'ta':
    case 'te':
      return `${language}-IN`;
    case 'en':
    default:
      return 'en-IN'; // QOrium primary market is India-first.
  }
}
