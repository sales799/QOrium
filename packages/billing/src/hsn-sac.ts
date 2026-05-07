import type { SacCode, Sku } from './types.js';

/**
 * HSN / SAC mapping per QOrium SKU.
 *
 * SAC = Service Accounting Code (India GST). The 6-digit codes below are
 * **structurally correct** (CBIC-published 998-series for IT services)
 * but each entry is `verification: 'pending'` until GST counsel
 * cross-checks against the latest CBIC notification. Counsel sign-off
 * flips them to `verified` via a small data-only follow-up PR — same
 * pattern as `@qorium/nos-mapper`.
 *
 * For non-India invoices, HSN/SAC is not legally required; it is
 * still emitted on USD invoices for consistency and is harmless.
 *
 * References:
 *   - CBIC GST rate notification (Service Accounting Codes 99-series)
 *   - GST Council 6-digit SAC schedule (Annexure to Notification 11/2017)
 */
export const SAC_BY_SKU: Readonly<Record<Sku, SacCode>> = {
  readybank: {
    code: '998314',
    title: 'Information technology consulting and support services',
    verification: 'pending',
  },
  'jd-forge': {
    code: '998313',
    title: 'Information technology design and development services',
    verification: 'pending',
  },
  'stack-vault': {
    code: '998319',
    title: 'Other information technology services (custom IP-protected libraries)',
    verification: 'pending',
  },
};

export function sacForSku(sku: Sku): SacCode {
  return SAC_BY_SKU[sku];
}

/** All known SAC entries — useful for tax-counsel review reports. */
export const SAC_ENTRIES: ReadonlyArray<SacCode & { sku: Sku }> = (
  Object.entries(SAC_BY_SKU) as ReadonlyArray<[Sku, SacCode]>
).map(([sku, sac]) => ({ ...sac, sku }));
