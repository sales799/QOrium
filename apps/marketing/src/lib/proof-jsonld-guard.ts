/**
 * Pure, dependency-free guards for embedding a remotely-fetched proof
 * JSON-LD document into a public marketing page <head>.
 *
 * The QOrium API exposes live, aggregate, anonymous schema.org Dataset
 * documents at /v1/proof/psychometrics.jsonld and /v1/proof/stats.jsonld.
 * Surfacing them inline lets AI answer engines and crawlers discover and
 * cite QOrium's real psychometric-coverage funnel without scraping HTML.
 *
 * Because the payload is fetched at request time, we never trust it blindly:
 * isDatasetJsonLd() proves it is a well-formed schema.org Dataset, and
 * safeJsonLdString() serialises it for dangerouslySetInnerHTML with the
 * closing-script-tag break-out sequence neutralised. Both are pure so they
 * are fully unit-testable with no network or DOM.
 */

export type DatasetJsonLd = {
  '@context': string;
  '@type': 'Dataset';
  name: string;
  [key: string]: unknown;
};

/**
 * Returns true only when `value` is a plain object that declares itself a
 * schema.org Dataset with a non-empty string name. Anything else (null,
 * arrays, error envelopes, wrong @type, HTML error pages parsed to junk)
 * is rejected so it never reaches the page head.
 */
export function isDatasetJsonLd(value: unknown): value is DatasetJsonLd {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  const record = value as Record<string, unknown>;
  if (record['@type'] !== 'Dataset') return false;
  if (typeof record['@context'] !== 'string' || record['@context'].trim() === '') {
    return false;
  }
  if (typeof record.name !== 'string' || record.name.trim() === '') {
    return false;
  }
  return true;
}

/**
 * Serialises a validated Dataset to a string safe for
 * dangerouslySetInnerHTML. JSON.stringify already escapes quotes; we
 * additionally break any literal closing-script sequence (case-insensitive)
 * so a malicious or accidental string field cannot close the script element.
 * Returns null if the payload is not a valid Dataset.
 */
export function safeJsonLdString(value: unknown): string | null {
  if (!isDatasetJsonLd(value)) return null;
  return JSON.stringify(value).replace(/<\/(script)/gi, '<\\/$1');
}
